/* eslint-env jest */

import { SupportedChainId, SupportedDex } from '../types';
import { getConfigByFactory } from '../utils/getConfigByFactory';
import { getGraphUrls } from '../utils/getGraphUrls';

const chainId = SupportedChainId.celo;
const endpoint = 'https://api.studio.thegraph.com/query/88584/celo-v-1-2/version/latest';
const originalApiKey = process.env.SUBGRAPH_API_KEY;

beforeEach(() => {
  delete process.env.SUBGRAPH_API_KEY;
});

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.SUBGRAPH_API_KEY;
  else process.env.SUBGRAPH_API_KEY = originalApiKey;
});

describe('Celo UniswapNew', () => {
  it('resolves the new factory and deposit guard alongside the older deployment', () => {
    expect(getConfigByFactory(chainId, '0x0c7f01223caa3011ff59ae36a707da5c78d6ae38')).toMatchObject({
      dex: SupportedDex.UniswapNew,
      depositGuardAddress: '0x7F4045Dc51EA17F33a8695c7C98E83da58c6418f',
      depositGuardVersion: 2,
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      graphUrl: endpoint,
      publishedUrl:
        'https://gateway.thegraph.com/api/[api-key]/deployments/id/QmPwspVsTuhRkLBmsV4d95WuD5WFpWCFgTncvgbNT9KNYa',
      version: 2,
      supportsCollectFees: true,
      isAlgebra: false,
    });
    expect(getConfigByFactory(chainId, '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F')?.dex).toBe(SupportedDex.UniswapV3);
  });

  it.each([undefined, 'test-api-key'])('resolves URLs with SUBGRAPH_API_KEY=%s', (apiKey) => {
    if (apiKey) process.env.SUBGRAPH_API_KEY = apiKey;
    expect(getGraphUrls(chainId, SupportedDex.UniswapNew, true)).toMatchObject({
      url: endpoint,
      publishedUrl: apiKey
        ? 'https://gateway.thegraph.com/api/test-api-key/deployments/id/QmPwspVsTuhRkLBmsV4d95WuD5WFpWCFgTncvgbNT9KNYa'
        : undefined,
      version: 2,
    });
  });
});
