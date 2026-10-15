/* eslint-env jest */

import { SupportedChainId, SupportedDex } from '../types';
import { getVaultQuery } from '../graphql/queries';
import { getConfigByFactory } from '../utils/getConfigByFactory';
import { getGraphUrls } from '../utils/getGraphUrls';

const chainId = SupportedChainId.bsc;
const dex = SupportedDex.ThenaV5Rewards;
const endpoint = 'https://api.studio.thegraph.com/query/88584/bsc-thena-v-1-2/version/latest';
const originalApiKey = process.env.SUBGRAPH_API_KEY;

beforeEach(() => {
  delete process.env.SUBGRAPH_API_KEY;
});

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.SUBGRAPH_API_KEY;
  else process.env.SUBGRAPH_API_KEY = originalApiKey;
});

describe('BSC ThenaV5Rewards', () => {
  it('resolves the factory, deposit guard, and MFD-enabled Algebra configuration', () => {
    expect(getConfigByFactory(chainId, '0x6e7f9ecbc0284a9eb4604c3bf6eafd3a35788f72')).toMatchObject({
      dex,
      depositGuardAddress: '0x60EbBF9CF5B2d003E4A669271463a279e4D96155',
      depositGuardVersion: 2,
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      graphUrl: endpoint,
      publishedUrl:
        'https://gateway.thegraph.com/api/[api-key]/deployments/id/QmWsA7KFwjLrta49t6qbqguUsPCYmMCiEiYVBj1zyDmcUT',
      version: 2,
      supportsCollectFees: true,
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    });
  });

  it.each([undefined, 'test-api-key'])('resolves URLs with SUBGRAPH_API_KEY=%s', (apiKey) => {
    if (apiKey) process.env.SUBGRAPH_API_KEY = apiKey;
    expect(getGraphUrls(chainId, dex, true)).toMatchObject({
      url: endpoint,
      publishedUrl: apiKey
        ? 'https://gateway.thegraph.com/api/test-api-key/deployments/id/QmWsA7KFwjLrta49t6qbqguUsPCYmMCiEiYVBj1zyDmcUT'
        : undefined,
      version: 2,
    });
  });

  it('uses the MFD-aware vault query', () => {
    const query = getVaultQuery(chainId, dex);

    expect(query).toContain('farmingContract');
    expect(query).toContain('rewardTokens');
  });
});
