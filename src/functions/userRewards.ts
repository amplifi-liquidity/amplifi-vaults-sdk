/* eslint-disable no-redeclare */
/* eslint-disable import/no-cycle */

import { JsonRpcProvider } from 'ethers';
import { getAllRewardVaults, getChainId, validateVaultData } from './vault';
import {
  SupportedDex,
  UserRewards,
  UserRewardsBN,
  UserRewardsByToken,
  UserRewardsByTokenBN,
  VaultWithRewards,
} from '../types';
import { isMfdEnabled } from '../utils/isVelodrome';
import { getMultiFeeDistributorContract } from '../contracts';
import formatBigInt from '../utils/formatBigInt';
import { decodeFarmingRewardsResult, encodeFarmingRewardsCall, multicall } from '../utils/multicallUtils';

function verifiedClaimableRewards(
  tokens: string[],
  amounts: bigint[],
  metadata: { token: string; tokenDecimals: number }[] | undefined,
): UserRewardsByTokenBN[] {
  if (tokens.length !== amounts.length) {
    throw new Error('Malformed claimable reward arrays');
  }
  // Decoded ethers Results would make flatMap return a Result; copy to a plain array first.
  return Array.from(tokens).flatMap((token, index) => {
    const decimals = metadata?.find((entry) => entry.token.toLowerCase() === token.toLowerCase())?.tokenDecimals;
    if (decimals == null && amounts[index] === 0n) return [];
    if (decimals == null || !Number.isInteger(Number(decimals)) || Number(decimals) < 0 || Number(decimals) > 255) {
      throw new Error('Claimable reward is missing token decimals');
    }
    return [{ token, tokenDecimals: Number(decimals), rewardAmount: amounts[index] }];
  });
}

function formattedRewards(rewards: UserRewardsByTokenBN[]): UserRewardsByToken[] {
  return rewards.map((reward) => ({
    ...reward,
    rewardAmount: formatBigInt(reward.rewardAmount, reward.tokenDecimals),
  }));
}

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
  const chainId = await getChainId(jsonProvider);
  if (!isMfdEnabled(chainId, dex)) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // eslint-disable-next-line no-return-await
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const { rewardTokens } = vault;
  if (!vault.farmingContract) {
    return [];
  }

  const mfdContract = getMultiFeeDistributorContract(vault.farmingContract, jsonProvider);
  const result = await mfdContract.claimableRewards(accountAddress); // [[rewardTokens], [amounts]]
  const rewards = verifiedClaimableRewards(result[0], result[1], rewardTokens);
  return raw ? rewards : formattedRewards(rewards);
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
  const chainId = await getChainId(jsonProvider);
  if (!isMfdEnabled(chainId, dex)) {
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

  const processedResults = vaults.map((vault: VaultWithRewards, index: number): UserRewards | UserRewardsBN => {
    const [tokens, amounts] = decodeFarmingRewardsResult(results[index], vault.farmingContract.id);
    const rewardTokens = verifiedClaimableRewards(tokens, amounts, vault.farmingContract.rewardTokens);
    return raw
      ? { vaultAddress: vault.id, rewardTokens }
      : { vaultAddress: vault.id, rewardTokens: formattedRewards(rewardTokens) };
  });
  return processedResults;
}
