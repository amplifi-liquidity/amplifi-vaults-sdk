// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { JsonRpcProvider } from 'ethers';
import { SupportedDex, SupportedChainId, IchiVault, VaultWithRewards } from '../types';
// eslint-disable-next-line import/no-cycle
import {
  AllRewardVaultsQueryResponse,
  VaultQueryData,
  VaultsByPoolQueryData,
  VaultsByTokensQueryData,
} from '../types/vaultQueryData';
import { getIchiVaultContract } from '../contracts';
import { allRewardVaults, getVaultQuery, vaultByPoolQuery, vaultByTokensQuery } from '../graphql/queries';
import { getGraphUrls } from '../utils/getGraphUrls';
import cache from '../utils/cache';

function normalizeVaultData(vaultData: any): IchiVault {
  // If vaultData is null or undefined, throw an error
  if (!vaultData) {
    throw new Error('Vault data is null or undefined');
  }
  // If it's a v2 response (has token0/token1)
  if ('token0' in vaultData && 'token1' in vaultData) {
    return {
      id: vaultData.id,
      tokenA: vaultData.token0,
      tokenB: vaultData.token1,
      allowTokenA: vaultData.allowToken0,
      allowTokenB: vaultData.allowToken1,
      fee: vaultData.fee,
      holdersCount: vaultData.holdersCount,
      farmingContract: vaultData.farmingContract?.id,
      rewardTokens: vaultData.farmingContract?.rewardTokens,
    };
  }

  // If it's a v1 response (already has tokenA/tokenB)
  return vaultData;
}

async function getVaultInfoFromContract(vaultAddress: string, jsonProvider: JsonRpcProvider): Promise<IchiVault> {
  const vault: IchiVault = {
    id: vaultAddress,
    tokenA: '',
    tokenB: '',
    allowTokenA: false,
    allowTokenB: false,
  };
  try {
    const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
    vault.tokenA = await vaultContract.token0();
    vault.tokenB = await vaultContract.token1();
    vault.allowTokenA = await vaultContract.allowToken0();
    vault.allowTokenB = await vaultContract.allowToken1();
  } catch (error) {
    throw new Error(`Could not get vault info for ${vaultAddress}`);
  }

  return vault;
}

async function sendVaultQueryRequest(url: string, vaultAddress: string, query: string): Promise<IchiVault> {
  return request<VaultQueryData, { vaultAddress: string }>(url, query, {
    vaultAddress: vaultAddress.toLowerCase(),
  }).then(({ ichiVault }) => ichiVault);
}
async function sendVaultsByTokensRequest(
  url: string,
  token1: string,
  token2: string,
  query: string,
): Promise<IchiVault[]> {
  return request<VaultsByTokensQueryData, { addressTokenA: string; addressTokenB: string }>(url, query, {
    addressTokenA: token1,
    addressTokenB: token2,
  }).then(({ ichiVaults }) => ichiVaults);
}
async function sendVaultsByPoolQueryRequest(url: string, poolAddress: string, query: string): Promise<string[]> {
  return request<VaultsByPoolQueryData, { poolAddress: string }>(url, query, {
    poolAddress: poolAddress.toLowerCase(),
  }).then(({ deployICHIVaults }) => deployICHIVaults);
}
async function sendAllRewardVaultsQueryRequest(url: string, query: string): Promise<VaultWithRewards[]> {
  return request<AllRewardVaultsQueryResponse>(url, query).then(({ ichiVaults }) => ichiVaults);
}

