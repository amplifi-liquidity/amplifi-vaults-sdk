/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */

import { JsonRpcProvider } from 'ethers';
import { getERC20Contract, getIchiVaultContract } from '../contracts';
import { IchiVault, SupportedChainId, TotalAmounts, TotalAmountsBN, ichiVaultDecimals } from '../types';
import formatBigInt from '../utils/formatBigInt';
// eslint-disable-next-line import/no-cycle
import cache from '../utils/cache';

export async function getTokenDecimals(
  tokenAddress: string,
  jsonProvider: JsonRpcProvider,
  chainId: SupportedChainId,
): Promise<number> {
  const key = `token-${chainId}-${tokenAddress}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as number;
  }
  const ttl = 24 * 60 * 60 * 1000;
  try {
    const tokenContract = getERC20Contract(tokenAddress, jsonProvider);
    const tokenDecimals = Number(await tokenContract.decimals());
    cache.set(key, tokenDecimals, ttl);
    return tokenDecimals;
  } catch (error) {
    console.error(error);
    throw new Error(`Could not get token decimals for ${tokenAddress} on ${chainId}`);
  }
}

export async function _getTotalAmounts(
  vault: IchiVault,
  jsonProvider: JsonRpcProvider,
  chainId: SupportedChainId,
): Promise<TotalAmounts>;

export async function _getTotalAmounts(
  vault: IchiVault,
  jsonProvider: JsonRpcProvider,
  chainId: SupportedChainId,
  raw: true,
): Promise<TotalAmountsBN>;

export async function _getTotalAmounts(
  vault: IchiVault,
  jsonProvider: JsonRpcProvider,
  chainId: SupportedChainId,
  raw?: true,
) {
  const vaultContract = getIchiVaultContract(vault.id, jsonProvider);
  const totalAmountsBN = await vaultContract.getTotalAmounts();

  if (!raw) {
    const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider, chainId);
    const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider, chainId);
    const totalAmounts = {
      total0: formatBigInt(totalAmountsBN.total0, token0Decimals),
      total1: formatBigInt(totalAmountsBN.total1, token1Decimals),
      0: formatBigInt(totalAmountsBN.total0, token0Decimals),
      1: formatBigInt(totalAmountsBN.total1, token1Decimals),
    } as TotalAmounts;
    return totalAmounts;
  }

  return totalAmountsBN;
}

export async function _getTotalSupply(vaultAddress: string, jsonProvider: JsonRpcProvider): Promise<string>;

export async function _getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  raw: true,
): Promise<bigint>;

export async function _getTotalSupply(vaultAddress: string, jsonProvider: JsonRpcProvider, raw?: true) {
  try {
    const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
    const totalSupply = await vaultContract.totalSupply();

    return raw ? totalSupply : formatBigInt(totalSupply, ichiVaultDecimals);
  } catch (error) {
    console.error(error);
    throw new Error(`Could not get total supply for ${vaultAddress}`);
  }
}
