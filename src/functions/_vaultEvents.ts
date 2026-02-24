/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable import/no-cycle */
// eslint-disable-next-line import/no-unresolved
import { SupportedDex, SupportedChainId, Fees, VaultTransactionEvent, VaultState } from '../types';
// eslint-disable import/no-cycle
import { graphUrls } from '../graphql/constants';
import {
  allEventsNoCollectFeesQuery,
  allEventsQuery,
  rebalancesQuery,
  vaultCollectFeesQuery,
  vaultDepositsQuery,
  vaultWithdrawsQuery,
} from '../graphql/queries';
import { daysToMilliseconds } from '../utils/timestamps';
import { getGraphUrls } from '../utils/getGraphUrls';
import cache from '../utils/cache';
import {
  sendAllEventsQueryRequest,
  sendCollectFeesQueryRequest,
  sendDepositsQueryRequest,
  sendRebalancesQueryRequest,
  sendWithdrawsQueryRequest,
} from '../graphql/functions';

export async function _getAllEvents(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<VaultState[]> {
  const key = `allevents-${chainId}-${vaultAddress}-${days}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as Fees[];
  }

  const ttl = 120000;
  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);
  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const supportsCollectFees = graphUrls[chainId as SupportedChainId]![dex]?.supportsCollectFees;
  const query = supportsCollectFees ? allEventsQuery : allEventsNoCollectFeesQuery;

  const allEvents = [] as Fees[];
  let endOfData = false;

  // Track last timestamp for each entity type
  const lastTimestamps = {
    rebalances: startTimestamp,
    collectFees: startTimestamp,
    deposits: startTimestamp,
    withdraws: startTimestamp,
  };

  // Track whether each entity type has more data
  const hasMoreData = {
    rebalances: true,
    collectFees: supportsCollectFees,
    deposits: true,
    withdraws: true,
  };

  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendAllEventsQueryRequest(publishedUrl, vaultAddress, startTimestamp, query(lastTimestamps));
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendAllEventsQueryRequest(url, vaultAddress, startTimestamp, query(lastTimestamps));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get events for vault ${vaultAddress} on chain ${chainId}`);
      }
    }

    if (result) {
      // Add the results to our collection
      if (result.vaultRebalances && result.vaultRebalances.length > 0) {
        allEvents.push(...result.vaultRebalances);
        // Update cursor for next query
        lastTimestamps.rebalances = result.vaultRebalances[result.vaultRebalances.length - 1].createdAtTimestamp;

        // Check if we've reached the end for this entity
        if (result.vaultRebalances.length < 1000) {
          hasMoreData.rebalances = false;
        }
      } else {
        hasMoreData.rebalances = false;
      }

      if (supportsCollectFees && result.vaultCollectFees && result.vaultCollectFees.length > 0) {
        allEvents.push(...result.vaultCollectFees);
        // Update cursor for next query
        lastTimestamps.collectFees = result.vaultCollectFees[result.vaultCollectFees.length - 1].createdAtTimestamp;

        // Check if we've reached the end for this entity
        if (result.vaultCollectFees.length < 1000) {
          hasMoreData.collectFees = false;
        }
      } else {
        hasMoreData.collectFees = false;
      }

      if (result.vaultDeposits && result.vaultDeposits.length > 0) {
        allEvents.push(...result.vaultDeposits);
        // Update cursor for next query
        lastTimestamps.deposits = result.vaultDeposits[result.vaultDeposits.length - 1].createdAtTimestamp;

        // Check if we've reached the end for this entity
        if (result.vaultDeposits.length < 1000) {
          hasMoreData.deposits = false;
        }
      } else {
        hasMoreData.deposits = false;
      }

      if (result.vaultWithdraws && result.vaultWithdraws.length > 0) {
        allEvents.push(...result.vaultWithdraws);
        // Update cursor for next query
        lastTimestamps.withdraws = result.vaultWithdraws[result.vaultWithdraws.length - 1].createdAtTimestamp;

        // Check if we've reached the end for this entity
        if (result.vaultWithdraws.length < 1000) {
          hasMoreData.withdraws = false;
        }
      } else {
        hasMoreData.withdraws = false;
      }

      // Check if we've reached the end for all entity types
      endOfData = !Object.values(hasMoreData).some((hasMore) => hasMore);
    } else {
      endOfData = true;
    }
  }

  cache.set(key, allEvents, ttl);
  return allEvents;
}

// eslint-disable-next-line no-underscore-dangle
export async function _getRebalances(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const key = `rebalances-${chainId}-${vaultAddress}-${days}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as Fees[];
  }

  const ttl = 120000;
  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const rebalances = [] as Fees[];
  let endOfData = false;
  let lastTimestamp = startTimestamp;

  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendRebalancesQueryRequest(
          publishedUrl,
          vaultAddress,
          startTimestamp,
          rebalancesQuery(lastTimestamp),
        );
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendRebalancesQueryRequest(url, vaultAddress, startTimestamp, rebalancesQuery(lastTimestamp));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get rebalances for vault ${vaultAddress} on chain ${chainId}`);
      }
    }

    if (result && result.length > 0) {
      rebalances.push(...result);

      if (result.length < 1000) {
        endOfData = true;
      } else {
        // Update the cursor to the timestamp of the last item
        lastTimestamp = result[result.length - 1].createdAtTimestamp;
      }
    } else {
      endOfData = true;
    }
  }
  cache.set(key, rebalances, ttl);

  return rebalances;
}

