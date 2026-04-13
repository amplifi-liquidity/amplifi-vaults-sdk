import { JsonRpcProvider, ContractTransactionResponse, Overrides, Signer } from 'ethers';
import { SupportedDex, SupportedChainId } from '../types';
import { isMfdEnabled } from '../utils/isVelodrome';
// eslint-disable-next-line import/no-cycle
import { getChainId, validateVaultData } from './vault';
import { getMultiFeeDistributorContract } from '../contracts';
import { calculateGasMargin } from '../types/calculateGasMargin';

/**
 * Claims rewards from the farming contract associated with a vault
 *
 * @param accountAddress - The address of the account claiming rewards
 * @param vaultAddress - The address of the vault
 * @param signer - The signer for the transaction
 * @param dex - The DEX to use
 * @param overrides - Optional transaction overrides
 * @returns The transaction
 */
// eslint-disable-next-line import/prefer-default-export
export async function claimRewards(
  accountAddress: string,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const chainId = await getChainId(jsonProvider);
  if (!isMfdEnabled(chainId, dex)) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // Get the vault data to find the farming contract
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  if (!vault.farmingContract || !vault.rewardTokens || vault.rewardTokens.length <= 0) {
    throw new Error(`Vault ${vaultAddress} does not have an associated farming contract or reward tokens`);
  }
  const farmingContract = getMultiFeeDistributorContract(vault.farmingContract, signer);
  const rewardTokenAddresses = vault.rewardTokens.map((t) => t.token);

  // Estimate gas for the transaction
  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(await farmingContract.getReward.estimateGas(accountAddress, rewardTokenAddresses));

  // Execute the claim transaction
  const tx = await farmingContract.getReward(accountAddress, rewardTokenAddresses, { ...overrides, gasLimit });

  return tx;
}
