// The existing request module imports SDK-exported query types through the public barrel.
// eslint-disable-next-line import/no-cycle
import { graphqlRequest } from './functions';
import { VaultWithRewards } from '../types';

const PAGE_SIZE = 1000;
const MAX_PAGES = 64;
const READ_TIMEOUT_MS = 30000;

/** Read the whole ID-ordered reward catalog before a caller may cache it. */
export default async function readAllRewardVaultPages<T extends VaultWithRewards>(
  url: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<T[]> {
  const deadline = Date.now() + READ_TIMEOUT_MS;
  const result: T[] = [];
  let afterId = '';
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new Error('Reward catalog read deadline exceeded');
    // Each page depends on the previous ID cursor.
    // eslint-disable-next-line no-await-in-loop
    const response = await graphqlRequest<{ ichiVaults: T[] }, { afterId: string }>(
      url,
      query,
      { afterId },
      isAmplifiHosted,
      remainingMs,
    );
    if (Date.now() >= deadline) throw new Error('Reward catalog read deadline exceeded');
    if (!Array.isArray(response?.ichiVaults) || response.ichiVaults.length > PAGE_SIZE) {
      throw new Error('Malformed reward catalog page');
    }
    for (let rowIndex = 0; rowIndex < response.ichiVaults.length; rowIndex += 1) {
      const row = response.ichiVaults[rowIndex];
      const farm = row?.farmingContract;
      if (
        !row ||
        typeof row.id !== 'string' ||
        !row.id ||
        row.id <= afterId ||
        !farm ||
        typeof farm.id !== 'string' ||
        !farm.id ||
        !Array.isArray(farm.rewardTokens)
      ) {
        throw new Error('Malformed or unordered reward catalog entry');
      }
      const rewardTokens = farm.rewardTokens.map((token) => {
        const decimals = token?.tokenDecimals;
        if (
          !token ||
          typeof token.token !== 'string' ||
          !token.token ||
          (typeof decimals !== 'number' && typeof decimals !== 'string') ||
          !Number.isInteger(Number(decimals)) ||
          Number(decimals) < 0 ||
          Number(decimals) > 255 ||
          (typeof decimals === 'string' && !/^(0|[1-9][0-9]*)$/.test(decimals))
        ) {
          throw new Error('Malformed reward token metadata');
        }
        return { ...token, tokenDecimals: Number(decimals) };
      });
      result.push({ ...row, farmingContract: { ...farm, rewardTokens } });
      afterId = row.id;
    }
    if (response.ichiVaults.length < PAGE_SIZE) return result;
  }
  throw new Error('Reward catalog page limit exceeded before completion');
}
