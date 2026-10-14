/* eslint-env jest */
import formatBigInt from '../utils/formatBigInt';

test.each([
  [2n, 18, '0.000000000000000002'],
  [-2n, 18, '-0.000000000000000002'],
  [1n, 24, '0.000000000000000000000001'],
  [1230000n, 6, '1.23'],
  [0n, 18, '0'],
])('formatBigInt(%s, %s) preserves fixed-point precision', (raw, decimals, expected) => {
  expect(formatBigInt(raw, decimals)).toBe(expected);
});
