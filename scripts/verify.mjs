/**
 * yarn verify: the full check, locally and in CI. This repo is small, so it
 * always runs everything: typechain codegen, lint, typecheck (src + tests),
 * build, then the hermetic jest suite (index.test.ts stays behind LIVE_TESTS).
 *
 * Exit codes: 0 green; 1 a check failed; 4 flaky (a test file failed in the
 * batch but passed when re-run alone: reported, never green).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXIT = { passed: 0, failed: 1, flaky: 4 };
const SEVERITY = ['failed', 'flaky', 'passed'];

function run(command, args) {
  console.log(`\n$ ${[command, ...args].join(' ')}`);
  return spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' }).status ?? 1;
}

const jest = args => run('yarn', ['jest', '--runInBand', '--forceExit', '--ci', ...args]);

/** Runs the jest suite; failing files are re-run alone so a flake is reported as flaky, not green. */
function runTests() {
  const dir = mkdtempSync(join(tmpdir(), 'verify-'));
  const report = join(dir, 'jest.json');
  try {
    const code = jest(['--json', `--outputFile=${report}`]);
    if (!existsSync(report)) {
      console.log('\nverify: jest wrote no report (crash before results): failed');
      return 'failed';
    }
    const result = JSON.parse(readFileSync(report, 'utf8'));
    console.log(`\nverify: jest ran ${result.numTotalTestSuites} file(s), ${result.numTotalTests} test(s)`);
    // Never pass on an empty run (a broken testRegex or ignore pattern would otherwise be green).
    if (!result.numTotalTestSuites || !result.numTotalTests) return 'failed';
    const failing = result.testResults.filter(file => file.status !== 'passed').map(file => relative(ROOT, file.name));
    if (code === 0 && failing.length === 0) return 'passed';
    // A non-zero exit with no failing file means a failure outside any test file
    // (config error, crash, open handle): never call that flaky.
    if (failing.length === 0) return 'failed';
    console.log(`\nverify: re-running ${failing.length} failing file(s) alone to separate flakes from failures`);
    return failing.every(file => jest(['--runTestsByPath', file]) === 0) ? 'flaky' : 'failed';
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const status = code => (code === 0 ? 'passed' : 'failed');
const stages = [
  ['generate', () => status(run('yarn', ['generate']))],
  ['lint', () => status(run('yarn', ['lint']))],
  ['typecheck', () => status(run('yarn', ['typecheck']))],
  ['build', () => status(run('yarn', ['build']))],
  ['tests', runTests],
];

const results = [];
for (const [name, check] of stages) {
  // Everything after codegen reads abis/types; without it the rest only adds noise.
  if (name !== 'generate' && results[0][1] !== 'passed') {
    results.push([name, 'skipped']);
    continue;
  }
  results.push([name, check()]);
}
console.log('\nverify summary:');
for (const [name, outcome] of results) console.log(`  ${outcome.padEnd(7)} ${name}`);
const worst = results.some(([, o]) => o === 'skipped') ? 'failed' : SEVERITY.find(o => results.some(([, r]) => r === o));
if (worst !== 'passed') console.log(`verify: ${worst} (exit ${EXIT[worst]})`);
process.exitCode = EXIT[worst];
