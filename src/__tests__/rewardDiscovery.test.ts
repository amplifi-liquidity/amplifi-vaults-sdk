/* eslint-env jest */
import { Interface, JsonRpcProvider } from 'ethers';
import { getAllRewardVaults } from '../functions/vault';
import { getAllRewardInfo } from '../functions/rewardInfo';
import { getAllUserRewards } from '../functions/userRewards';
import { getAllUserAmounts, getAllUserBalances } from '../functions/userBalances';
import { graphqlRequest } from '../graphql/functions';
import { multicall } from '../utils/multicallUtils';
import cache from '../utils/cache';
import { SupportedChainId, SupportedDex } from '../types';
import mfdAbi from '../abis/multiFeeDistributer.json';

jest.mock('../graphql/functions', () => ({ graphqlRequest: jest.fn() }));
jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: () => ({
    publishedUrl: 'https://published.example/graphql',
    url: 'https://fallback.example/graphql',
    version: 2,
  }),
}));
jest.mock('../utils/multicallUtils', () => ({
  ...jest.requireActual('../utils/multicallUtils'),
  multicall: jest.fn(),
}));

const account = '0x1111111111111111111111111111111111111111';
const farm = '0x2222222222222222222222222222222222222222';
const token = '0x3333333333333333333333333333333333333333';
const vaultId = (i: number) => `0x${i.toString(16).padStart(40, '0')}`;
const vault = (i: number) => ({
  id: vaultId(i),
  farmingContract: {
    id: farm,
    rewardTokens: [{ token, tokenDecimals: 6, rewardRatePerToken_1d: '1', rewardRatePerToken_3d: '1' }],
  },
});
const provider = { getNetwork: async () => ({ chainId: 57073n }) } as JsonRpcProvider;
const iface = new Interface(mfdAbi);
const request = graphqlRequest as jest.Mock;
function contractRewards(tokens: string[], amounts: bigint[]) {
  (multicall as jest.Mock).mockResolvedValue([
    { success: true, returnData: iface.encodeFunctionResult('claimableRewards', [tokens, amounts]) },
  ]);
}

beforeEach(() => {
  cache.flushAll();
  jest.useFakeTimers();
  jest.clearAllMocks();
  request.mockReset();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cache.flushAll();
});

const readers = [
  { name: 'reward vaults', read: getAllRewardVaults },
  { name: 'reward info', read: getAllRewardInfo },
];
test.each(readers)('$name: reads past the default 100 and a full 1000-item page before caching', async ({ read }) => {
  const all = Array.from({ length: 1001 }, (_, i) => vault(i + 1));
  request.mockImplementation(async (_url, query, variables) => {
    const pageSize = /first:\s*(\d+)/.exec(query)?.[1];
    const after = variables?.afterId ?? '';
    return { ichiVaults: all.filter((v) => v.id > after).slice(0, pageSize ? Number(pageSize) : 100) };
  });
  expect((await read(SupportedChainId.ink, SupportedDex.Velodrome)).length).toBe(1001);
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0][1]).toMatch(/orderBy:\s*id/);
  expect(request.mock.calls[0][2]).toEqual({ afterId: '' });
  expect(request.mock.calls[1][2]).toEqual({ afterId: vaultId(1000) });
  expect((await read(SupportedChainId.ink, SupportedDex.Velodrome)).length).toBe(1001);
  expect(request).toHaveBeenCalledTimes(2);
});

test('a later page failure restarts the fallback source without retaining a partial published list', async () => {
  const full = Array.from({ length: 1000 }, (_, i) => vault(i + 1));
  request.mockImplementation(async (url, _query, variables) => {
    if (url.includes('fallback')) return { ichiVaults: [vault(2000)] };
    if (variables?.afterId) throw new Error('second page unavailable');
    return { ichiVaults: full };
  });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const result = await getAllRewardVaults(SupportedChainId.ink, SupportedDex.Velodrome);
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(vaultId(2000));
  expect(request.mock.calls.filter(([url]) => url.includes('fallback'))[0][2]).toEqual({ afterId: '' });
  jest.restoreAllMocks();
});

