// eslint-disable-next-line import/no-unresolved
import { gql } from 'graphql-request';
import { SupportedChainId, SupportedDex } from '../types';
import { addressConfig } from '../utils/config/addresses';
import { getGraphUrls } from '../utils/getGraphUrls';
import { isVelodromeDex } from '../utils/isVelodrome';

function noHoldersCount(dex: SupportedDex, chainId: SupportedChainId): boolean {
  return (
    dex === SupportedDex.Fenix ||
    dex === SupportedDex.Henjin ||
    dex === SupportedDex.Thirdfy ||
    (dex === SupportedDex.Sushiswap && chainId === SupportedChainId.skale_europa) ||
    (dex === SupportedDex.Velocore && chainId === SupportedChainId.zksync_era_testnet)
  );
}

export function vaultQuery(includeHoldersCount: boolean, version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($vaultAddress: String!) {
        ichiVault(id: $vaultAddress) {
          id
          token0
          token1
          allowToken0
          allowToken1
          fee
          ${includeHoldersCount ? 'holdersCount' : ''}
        }
      }
    `;
  }

  // Default to version 1
  return gql`
    query ($vaultAddress: String!) {
      ichiVault(id: $vaultAddress) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
        fee
        ${includeHoldersCount ? 'holdersCount' : ''}
      }
    }
  `;
}

export function vaultQueryAlgebra(includeHoldersCount: boolean, version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($vaultAddress: String!) {
        ichiVault(id: $vaultAddress) {
          id
          token0
          token1
          allowToken0
          allowToken1
          ${includeHoldersCount ? 'holdersCount' : ''}
        }
      }
    `;
  }

  // Default to version 1
  return gql`
    query ($vaultAddress: String!) {
      ichiVault(id: $vaultAddress) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
        ${includeHoldersCount ? 'holdersCount' : ''}
      }
    }
  `;
}

export const vaultQueryVelodrome = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      id
      token0
      token1
      allowToken0
      allowToken1
      holdersCount
      farmingContract {
        id
        rewardTokens {
          token
          tokenDecimals
        }
      }
    }
  }
`;

/**
 * Returns the appropriate GraphQL query for vault information based on chain and DEX configuration
 *
 * @param chainId - The blockchain ID
 * @param dex - The decentralized exchange
 * @returns The appropriate GraphQL query string
 */
export function getVaultQuery(chainId: SupportedChainId, dex: SupportedDex) {
  const includeHoldersCount = !noHoldersCount(dex, chainId);
  const { version } = getGraphUrls(chainId, dex);

  // Check for Velodrome AMM version first
  if (isVelodromeDex(chainId, dex)) {
    return vaultQueryVelodrome;
  }

  const isAlgebra = addressConfig[chainId]?.[dex]?.isAlgebra;
  const is2Thick = addressConfig[chainId]?.[dex]?.is2Thick;

  return isAlgebra || is2Thick
    ? vaultQueryAlgebra(includeHoldersCount, version)
    : vaultQuery(includeHoldersCount, version);
}

export function vaultByTokensQuery(version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($addressTokenA: String!, $addressTokenB: String!) {
        ichiVaults(where: { token0: $addressTokenA, token1: $addressTokenB }) {
          id
          token0
          token1
          allowToken0
          allowToken1
        }
      }
    `;
  }

  return gql`
    query ($addressTokenA: String!, $addressTokenB: String!) {
      ichiVaults(where: { tokenA: $addressTokenA, tokenB: $addressTokenB }) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
      }
    }
  `;
}

export const vaultByPoolQuery = gql`
  query ($poolAddress: String!) {
    deployICHIVaults(where: { pool: $poolAddress }) {
      vault
    }
  }
`;

export const rebalancesQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultCollectFeesQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultCollectFees(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: $createdAtTimestamp_gt,
        ${lastTimestamp ? `createdAtTimestamp_gt: "${lastTimestamp}"` : ''}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultDepositsQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultWithdrawsQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const allEventsQuery = (lastTimestamps: {
  rebalances?: string;
  collectFees?: string;
  deposits?: string;
  withdraws?: string;
}) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.rebalances ? `"${lastTimestamps.rebalances}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultCollectFees(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.collectFees ? `"${lastTimestamps.collectFees}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.deposits ? `"${lastTimestamps.deposits}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    },
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.withdraws ? `"${lastTimestamps.withdraws}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const allEventsNoCollectFeesQuery = (lastTimestamps: {
  rebalances?: string;
  deposits?: string;
  withdraws?: string;
}) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.rebalances ? `"${lastTimestamps.rebalances}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.deposits ? `"${lastTimestamps.deposits}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    },
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.withdraws ? `"${lastTimestamps.withdraws}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export function getUserBalancesQuery(chainId: SupportedChainId, dex: SupportedDex) {
  const { version } = getGraphUrls(chainId, dex);

  // Check for Velodrome AMM version first
  const isVelodrome = isVelodromeDex(chainId, dex);

  return gql`
    query ($accountAddress: String!) {
      user(id: $accountAddress) {
        vaultShares {
          vault {
            id
            ${version === 2 ? 'token0' : 'tokenA'}
            ${version === 2 ? 'token1' : 'tokenB'}
            ${isVelodrome ? 'farmingContract { id }' : ''}
          }
          vaultShareBalance
          ${isVelodrome ? 'stakedVaultShareBalance' : ''}
        }
      }
    }
  `;
}

export const feeAprQuery = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      feeApr_1d
      feeApr_3d
      feeApr_7d
      feeApr_30d
    }
  }
`;

export const rewardInfoQuery = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      id
      farmingContract {
        id
        rewardTokens {
          rewardRatePerToken_1d
          rewardRatePerToken_3d
          token
          tokenDecimals
        }
      }
    }
  }
`;

export const allRewardInfoQuery = gql`
  query {
    ichiVaults {
      id
      farmingContract {
        id
        rewardTokens {
          rewardRatePerToken_1d
          rewardRatePerToken_3d
          token
          tokenDecimals
        }
      }
    }
  }
`;

export const allRewardVaults = gql`
  query {
    ichiVaults(where: { farmingContract_: { id_not: null } }) {
      id
      farmingContract {
        id
        rewardTokens {
          token
          tokenDecimals
        }
      }
    }
  }
`;
