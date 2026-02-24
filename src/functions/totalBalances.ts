/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from 'ethers';
import { SupportedDex, TotalAmounts, TotalAmountsBN } from '../types';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { _getTotalAmounts, _getTotalSupply } from './_totalBalances';

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<TotalAmounts>;

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<TotalAmountsBN>;

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  if (!raw) {
    return _getTotalAmounts(vault, jsonProvider, chainId);
  }
  return _getTotalAmounts(vault, jsonProvider, chainId, true);
}

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<string>;

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<bigint>;

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  await validateVaultData(vaultAddress, jsonProvider, dex);

  if (!raw) {
    return _getTotalSupply(vaultAddress, jsonProvider);
  }
  return _getTotalSupply(vaultAddress, jsonProvider, true);
}
