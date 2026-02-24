/* eslint-disable no-redeclare */
/* eslint-disable import/no-cycle */

import { JsonRpcProvider } from 'ethers';
import { getAllRewardVaults, validateVaultData } from './vault';
import {
  SupportedDex,
  UserRewards,
  UserRewardsBN,
  UserRewardsByToken,
  UserRewardsByTokenBN,
  VaultWithRewards,
} from '../types';
import { isVelodromeDex } from '../utils/isVelodrome';
import { getMultiFeeDistributorContract } from '../contracts';
import formatBigInt from '../utils/formatBigInt';
import { decodeFarmingRewardsResult, encodeFarmingRewardsCall, multicall } from '../utils/multicallUtils';

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserRewardsByToken[]>;

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserRewardsByTokenBN[]>;

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const network = await jsonProvider.getNetwork();
  const chainId = Number(network.chainId);
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // eslint-disable-next-line no-return-await
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const { rewardTokens } = vault;
  if (!vault.farmingContract || !rewardTokens || rewardTokens.length <= 0) {
    return [];
  }

  const mfdContract = getMultiFeeDistributorContract(vault.farmingContract, jsonProvider);
  const result = await mfdContract.claimableRewards(accountAddress); // [[rewardTokens], [amounts]]
  if (result[0].length <= 0 || result[1].length <= 0) {
    return [];
  }
  const tokens = result[0];
  const amounts = result[1];

  const rewards = tokens.map((token, ind) => {
    const decimals = rewardTokens?.find((rt) => rt.token.toLowerCase() === token.toLowerCase())?.tokenDecimals;
    return raw
      ? {
          token,
          tokenDecimals: decimals,
          rewardAmount: amounts[ind],
        }
      : {
          token,
          tokenDecimals: decimals,
          rewardAmount: formatBigInt(amounts[ind], decimals),
        };
  });

  return rewards;
}

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserRewards[]>;

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserRewardsBN[]>;

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const network = await jsonProvider.getNetwork();
  const chainId = Number(network.chainId);
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // Get all vaults with reward contracts
  const vaults = await getAllRewardVaults(chainId, dex);

  if (vaults.length === 0) {
    return [];
  }

  // Prepare multicall to get rewards for all vaults at once
  const farmingContractCalls = vaults.map((v) => {
    return encodeFarmingRewardsCall(v.farmingContract.id, accountAddress);
  });

  // Execute multicall
  const results = await multicall(farmingContractCalls, chainId, jsonProvider);

  // Process results
  const processedResults = vaults.map((vault: VaultWithRewards, index: number) => {
    const rewards = decodeFarmingRewardsResult(results[index], vault.farmingContract.id);
    if (rewards[0].length <= 0 || rewards[1].length <= 0) {
      return [];
    }
    const { rewardTokens } = vault.farmingContract;
    if (!rewardTokens || rewardTokens.length <= 0) {
      return [];
    }
    const tokens = rewards[0];
    const amounts = rewards[1];
    if (raw) {
      return {
        vaultAddress: vault.id,
        rewardTokens: tokens.map((token, ind) => {
          const decimals = vault.farmingContract.rewardTokens.find(
            (rt) => rt.token.toLowerCase() === token.toLowerCase(),
          )?.tokenDecimals;
          return { token, tokenDecimals: decimals, rewardAmount: amounts[ind] };
        }),
      };
    } else {
      return {
        vaultAddress: vault.id,
        rewardTokens: tokens.map((token, ind) => {
          const decimals = vault.farmingContract.rewardTokens.find(
            (rt) => rt.token.toLowerCase() === token.toLowerCase(),
          )?.tokenDecimals;
          return { token, tokenDecimals: decimals, rewardAmount: formatBigInt(amounts[ind], decimals) };
        }),
      };
    }
  });

  return processedResults;
}