test.each([
  { ichiVaults: null },
  { ichiVaults: 'malformed' },
  { ichiVaults: [null] },
  { ichiVaults: [{ ...vault(1), farmingContract: null }] },
  { ichiVaults: [vault(2), vault(1)] },
])('malformed reward catalog %p fails and is not cached as empty', async ({ ichiVaults }) => {
  request.mockResolvedValue({ ichiVaults });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  await expect(getAllRewardVaults(SupportedChainId.ink, SupportedDex.Velodrome)).rejects.toThrow();
  request.mockResolvedValue({ ichiVaults: [vault(1)] });
  expect(await getAllRewardVaults(SupportedChainId.ink, SupportedDex.Velodrome)).toEqual([vault(1)]);
  jest.restoreAllMocks();
});

test('verified empty contract rewards preserve the public vault object instead of a bare array', async () => {
  request.mockResolvedValue({ ichiVaults: [vault(1)] });
  contractRewards([], []);
  expect(await getAllUserRewards(account, provider, SupportedDex.Velodrome)).toEqual([
    { vaultAddress: vaultId(1), rewardTokens: [] },
  ]);
  expect(await getAllUserRewards(account, provider, SupportedDex.Velodrome, true)).toEqual([
    { vaultAddress: vaultId(1), rewardTokens: [] },
  ]);
});

test('reward amounts use verified token decimals rather than assuming 18', async () => {
  request.mockResolvedValue({ ichiVaults: [vault(1)] });
  contractRewards([token], [1230000n]);
  expect(await getAllUserRewards(account, provider, SupportedDex.Velodrome)).toEqual([
    { vaultAddress: vaultId(1), rewardTokens: [{ token, tokenDecimals: 6, rewardAmount: '1.23' }] },
  ]);
});

test('unequal claimable token/amount arrays are unavailable rather than verified emptiness', async () => {
  request.mockResolvedValue({ ichiVaults: [vault(1)] });
  contractRewards([token], []);
  await expect(getAllUserRewards(account, provider, SupportedDex.Velodrome)).rejects.toThrow();
});

test('a claimed token absent from metadata cannot acquire fabricated default decimals', async () => {
  const bad = vault(1);
  bad.farmingContract.rewardTokens = [];
  request.mockResolvedValue({ ichiVaults: [bad] });
  contractRewards([token], [1230000n]);
  await expect(getAllUserRewards(account, provider, SupportedDex.Velodrome)).rejects.toThrow();
});

test.each([getAllUserBalances, getAllUserAmounts])(
  'malformed user data is unavailable in both bulk readers',
  async (read) => {
    request.mockResolvedValue({ user: 'malformed' });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(read(account, provider, SupportedDex.Velodrome)).rejects.toThrow();
    expect(multicall).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  },
);

test.each([getAllUserBalances, getAllUserAmounts])(
  'a verified absent user remains an empty bulk result',
  async (read) => {
    request.mockResolvedValue({ user: null });
    expect(await read(account, provider, SupportedDex.Velodrome)).toEqual([]);
  },
);

test('reward pagination fails closed when the shared read deadline expires', async () => {
  const full = Array.from({ length: 1000 }, (_, i) => vault(i + 1));
  request.mockImplementation(async () => {
    jest.setSystemTime(Date.now() + 31000);
    return { ichiVaults: full };
  });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  await expect(getAllRewardVaults(SupportedChainId.ink, SupportedDex.Velodrome)).rejects.toThrow();
  jest.restoreAllMocks();
});

test('a missing wallet balance cannot be validated as an optional missing stake', async () => {
  const missing = { vault: { id: vaultId(1) } };
  request.mockResolvedValue({ user: { vaultShares: [missing] } });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  await expect(getAllUserBalances(account, provider, SupportedDex.Velodrome)).rejects.toThrow();
  request.mockResolvedValue({ user: null });
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome)).toEqual([]);
  jest.restoreAllMocks();
});

test('malformed decimal segments fail before the user response is cached', async () => {
  request.mockResolvedValue({ user: { vaultShares: [{ vault: { id: vaultId(1) }, vaultShareBalance: '1.2.3' }] } });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  await expect(getAllUserBalances(account, provider, SupportedDex.Velodrome)).rejects.toThrow();
  request.mockResolvedValue({ user: null });
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome)).toEqual([]);
  jest.restoreAllMocks();
});

test('independently valid scientific share syntax remains supported', async () => {
  request.mockResolvedValue({ user: { vaultShares: [{ vault: { id: vaultId(1) }, vaultShareBalance: '1e-18' }] } });
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome, true)).toEqual([
    { vaultAddress: vaultId(1), shares: 1n, stakedShares: 0n },
  ]);
});
