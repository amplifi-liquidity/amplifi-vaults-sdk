// eslint-disable-next-line import/no-cycle
import { IchiVault, Fees, VaultTransactionEvent, UserBalances, FeeAprData, RewardInfo } from '..';

export interface VaultQueryData {
  ichiVault: IchiVault;
}

export interface VaultsByTokensQueryData {
  ichiVaults: IchiVault[];
}
export interface VaultsByPoolQueryData {
  deployICHIVaults: string[];
}

export interface RebalancesQueryData {
  vaultRebalances: Fees[];
}
export interface CollectFeesQueryData {
  vaultCollectFees: Fees[];
}
export interface VaultDepositsQueryData {
  vaultDeposits: VaultTransactionEvent[];
}
export interface VaultWithdrawsQueryData {
  vaultWithdraws: VaultTransactionEvent[];
}
export interface UserBalancesQueryData {
  user: UserBalances | null;
}

export interface FeeAprQueryResponse {
  ichiVault: FeeAprData | null;
}
export interface RewardInfoQueryResponse {
  ichiVault: RewardInfo;
}
