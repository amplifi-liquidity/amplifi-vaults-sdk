import { JsonRpcProvider } from 'ethers';
import { getERC20Contract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { IchiVault, SupportedChainId, SupportedDex, ichiVaultDecimals } from '../types';
import { addressConfig } from '../utils/config/addresses';

// eslint-disable-next-line no-underscore-dangle
export async function _isVaultTokenApproved(
  accountAddress: string,
  shares: string | number | bigint,
  vault: IchiVault,
  chainId: SupportedChainId,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const vaultTokenContract = getERC20Contract(vault.id, jsonProvider);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard for vault ${vault.id} not found on chain ${chainId} and dex ${dex}`);
  }
  const currentAllowanceBN = await vaultTokenContract.allowance(accountAddress, depositGuardAddress);

  const sharesBN = typeof shares === 'bigint' ? shares : parseBigInt(shares, ichiVaultDecimals);

  return currentAllowanceBN > 0n && currentAllowanceBN >= sharesBN;
}
