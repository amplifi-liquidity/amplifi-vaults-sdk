module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  testRegex: '/__tests__/.*\\.(test|spec)?\\.(ts|tsx)$',
  // index.test.ts reads live chains with a funded wallet (PROVIDER_URL, PRIVATE_KEY, ACCOUNT).
  // Keep `npm test` hermetic so it can gate publishing; run it explicitly via `npm run test:live`.
  testPathIgnorePatterns: process.env.LIVE_TESTS
    ? ['/node_modules/']
    : ['/node_modules/', '/__tests__/index\\.test\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/{!(index),}.ts'],
  testTimeout: 30000,
  injectGlobals: true,
};
