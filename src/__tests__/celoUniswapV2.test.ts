/* eslint-env jest */

import { getVaultsByPool, getVaultsByTokens } from '../functions/vault';
import { graphqlRequest } from '../graphql/functions';
import { SupportedChainId, SupportedDex } from '../types';
import cache from '../utils/cache';
import { getConfigByFactory } from '../utils/getConfigByFactory';
import { getGraphUrls } from '../utils/getGraphUrls';

jest.mock('../graphql/functions');

const requestMock = graphqlRequest as jest.Mock;
const chainId = SupportedChainId.celo;
const endpoint = 'https://api.studio.thegraph.com/query/88584/celo-v-1-2/version/latest';
const token0 = '0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d';
const token1 = '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e';
const pool = '0x5d8ef8b839be522b9e3d60a51edb5837cd0b2391';
const originalApiKey = process.env.SUBGRAPH_API_KEY;

beforeEach(() => {
  cache.flushAll();
  requestMock.mockReset();
  delete process.env.SUBGRAPH_API_KEY;
});

afterEach(() => {
  cache.flushAll();
  if (originalApiKey === undefined) delete process.env.SUBGRAPH_API_KEY;
  else process.env.SUBGRAPH_API_KEY = originalApiKey;
});

describe('Celo UniswapV2', () => {
  it('resolves the new factory and deposit guard alongside the older deployment', () => {
    expect(getConfigByFactory(chainId, '0x0c7f01223caa3011ff59ae36a707da5c78d6ae38')).toMatchObject({
      dex: SupportedDex.UniswapV2,
      depositGuardAddress: '0x7F4045Dc51EA17F33a8695c7C98E83da58c6418f',
      depositGuardVersion: 2,
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      graphUrl: endpoint,
      publishedUrl: endpoint,
      version: 2,
      supportsCollectFees: true,
      isAlgebra: false,
    });
    expect(getConfigByFactory(chainId, '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F')?.dex).toBe(SupportedDex.UniswapV3);
  });

  it.each([undefined, 'test-api-key'])('uses Studio with SUBGRAPH_API_KEY=%s', (apiKey) => {
    if (apiKey) process.env.SUBGRAPH_API_KEY = apiKey;
    expect(getGraphUrls(chainId, SupportedDex.UniswapV2, true)).toMatchObject({
      url: endpoint,
      publishedUrl: apiKey ? endpoint : undefined,
      version: 2,
    });
  });

  it.each([SupportedDex.UniswapV3, SupportedDex.UniswapV2])(
    'returns only vaults that allow the requested deposit token on %s',
    async (dex) => {
      const vaults = [
        { id: 'token0-vault', tokenA: token0, tokenB: token1, allowTokenA: true, allowTokenB: false },
        { id: 'token1-vault', tokenA: token0, tokenB: token1, allowTokenA: false, allowTokenB: true },
      ];
      const rawVaults =
        dex === SupportedDex.UniswapV2
          ? vaults.map((vault) => ({
              id: vault.id,
              token0: vault.tokenA,
              token1: vault.tokenB,
              allowToken0: vault.allowTokenA,
              allowToken1: vault.allowTokenB,
            }))
          : vaults;
      requestMock.mockImplementation(async (_url, _query, variables) => ({
        ichiVaults: variables.addressTokenA === token0 ? rawVaults : [],
      }));

      expect(await getVaultsByTokens(chainId, dex, token0, token1)).toEqual([expect.objectContaining(vaults[0])]);
      expect(await getVaultsByTokens(chainId, dex, token1, token0)).toEqual([expect.objectContaining(vaults[1])]);
      expect(requestMock).toHaveBeenCalledTimes(2);
    },
  );

  it('keeps token lookup caches separate for deployments on the same chain', async () => {
    requestMock.mockImplementation(async (url, _query, variables) => ({
      ichiVaults:
        variables.addressTokenA === token0
          ? [{ id: url, tokenA: token0, tokenB: token1, allowTokenA: true, allowTokenB: false }]
          : [],
    }));

    const oldVaults = await getVaultsByTokens(chainId, SupportedDex.UniswapV3, token0, token1);
    const newVaults = await getVaultsByTokens(chainId, SupportedDex.UniswapV2, token0, token1);
    expect(newVaults[0].id).toBe(endpoint);
    expect(newVaults).not.toEqual(oldVaults);
    expect(await getVaultsByTokens(chainId, SupportedDex.UniswapV2, token0, token1)).toEqual(newVaults);
    expect(await getVaultsByTokens(chainId, SupportedDex.UniswapV3, token0, token1)).toEqual(oldVaults);
    expect(requestMock).toHaveBeenCalledTimes(4);
  });

  it('keeps pool lookup caches separate for deployments on the same chain', async () => {
    requestMock.mockImplementation(async (url) => ({ deployICHIVaults: [{ vault: url }] }));

    const oldVaults = await getVaultsByPool(pool, chainId, SupportedDex.UniswapV3);
    const newVaults = await getVaultsByPool(pool, chainId, SupportedDex.UniswapV2);
    expect(newVaults).toEqual([{ vault: endpoint }]);
    expect(newVaults).not.toEqual(oldVaults);
    expect(await getVaultsByPool(pool, chainId, SupportedDex.UniswapV2)).toEqual(newVaults);
    expect(await getVaultsByPool(pool, chainId, SupportedDex.UniswapV3)).toEqual(oldVaults);
    expect(requestMock).toHaveBeenCalledTimes(2);
  });
});
