/* eslint-env jest */

import { getVaultsByTokens } from '../functions/vault';
import { SupportedChainId, SupportedDex } from '../types';
import cache from '../utils/cache';
import * as requests from '../graphql/functions';

let mockPublishedUrl: string | undefined;
let mockGraphVersion = 2;

jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: () => ({
    url: 'fixture:v2',
    publishedUrl: mockPublishedUrl,
    version: mockGraphVersion,
    isAmplifiHosted: false,
  }),
}));
jest.mock('../graphql/functions', () => ({ graphqlRequest: jest.fn() }));

const token0 = '0x0000000000000000000000000000000000000001';
const token1 = '0x0000000000000000000000000000000000000002';
const token0Vault = '0x0000000000000000000000000000000000000010';
const token1Vault = '0x0000000000000000000000000000000000000020';
const graphqlRequest = requests.graphqlRequest as jest.Mock;

beforeEach(() => {
  cache.flushAll();
  mockPublishedUrl = undefined;
  mockGraphVersion = 2;
  graphqlRequest.mockReset().mockImplementation(async (_url: string, query: string, variables: any) => {
    const isCanonicalOrder = variables.addressTokenA === token0 && variables.addressTokenB === token1;
    if (mockGraphVersion === 1) {
      expect(query).toContain('tokenA');
      expect(query).toContain('allowTokenA');
      return {
        ichiVaults: isCanonicalOrder
          ? [{ id: token0Vault, tokenA: token0, tokenB: token1, allowTokenA: true, allowTokenB: false }]
          : [],
      };
    }

    expect(query).toContain('token0');
    expect(query).toContain('allowToken0');
    return {
      ichiVaults: isCanonicalOrder
        ? [
            { id: token0Vault, token0, token1, allowToken0: true, allowToken1: false },
            { id: token1Vault, token0, token1, allowToken0: false, allowToken1: true },
          ]
        : [],
    };
  });
});

afterEach(() => {
  cache.flushAll();
  jest.restoreAllMocks();
});

it.each([
  ['public URL, token0 deposit direction', undefined, token0, token1, token0Vault, true, false],
  ['public URL, token1 deposit direction', undefined, token1, token0, token1Vault, false, true],
  ['published URL, token0 deposit direction', 'fixture:published', token0, token1, token0Vault, true, false],
  ['published URL, token1 deposit direction', 'fixture:published', token1, token0, token1Vault, false, true],
])(
  'normalizes V2 fields for %s',
  async (_name, publishedUrl, depositToken, pairedToken, vaultId, allowTokenA, allowTokenB) => {
    mockPublishedUrl = publishedUrl;
    const result = await getVaultsByTokens(
      SupportedChainId.bsc,
      SupportedDex.ThenaV5Rewards,
      depositToken,
      pairedToken,
    );

    expect(result).toEqual([
      {
        id: vaultId,
        tokenA: token0,
        tokenB: token1,
        allowTokenA,
        allowTokenB,
        decimals0: undefined,
        decimals1: undefined,
        totalSupply: undefined,
        fee: undefined,
        holdersCount: undefined,
        farmingContract: undefined,
        rewardTokens: undefined,
      },
    ]);
    expect(graphqlRequest).toHaveBeenCalledWith(
      publishedUrl ?? 'fixture:v2',
      expect.any(String),
      expect.any(Object),
      publishedUrl ? false : undefined,
    );
  },
);

it('leaves V1 vault fields unchanged', async () => {
  mockGraphVersion = 1;

  const result = await getVaultsByTokens(SupportedChainId.bsc, SupportedDex.ThenaV5Rewards, token0, token1);

  expect(result).toEqual([
    {
      id: token0Vault,
      tokenA: token0,
      tokenB: token1,
      allowTokenA: true,
      allowTokenB: false,
    },
  ]);
});
