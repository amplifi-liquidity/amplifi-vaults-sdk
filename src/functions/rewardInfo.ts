/* eslint-disable no-redeclare */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */

import request from 'graphql-request';
import { RewardInfo, SupportedChainId, SupportedDex } from '../types';
import cache from '../utils/cache';
import { getGraphUrls } from '../utils/getGraphUrls';
import { allRewardInfoQuery, rewardInfoQuery } from '../graphql/queries';
import { AllRewardInfoQueryResponse, RewardInfoQueryResponse } from '../types/vaultQueryData';
import { isVelodromeDex } from '../utils/isVelodrome';

async function sendRewardInfoQueryRequest(url: string, vaultAddress: string, query: string): Promise<RewardInfo> {
  return request<RewardInfoQueryResponse, { vaultAddress: string }>(url, query, {
    vaultAddress: vaultAddress.toLowerCase(),
  }).then(({ ichiVault }) => ichiVault);
}

async function sendAllRewardInfoQueryRequest(url: string, query: string): Promise<RewardInfo[]> {
  return request<AllRewardInfoQueryResponse>(url, query).then(({ ichiVaults }) => ichiVaults);
}

export async function getRewardInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
): Promise<RewardInfo> {
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  const key = `rewardinfo-${chainId}-${vaultAddress}`;
  const ttl = 6 * 60 * 60 * 1000; // 6 hours
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as RewardInfo;
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex);

  try {
    if (publishedUrl) {
      const result = await sendRewardInfoQueryRequest(publishedUrl, vaultAddress, rewardInfoQuery);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for ${vaultAddress}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendRewardInfoQueryRequest(url, vaultAddress, rewardInfoQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get Reward info for ${vaultAddress}`);
    }
  }
}

export async function getAllRewardInfo(chainId: SupportedChainId, dex: SupportedDex): Promise<RewardInfo[]> {
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  const key = `allrewardinfo-${chainId}-${dex}`;
  const ttl = 6 * 60 * 60 * 1000; // 6 hours
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as RewardInfo[];
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex);

  try {
    if (publishedUrl) {
      const result = await sendAllRewardInfoQueryRequest(publishedUrl, allRewardInfoQuery);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for ${dex}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendAllRewardInfoQueryRequest(url, allRewardInfoQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get all Reward info for ${dex}`);
    }
  }
}
