/* eslint-env jest */
import { SupportedChainId, SupportedDex } from '../types';
import { getAllRewardVaults, getIchiVaultInfo, getVaultsByPool, getVaultsByTokens } from '../functions/vault';
import { getAllRewardInfo, getRewardInfo } from '../functions/rewardInfo';
import { getTokenDecimals } from '../functions/_totalBalances';
import cache from '../utils/cache';
import * as requests from '../graphql/functions';
import * as contracts from '../contracts';

jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: (chain: number, dex: string) => ({
    url: `fixture:${chain}:${dex}`,
    publishedUrl: undefined,
    version: 2,
    isAmplifiHosted: false,
  }),
}));
jest.mock('../utils/isVelodrome', () => ({ isMfdEnabled: () => true }));
jest.mock('../graphql/functions', () => ({ graphqlRequest: jest.fn() }));
jest.mock('../contracts', () => ({ getERC20Contract: jest.fn(), getIchiVaultContract: jest.fn() }));

const address = '0x1111111111111111111111111111111111111111';
const other = '0x2222222222222222222222222222222222222222';
const initialTime = Date.parse('2026-10-06T08:00:00.000Z');
const HOUR = 60 * 60 * 1000;
let now: number;
let requestCount: number;
const graphqlRequest = requests.graphqlRequest as jest.Mock;

beforeEach(() => {
  cache.flushAll();
  requestCount = 0;
  // Each source request answers with a unique tag so cached reuse is observable.
  graphqlRequest.mockReset().mockImplementation(async (url: string) => {
    requestCount += 1;
    const id = `${url}#${requestCount}`;
    return {
      ichiVault: { id, token0: 'a', token1: 'b', allowToken0: true, allowToken1: false },
      ichiVaults: [{ id, allowTokenA: true, allowTokenB: true }],
      deployICHIVaults: [id],
    };
  });
  now = initialTime;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});
afterEach(() => {
  cache.flushAll();
  jest.restoreAllMocks();
});

type Reader = (chain: SupportedChainId, dex: SupportedDex) => Promise<string>;

const cases: { name: string; read: Reader; ttlMs: number }[] = [
  {
    name: 'getIchiVaultInfo',
    read: async (chain, dex) => (await getIchiVaultInfo(chain, dex, address)).id,
    ttlMs: 6 * HOUR,
  },
  { name: 'getRewardInfo', read: async (chain, dex) => (await getRewardInfo(chain, dex, address)).id, ttlMs: 6 * HOUR },
  { name: 'getAllRewardInfo', read: async (chain, dex) => (await getAllRewardInfo(chain, dex))[0].id, ttlMs: 6 * HOUR },
  {
    name: 'getVaultsByTokens',
    read: async (chain, dex) => (await getVaultsByTokens(chain, dex, address, other))[0].id,
    ttlMs: HOUR,
  },
  { name: 'getVaultsByPool', read: async (chain, dex) => (await getVaultsByPool(address, chain, dex))[0], ttlMs: HOUR },
  { name: 'getAllRewardVaults', read: async (chain, dex) => (await getAllRewardVaults(chain, dex))[0].id, ttlMs: HOUR },
];

cases.forEach(({ name, read, ttlMs }) => {
  test(`${name}: cache lives for ${ttlMs / HOUR}h`, async () => {
    const first = await read(SupportedChainId.ink, SupportedDex.Reservoir);
    const calls = requestCount;
    now += ttlMs - 1;
    expect(await read(SupportedChainId.ink, SupportedDex.Reservoir)).toBe(first);
    expect(requestCount).toBe(calls);
    now += 2;
    expect(await read(SupportedChainId.ink, SupportedDex.Reservoir)).not.toBe(first);
    expect(requestCount).toBeGreaterThan(calls);
  });

  test(`${name}: same arguments on another chain or DEX are cached separately`, async () => {
    const results = [
      await read(SupportedChainId.ink, SupportedDex.Reservoir),
      await read(SupportedChainId.base, SupportedDex.Reservoir),
      await read(SupportedChainId.ink, SupportedDex.Velodrome),
    ];
    expect(results[0]).toMatch(`fixture:${SupportedChainId.ink}:${SupportedDex.Reservoir}#`);
    expect(results[1]).toMatch(`fixture:${SupportedChainId.base}:${SupportedDex.Reservoir}#`);
    expect(results[2]).toMatch(`fixture:${SupportedChainId.ink}:${SupportedDex.Velodrome}#`);
  });
});

describe('getTokenDecimals', () => {
  const decimals = jest.fn();
  beforeEach(() => {
    decimals.mockReset();
    (contracts.getERC20Contract as jest.Mock).mockReturnValue({ decimals });
  });

  test('cache lives for 24 hours', async () => {
    decimals.mockResolvedValueOnce(6n).mockResolvedValueOnce(8n);
    expect(await getTokenDecimals(address, {} as never, SupportedChainId.ink)).toBe(6);
    now += 24 * HOUR - 1;
    expect(await getTokenDecimals(address, {} as never, SupportedChainId.ink)).toBe(6);
    expect(decimals).toHaveBeenCalledTimes(1);
    now += 2;
    expect(await getTokenDecimals(address, {} as never, SupportedChainId.ink)).toBe(8);
    expect(decimals).toHaveBeenCalledTimes(2);
  });

  test('a cached zero-decimals token is reused instead of re-read', async () => {
    decimals.mockResolvedValue(0n);
    expect(await getTokenDecimals(address, {} as never, SupportedChainId.ink)).toBe(0);
    expect(await getTokenDecimals(address, {} as never, SupportedChainId.ink)).toBe(0);
    expect(decimals).toHaveBeenCalledTimes(1);
  });
});
