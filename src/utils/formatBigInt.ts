// eslint-disable-next-line import/no-extraneous-dependencies
import { BigNumber as BN } from 'bignumber.js';

export default function formatBigInt(value: number | string | bigint, decimals: number = 18): string {
  const bigVal = new BN(value.toString());
  return bigVal.shiftedBy(-decimals).toFixed();
}
