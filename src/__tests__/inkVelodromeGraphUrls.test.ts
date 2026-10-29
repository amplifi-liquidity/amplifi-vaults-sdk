/* eslint-env jest */

import { graphUrls } from '../graphql/constants';
import { SupportedChainId, SupportedDex } from '../types';
import { getGraphUrls } from '../utils/getGraphUrls';

describe('Ink Velodrome subgraph', () => {
  it('uses only the self-hosted deployment', () => {
    const url = 'https://graph-api.amplifiliquidity.com/subgraphs/name/amplifi/ink-v3-velodrome';
    expect(graphUrls[SupportedChainId.ink][SupportedDex.Velodrome]).toMatchObject({
      url,
      publishedUrl: url,
      isAmplifiHosted: true,
      version: 2,
    });
  });

  it('selects the self-hosted endpoint when its API key is configured', () => {
    const previousKey = process.env.AMPLIFI_SUBGRAPH_API_KEY;
    process.env.AMPLIFI_SUBGRAPH_API_KEY = 'test-key';
    try {
      const graph = getGraphUrls(SupportedChainId.ink, SupportedDex.Velodrome, true);
      expect(graph.publishedUrl).toBe(graph.url);
      expect(graph.isAmplifiHosted).toBe(true);
    } finally {
      if (previousKey === undefined) delete process.env.AMPLIFI_SUBGRAPH_API_KEY;
      else process.env.AMPLIFI_SUBGRAPH_API_KEY = previousKey;
    }
  });
});
