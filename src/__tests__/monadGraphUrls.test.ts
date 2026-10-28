/* eslint-env jest */

import { graphUrls } from '../graphql/constants';
import { SupportedChainId, SupportedDex } from '../types';
import { getGraphUrls } from '../utils/getGraphUrls';

describe('Monad Atlantis subgraph', () => {
  it('uses the ICHI Vaults Goldsky g2 deployment', () => {
    const url =
      'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/monad-v2-atlantis/gn';
    expect(graphUrls[SupportedChainId.monad][SupportedDex.Atlantis]).toMatchObject({
      url,
      publishedUrl: url,
      version: 2,
    });
    expect(getGraphUrls(SupportedChainId.monad, SupportedDex.Atlantis, true).url).toBe(url);
  });
});
