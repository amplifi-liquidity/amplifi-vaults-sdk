/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { JsonRpcProvider } from 'ethers';
import { SupportedChainId, SupportedDex } from '../types';
import { getFeeAprs } from '../functions/getFeeAprs';
import {
  _getAllEvents,
  _getAllVaultEvents,
  _getRebalances,
  _getFeesCollectedEvents,
  _getDeposits,
  _getWithdraws,
} from '../functions/_vaultEvents';
import cache from '../utils/cache';
import { graphUrls } from '../graphql/constants';
import * as requests from '../graphql/functions';

jest.mock('../functions/vault', () => ({
  validateVaultData: jest.fn(async (_address: string, provider: JsonRpcProvider) => ({
    chainId: Number((await provider.getNetwork()).chainId),
  })),
}));
jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: (chain: number, dex: string) => ({ url: `fixture:${chain}:${dex}`, version: 2 }),
}));
jest.mock('../graphql/constants', () => ({
  graphUrls: Object.fromEntries(
    [57073, 8453].map((chain) => [
      chain,
      Object.fromEntries(
        ['Reservoir', 'Velodrome'].map((dex) => [
          dex,
          {
            version: 2,
            supportsCollectFees: true,
            supportsExtendedFeeAprs: true,
          },
        ]),
      ),
    ]),
  ),
}));
jest.mock('../graphql/functions', () => ({
  sendFeeAprQueryRequest: jest.fn(),
  sendAllEventsQueryRequest: jest.fn(),
  sendRebalancesQueryRequest: jest.fn(),
  sendCollectFeesQueryRequest: jest.fn(),
  sendDepositsQueryRequest: jest.fn(),
  sendWithdrawsQueryRequest: jest.fn(),
}));

const address = '0x1111111111111111111111111111111111111111';
const initialTime = Date.parse('2026-10-06T08:00:00.000Z');
let now: number;
const provider = (chain: number) =>
  ({
    getNetwork: async () => ({ chainId: BigInt(chain) }),
  } as unknown as JsonRpcProvider);
const feeRequest = requests.sendFeeAprQueryRequest as jest.Mock;
const feeResponse = (value: number | null) => ({
  ichiVault: {
    feeApr_1d: value,
    feeApr_3d: value,
    feeApr_7d: value,
    feeApr_30d: value,
    feeApr_60d: value,
    feeApr_90d: value,
  },
});

beforeEach(() => {
  cache.flushAll();
  Object.values(requests).forEach((request) => {
    if (jest.isMockFunction(request)) request.mockReset();
  });
  now = initialTime;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});
afterEach(() => {
  cache.flushAll();
  jest.restoreAllMocks();
});

test('fee APR cache expires after 30 minutes', async () => {
  feeRequest.mockResolvedValueOnce(feeResponse(1)).mockResolvedValueOnce(feeResponse(2));
  expect((await getFeeAprs(address, provider(57073), SupportedDex.Reservoir))?.feeApr_1d).toBe(1);
  now += 30 * 60 * 1000 - 1;
  expect((await getFeeAprs(address, provider(57073), SupportedDex.Reservoir))?.feeApr_1d).toBe(1);
  expect(feeRequest).toHaveBeenCalledTimes(1);
  now += 2;
  expect((await getFeeAprs(address, provider(57073), SupportedDex.Reservoir))?.feeApr_1d).toBe(2);
  expect(feeRequest).toHaveBeenCalledTimes(2);
});

test('same-address fee APR requests are isolated by chain and DEX', async () => {
  feeRequest
    .mockResolvedValueOnce(feeResponse(1))
    .mockResolvedValueOnce(feeResponse(2))
    .mockResolvedValueOnce(feeResponse(3));
  const ink = await getFeeAprs(address, provider(57073), SupportedDex.Reservoir);
  const base = await getFeeAprs(address, provider(8453), SupportedDex.Reservoir);
  const velo = await getFeeAprs(address, provider(57073), SupportedDex.Velodrome);
  expect([ink?.feeApr_1d, base?.feeApr_1d, velo?.feeApr_1d]).toEqual([1, 2, 3]);
  expect(feeRequest).toHaveBeenCalledTimes(3);
});