// eslint-disable-next-line no-underscore-dangle
export async function _getFeesCollectedEvents(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const key = `fees-${chainId}-${vaultAddress}-${days}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as Fees[];
  }

  const ttl = 120000;
  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const supportsCollectFees = graphUrls[chainId as SupportedChainId]![dex]?.supportsCollectFees;
  if (!supportsCollectFees) {
    const result = [] as unknown as Promise<Fees[]>;
    cache.set(key, result, 24 * 60 * 60 * 1000);
    return result;
  }

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const otherFees = [] as Fees[];
  let endOfData = false;
  let lastTimestamp = startTimestamp;

  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendCollectFeesQueryRequest(
          publishedUrl,
          vaultAddress,
          startTimestamp,
          vaultCollectFeesQuery(lastTimestamp),
        );
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendCollectFeesQueryRequest(
          url,
          vaultAddress,
          startTimestamp,
          vaultCollectFeesQuery(lastTimestamp),
        );
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get collected fees for vault ${vaultAddress} on chain ${chainId}`);
      }
    }
    if (result && result.length > 0) {
      otherFees.push(...result);

      if (result.length < 1000) {
        endOfData = true;
      } else {
        // Update the cursor to the timestamp of the last item
        lastTimestamp = result[result.length - 1].createdAtTimestamp;
      }
    } else {
      endOfData = true;
    }
  }
  cache.set(key, otherFees, ttl);

  return otherFees;
}

// eslint-disable-next-line no-underscore-dangle
export async function _getDeposits(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const key = `deposits-${chainId}-${vaultAddress}-${days}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultTransactionEvent[];
  }

  const ttl = 120000;
  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const depositEvents = [] as VaultTransactionEvent[];
  let endOfData = false;
  let lastTimestamp = startTimestamp;

  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendDepositsQueryRequest(
          publishedUrl,
          vaultAddress,
          startTimestamp,
          vaultDepositsQuery(lastTimestamp),
        );
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendDepositsQueryRequest(url, vaultAddress, startTimestamp, vaultDepositsQuery(lastTimestamp));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get deposits for vault ${vaultAddress} on chain ${chainId}`);
      }
    }

    if (result && result.length > 0) {
      depositEvents.push(...result);

      if (result.length < 1000) {
        endOfData = true;
      } else {
        // Update the cursor to the timestamp of the last item
        lastTimestamp = result[result.length - 1].createdAtTimestamp;
      }
    } else {
      endOfData = true;
    }
  }
  cache.set(key, depositEvents, ttl);

  return depositEvents;
}

// eslint-disable-next-line no-underscore-dangle
export async function _getWithdraws(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const key = `withdraws-${chainId}-${vaultAddress}-${days}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultTransactionEvent[];
  }

  const ttl = 120000;
  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const withdrawEvents = [] as VaultTransactionEvent[];
  let endOfData = false;
  let lastTimestamp = startTimestamp;

  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendWithdrawsQueryRequest(
          publishedUrl,
          vaultAddress,
          startTimestamp,
          vaultWithdrawsQuery(lastTimestamp),
        );
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendWithdrawsQueryRequest(url, vaultAddress, startTimestamp, vaultWithdrawsQuery(lastTimestamp));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get withdraws for vault ${vaultAddress} on chain ${chainId}`);
      }
    }

    if (result && result.length > 0) {
      withdrawEvents.push(...result);

      if (result.length < 1000) {
        endOfData = true;
      } else {
        // Update the cursor to the timestamp of the last item
        lastTimestamp = result[result.length - 1].createdAtTimestamp;
      }
    } else {
      endOfData = true;
    }
  }
  cache.set(key, withdrawEvents, ttl);

  return withdrawEvents;
}

// eslint-disable-next-line no-underscore-dangle
export async function _getAllVaultEvents(
  vaultAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
  days?: number,
): Promise<VaultState[]> {
  const key = `allEvents-${chainId}-${vaultAddress}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultState[];
  }

  const ttl = 120000;
  const allEvents = await _getAllEvents(vaultAddress, chainId, dex, days);
  const result = allEvents.sort(
    (a, b) => Number(b.createdAtTimestamp) - Number(a.createdAtTimestamp), // recent events first
  );
  cache.set(key, result, ttl);

  return result;
}

export function getVaultStateAt(vaultEvents: VaultState[], daysAgo: number): VaultState | null {
  if (vaultEvents.length === 0) {
    return null;
  }
  const eventsBefore = vaultEvents.filter(
    (e) => Number(e.createdAtTimestamp) * 1000 <= Date.now() - daysToMilliseconds(daysAgo),
  );
  if (eventsBefore.length > 0) {
    return eventsBefore[0];
  } else {
    return null;
  }
}
