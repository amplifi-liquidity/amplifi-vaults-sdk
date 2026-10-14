/* eslint-disable no-redeclare */
/* eslint-disable import/no-cycle */

import { JsonRpcProvider } from 'ethers';
import { getAllRewardVaults, getChainId, validateVaultData } from './vault';
import {
  RewardToken,
  SupportedDex,
  UserRewards,
  UserRewardsBN,
  UserRewardsByToken,
  UserRewardsByTokenBN,
  VaultWithRewards,
} from '../types';
import { isMfdEnabled } from '../utils/isVelodrome';
import { getERC20Contract, getMultiFeeDistributorContract } from '../contracts';
import formatBigInt from '../utils/formatBigInt';
import {
  decodeDecimalsResult,
  decodeFarmingRewardsResult,
  encodeDecimalsCall,
  encodeFarmingRewardsCall,
  multicall,
} from '../utils/multicallUtils';
import { isTokenDecimals } from '../graphql/rewardVaults';

/** An incomplete reward read is never presented as a complete array of rewards. */
export class PartialUserRewardsError extends Error {
  readonly failedVaultAddresses: string[];

  readonly rewards: (UserRewards | UserRewardsBN)[];

  constructor(failedVaultAddresses: string[], rewards: (UserRewards | UserRewardsBN)[]) {
    super(`Reward reads unavailable for ${failedVaultAddresses.length} vaults`);
    this.name = 'PartialUserRewardsError';
    this.failedVaultAddresses = failedVaultAddresses;
    this.rewards = rewards;
  }
}

type ClaimableReward = { token: string; tokenDecimals?: number; rewardAmount: bigint };

/** Pair claimable tokens with catalog decimals; zero amounts for tokens missing from the catalog are dropped. */
function claimableRewards(
  tokens: string[],
  amounts: bigint[],
  metadata: Pick<RewardToken, 'token' | 'tokenDecimals'>[] | undefined,
): ClaimableReward[] {
  if (tokens.length !== amounts.length) {
    throw new Error('Malformed claimable reward arrays');
  }
  // Decoded ethers Results would make flatMap return a Result; copy to a plain array first.
  return Array.from(tokens).flatMap((token, index) => {
    const decimals = metadata?.find((entry) => entry.token.toLowerCase() === token.toLowerCase())?.tokenDecimals;
    if (isTokenDecimals(decimals)) return [{ token, tokenDecimals: decimals, rewardAmount: amounts[index] }];
    return amounts[index] === 0n ? [] : [{ token, rewardAmount: amounts[index] }];
  });
}

/** Fill decimals missing from the catalog with on-chain values; formatted amounts never assume 18. */
function withDecimals(rewards: ClaimableReward[], onChainDecimals: Map<string, number>): UserRewardsByTokenBN[] {
  return rewards.map((reward) => {
    const tokenDecimals = reward.tokenDecimals ?? onChainDecimals.get(reward.token.toLowerCase());
    if (tokenDecimals === undefined) throw new Error(`Could not resolve decimals for reward token ${reward.token}`);
    return { ...reward, tokenDecimals };
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
  const claimable = claimableRewards(result[0], result[1], rewardTokens);

  // Vault metadata can lag a newly added reward token; read its decimals on-chain.
  const onChainDecimals = new Map<string, number>();
  await Promise.all(
    claimable
      .filter((reward) => reward.tokenDecimals === undefined)
      .map(async ({ token }) => {
        onChainDecimals.set(token.toLowerCase(), Number(await getERC20Contract(token, jsonProvider).decimals()));
      }),
  );
  const rewards = withDecimals(claimable, onChainDecimals);
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

  const claimable = vaults.map((vault: VaultWithRewards, index: number) => {
    const [tokens, amounts] = decodeFarmingRewardsResult(results[index], vault.farmingContract.id);
    return claimableRewards(tokens, amounts, vault.farmingContract.rewardTokens);
  });

  // The catalog can lag a newly added reward token; read its decimals on-chain rather than failing the DEX.
  const unknownTokens = Array.from(
    new Set(
      claimable
        .flat()
        .filter((reward) => reward.tokenDecimals === undefined)
        .map((reward) => reward.token.toLowerCase()),
    ),
  );
  const onChainDecimals = new Map<string, number>();
  if (unknownTokens.length > 0) {
    try {
      const decimalsResults = await multicall(unknownTokens.map(encodeDecimalsCall), chainId, jsonProvider);
      unknownTokens.forEach((token, index) => {
        try {
          onChainDecimals.set(token, decodeDecimalsResult(decimalsResults[index], token));
        } catch {
          // Left unresolved: only vaults holding a positive amount of this token are omitted below.
        }
      });
    } catch {
      // Left unresolved: only vaults holding a positive amount of an unknown token are omitted below.
    }
  }

  const failedVaultAddresses: string[] = [];
  const rewards = vaults.flatMap((vault: VaultWithRewards, index: number): (UserRewards | UserRewardsBN)[] => {
    let rewardTokens: UserRewardsByTokenBN[];
    try {
      rewardTokens = withDecimals(claimable[index], onChainDecimals);
    } catch {
      failedVaultAddresses.push(vault.id);
      return [];
    }
    return [
      raw
        ? { vaultAddress: vault.id, rewardTokens }
        : { vaultAddress: vault.id, rewardTokens: formattedRewards(rewardTokens) },
    ];
  });
  if (failedVaultAddresses.length > 0) throw new PartialUserRewardsError(failedVaultAddresses, rewards);
  return rewards;
}