test('numeric zero fee APR remains measured zero; null and missing periods stay unavailable', async () => {
  feeRequest.mockResolvedValue({
    ichiVault: {
      feeApr_1d: 0,
      feeApr_3d: null,
      feeApr_7d: 0,
      feeApr_60d: 0,
    },
  });
  expect(await getFeeAprs(address, provider(57073), SupportedDex.Reservoir)).toEqual({
    feeApr_1d: 0,
    feeApr_3d: null,
    feeApr_7d: 0,
    feeApr_30d: null,
    feeApr_60d: 0,
    feeApr_90d: null,
  });
});

const readers = [
  { name: 'all events', read: _getAllEvents, request: requests.sendAllEventsQueryRequest },
  { name: 'sorted all events', read: _getAllVaultEvents, request: requests.sendAllEventsQueryRequest },
  { name: 'rebalances', read: _getRebalances, request: requests.sendRebalancesQueryRequest },
  { name: 'collect fees', read: _getFeesCollectedEvents, request: requests.sendCollectFeesQueryRequest },
  { name: 'deposits', read: _getDeposits, request: requests.sendDepositsQueryRequest },
  { name: 'withdraws', read: _getWithdraws, request: requests.sendWithdrawsQueryRequest },
];

readers.forEach((reader) => {
  const response = (id: string) => {
    const events = [{ id, createdAtTimestamp: '1791270000' }];
    return reader.request === requests.sendAllEventsQueryRequest ? { vaultRebalances: events } : events;
  };
  test(`${reader.name}: cache expires after two minutes`, async () => {
    const request = reader.request as jest.Mock;
    request.mockResolvedValueOnce(response('old')).mockResolvedValueOnce(response('new'));
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Reservoir, 7))[0]).toMatchObject({
      id: 'old',
    });
    now += 120000 - 1;
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Reservoir, 7))[0]).toMatchObject({
      id: 'old',
    });
    expect(request).toHaveBeenCalledTimes(1);
    now += 2;
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Reservoir, 7))[0]).toMatchObject({
      id: 'new',
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  test(`${reader.name}: chain, DEX and requested window have independent cached results`, async () => {
    const request = reader.request as jest.Mock;
    request
      .mockResolvedValueOnce(response('ink'))
      .mockResolvedValueOnce(response('base'))
      .mockResolvedValueOnce(response('velo'))
      .mockResolvedValueOnce(response('thirty-days'));
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Reservoir, 7))[0]).toMatchObject({
      id: 'ink',
    });
    expect((await reader.read(address, SupportedChainId.base, SupportedDex.Reservoir, 7))[0]).toMatchObject({
      id: 'base',
    });
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Velodrome, 7))[0]).toMatchObject({
      id: 'velo',
    });
    expect((await reader.read(address, SupportedChainId.ink, SupportedDex.Reservoir, 30))[0]).toMatchObject({
      id: 'thirty-days',
    });
    expect(request).toHaveBeenCalledTimes(4);
  });
});

test('unsupported collected-fee capability cache expires after 24 hours', async () => {
  const config = graphUrls[SupportedChainId.ink][SupportedDex.Reservoir]!;
  config.supportsCollectFees = false;
  expect(await _getFeesCollectedEvents(address, SupportedChainId.ink, SupportedDex.Reservoir, 7)).toEqual([]);
  config.supportsCollectFees = true;
  (requests.sendCollectFeesQueryRequest as jest.Mock).mockResolvedValue([
    { id: 'enabled', createdAtTimestamp: '1791270000' },
  ]);
  now += 24 * 60 * 60 * 1000 - 1;
  expect(await _getFeesCollectedEvents(address, SupportedChainId.ink, SupportedDex.Reservoir, 7)).toEqual([]);
  expect(requests.sendCollectFeesQueryRequest).not.toHaveBeenCalled();
  now += 2;
  expect((await _getFeesCollectedEvents(address, SupportedChainId.ink, SupportedDex.Reservoir, 7))[0]).toMatchObject({
    id: 'enabled',
  });
});
