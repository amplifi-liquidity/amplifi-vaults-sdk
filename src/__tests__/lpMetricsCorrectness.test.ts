/* eslint-env jest */
import { JsonRpcProvider } from 'ethers';
import { SupportedChainId, SupportedDex } from '../types';
import { getLpApr, getLpPriceChange } from '../functions/calculateApr';
import { getVaultMetrics } from '../functions/vaultMetrics';
import * as priceFromPool from '../functions/priceFromPool';
import * as vaultEvents from '../functions/_vaultEvents';
import * as contracts from '../contracts';
import cache from '../utils/cache';

const ONE = 10n ** 18n;
// Cached vault info carries a subgraph totalSupply that is stale relative to the live vault.
const cachedVault = {
  id: '0x1111111111111111111111111111111111111111',
  tokenA: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  tokenB: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  allowTokenA: true,
  allowTokenB: false,
  decimals0: 18,
  decimals1: 18,
  totalSupply: (4n * ONE).toString(),
};

jest.mock('../functions/vault', () => ({
  validateVaultData: jest.fn(async (_address: string, provider: JsonRpcProvider) => ({
    chainId: Number((await provider.getNetwork()).chainId),
    vault: cachedVault,
  })),
}));
jest.mock('../functions/_totalBalances', () => ({ getTokenDecimals: jest.fn(async () => 18) }));
jest.mock('../functions/priceFromPool', () => ({ getCurrLpPrice: jest.fn(), getSqrtPriceFromPool: jest.fn() }));
jest.mock('../functions/_vaultEvents', () => ({
  _getAllVaultEvents: jest.fn(async () => []),
  getVaultStateAt: jest.fn(),
  _getRebalances: jest.fn(async () => []),
  _getFeesCollectedEvents: jest.fn(async () => []),
  _getDeposits: jest.fn(async () => []),
  _getWithdraws: jest.fn(async () => []),
}));
jest.mock('../contracts', () => ({ getIchiVaultContract: jest.fn() }));
jest.mock('../utils/getGraphUrls', () => ({ getGraphUrls: jest.fn() }));

const initialTime = Date.parse('2026-10-06T08:00:00.000Z');
let now: number;
const provider = (chain: number) =>
  ({
    getNetwork: async () => ({ chainId: BigInt(chain) }),
  } as unknown as JsonRpcProvider);
const currLpPrice = priceFromPool.getCurrLpPrice as jest.Mock;

beforeEach(() => {
  cache.flushAll();
  now = initialTime;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  // Historical LP price of exactly 1 (one token0 of TVL per LP token), observed 10 days ago.
  (vaultEvents.getVaultStateAt as jest.Mock).mockImplementation(() => ({
    totalAmount0: ONE.toString(),
    totalAmount1: '0',
    sqrtPrice: (2n ** 96n).toString(),
    totalSupply: ONE.toString(),
    createdAtTimestamp: String((initialTime - 10 * 24 * 60 * 60 * 1000) / 1000),
  }));
  currLpPrice.mockReset();
});
afterEach(() => {
  cache.flushAll();
  jest.restoreAllMocks();
});

const helpers = [
  { name: 'getLpApr', read: getLpApr },
  { name: 'getLpPriceChange', read: getLpPriceChange },
];

helpers.forEach(({ name, read }) => {
  const at = (chain: number, intervals?: number[]) =>
    read(cachedVault.id, provider(chain), SupportedDex.Reservoir, intervals);

  test(`${name}: cache lives for 30 minutes`, async () => {
    currLpPrice.mockResolvedValueOnce(1.1).mockResolvedValueOnce(1.2);
    const first = await at(SupportedChainId.ink);
    now += 30 * 60 * 1000 - 1;
    expect(await at(SupportedChainId.ink)).toEqual(first);
    expect(currLpPrice).toHaveBeenCalledTimes(1);
    now += 2;
    expect(await at(SupportedChainId.ink)).not.toEqual(first);
    expect(currLpPrice).toHaveBeenCalledTimes(2);
  });

  test(`${name}: chain and the ordered interval list are part of the cache identity`, async () => {
    currLpPrice.mockResolvedValueOnce(1.1).mockResolvedValueOnce(1.2).mockResolvedValue(1.3);
    const intervals = (rows: ({ timeInterval: number } | null)[]) => rows.map((r) => r?.timeInterval);

    const ink = await at(SupportedChainId.ink, [7, 30]);
    const base = await at(SupportedChainId.base, [7, 30]);
    expect(base).not.toEqual(ink);
    expect(currLpPrice).toHaveBeenCalledTimes(2);

    expect(intervals(await at(SupportedChainId.ink, [30, 7]))).toEqual([30, 7]);
    expect(intervals(await at(SupportedChainId.ink))).toEqual([1, 7, 30]);
    expect(currLpPrice).toHaveBeenCalledTimes(4);
    expect(await at(SupportedChainId.ink, [7, 30])).toEqual(ink);
    expect(currLpPrice).toHaveBeenCalledTimes(4);
  });
});

test('getVaultMetrics prices the LP with live totalSupply, not the cached vault-info supply', async () => {
  const totalSupply = jest.fn(async () => ONE);
  (contracts.getIchiVaultContract as jest.Mock).mockReturnValue({
    getTotalAmounts: async () => ({ total0: 2n * ONE, total1: 0n }),
    pool: async () => '0xpool',
    totalSupply,
  });
  (priceFromPool.getSqrtPriceFromPool as jest.Mock).mockResolvedValue(2n ** 96n);

  const [metrics] = await getVaultMetrics(cachedVault.id, provider(SupportedChainId.ink), SupportedDex.Reservoir, [7]);

  expect(totalSupply).toHaveBeenCalledTimes(1);
  // Live LP price is 2 (TVL 2 / supply 1) against a historical price of 1: +100%.
  // The stale cached supply of 4 would have produced 0.5, i.e. -50%.
  expect(metrics?.lpPriceChange).toBeCloseTo(100);
});
