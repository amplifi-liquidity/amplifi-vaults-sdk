import { graphUrls } from '../graphql/constants';
import { SupportedChainId, SupportedDex } from '../types';

// eslint-disable-next-line import/prefer-default-export
export function getGraphUrls(
  chainId: SupportedChainId,
  dex: SupportedDex,
  isGraphRequired?: boolean,
): { url: string; publishedUrl: string | undefined; version: number; isAmplifiHosted: boolean } {
  const dexConfig = graphUrls[chainId]![dex];
  const url = dexConfig?.url;
  const isAmplifiHosted = dexConfig?.isAmplifiHosted === true;
  const version = dexConfig?.version ?? 1;

  let publishedUrl: string | undefined;
  if (isAmplifiHosted) {
    const amplifiApiKey = process.env.AMPLIFI_SUBGRAPH_API_KEY;
    publishedUrl = amplifiApiKey ? dexConfig?.publishedUrl : undefined;
  } else {
    const apikey = process.env.SUBGRAPH_API_KEY;
    publishedUrl = apikey && dexConfig?.publishedUrl.replace('[api-key]', apikey);
  }

  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  if (url === 'none' && isGraphRequired) throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);
  return { url, publishedUrl, version, isAmplifiHosted };
}