export async function getIchiVaultInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
  jsonProvider?: JsonRpcProvider,
): Promise<IchiVault> {
  const key = `vault-${chainId}-${vaultAddress}`;
  const ttl = 6 * 60 * 60 * 1000; // 6 hours
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as IchiVault;
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex);
  const thisQuery = getVaultQuery(chainId, dex);

  if (url === 'none' && jsonProvider) {
    const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
    cache.set(key, result, ttl);
    return result;
  }
  try {
    if (publishedUrl) {
      const result = await sendVaultQueryRequest(publishedUrl, vaultAddress, thisQuery);
      const normalizedResult = normalizeVaultData(result);
      cache.set(key, normalizedResult, ttl);
      return normalizedResult;
    }
    throw new Error(`Published URL is invalid for ${vaultAddress}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultQueryRequest(url, vaultAddress, thisQuery);
      const normalizedResult = normalizeVaultData(result);
      cache.set(key, normalizedResult, ttl);
      return normalizedResult;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      if (jsonProvider) {
        const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
        cache.set(key, result, ttl);
        return result;
      } else {
        throw new Error(`Could not get vault info for ${vaultAddress}`);
      }
    }
  }
}

async function getVaultsByTokensAB(
  chainId: SupportedChainId,
  dex: SupportedDex,
  tokenA: string,
  tokenB: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const key = `vaultByTokens-${chainId}-${tokenA}-${tokenB}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultsByTokensQueryData['ichiVaults'];
  }

  const ttl = 3600000;
  const { url, publishedUrl, version } = getGraphUrls(chainId, dex, true);

  const strVaultByTokensQuery = vaultByTokensQuery(version);

  try {
    if (publishedUrl) {
      const result = await sendVaultsByTokensRequest(publishedUrl, tokenA, tokenB, strVaultByTokensQuery);
      cache.set(key, result, ttl);
      return result;
    } else {
      throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
    }
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultsByTokensRequest(url, tokenA, tokenB, strVaultByTokensQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get vaults by tokens, dex ${dex} on chain ${chainId}`);
    }
  }
}

export async function getVaultsByTokens(
  chainId: SupportedChainId,
  dex: SupportedDex,
  depositTokenAddress: string,
  pairedTokenAddress: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const arrVaults1 = (await getVaultsByTokensAB(chainId, dex, depositTokenAddress, pairedTokenAddress)).filter(
    (v) => v.allowTokenA,
  );
  const arrVaults2 = (await getVaultsByTokensAB(chainId, dex, pairedTokenAddress, depositTokenAddress)).filter(
    (v) => v.allowTokenB,
  );

  // eslint-disable-next-line no-return-await
  return [...arrVaults1, ...arrVaults2];
}

export async function getVaultsByPool(
  poolAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
): Promise<VaultsByPoolQueryData['deployICHIVaults']> {
  const key = `pool-${chainId}-${poolAddress}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultsByPoolQueryData['deployICHIVaults'];
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);
  const ttl = 3600000;

  try {
    if (publishedUrl) {
      const result = await sendVaultsByPoolQueryRequest(publishedUrl, poolAddress, vaultByPoolQuery);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultsByPoolQueryRequest(url, poolAddress, vaultByPoolQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get vaults by pool ${poolAddress}`);
    }
  }
}

export async function validateVaultData(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<{ chainId: SupportedChainId; vault: IchiVault }> {
  const network = await jsonProvider.getNetwork();
  const chainId = Number(network.chainId) as SupportedChainId;

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);

  return { chainId, vault };
}

export async function getChainByProvider(jsonProvider: JsonRpcProvider): Promise<{ chainId: SupportedChainId }> {
  const network = await jsonProvider.getNetwork();
  const chainId = Number(network.chainId) as SupportedChainId;

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  return { chainId };
}

export async function getAllRewardVaults(chainId: SupportedChainId, dex: SupportedDex): Promise<VaultWithRewards[]> {
  const key = `allvaults-${chainId}-${dex}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultWithRewards[];
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);
  const ttl = 3600000;

  try {
    if (publishedUrl) {
      const result = await sendAllRewardVaultsQueryRequest(publishedUrl, allRewardVaults);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendAllRewardVaultsQueryRequest(url, allRewardVaults);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get reward vaults on dex ${dex}`);
    }
  }
}
