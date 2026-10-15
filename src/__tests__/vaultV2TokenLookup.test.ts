/* eslint-env jest */

import { getVaultsByTokens } from '../functions/vault';
import { SupportedChainId, SupportedDex } from '../types';
import cache from '../utils/cache';
import * as requests from '../graphql/functions';

jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: () => ({
    url: 'fixture:v2',
    publishedUrl: undefined,
    version: 2,
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
  graphqlRequest.mockReset().mockImplementation(async (_url: string, query: string, variables: any) => {
    expect(query).toContain('token0');
    expect(query).toContain('allowToken0');

    const isCanonicalOrder = variables.addressTokenA === token0 && variables.addressTokenB === token1;
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
  ['token0 deposit direction', token0, token1, token0Vault, true, false],
  ['token1 deposit direction', token1, token0, token1Vault, false, true],
])('normalizes V2 fields for %s', async (_name, depositToken, pairedToken, vaultId, allowTokenA, allowTokenB) => {
  const result = await getVaultsByTokens(SupportedChainId.bsc, SupportedDex.ThenaV5Rewards, depositToken, pairedToken);

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
});
