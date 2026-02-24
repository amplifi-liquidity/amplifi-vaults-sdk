/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider, MaxUint256, ContractTransactionResponse, Overrides, Signer } from 'ethers';
import { getDepositGuardContract, getERC20Contract, getIchiVaultContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { IchiVault, SupportedChainId, SupportedDex, ichiVaultDecimals } from '../types';
import { getGasLimit, calculateGasMargin } from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { addressConfig } from '../utils/config/addresses';
import amountWithSlippage from '../utils/amountWithSlippage';
import { getUserBalance } from './userBalances';
import getVaultDeployer from './vaultBasics';

export async function approveVaultToken(
  accountAddress: string,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  shares?: string | number | bigint,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const vaultTokenContract = getERC20Contract(vaultAddress, signer);

  // eslint-disable-next-line no-nested-ternary
  const sharesBN = shares
    ? typeof shares === 'bigint'
      ? shares
      : parseBigInt(shares, ichiVaultDecimals)
    : MaxUint256;

  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(await vaultTokenContract.approve.estimateGas(depositGuardAddress, sharesBN));

  return vaultTokenContract.approve(depositGuardAddress, sharesBN, { gasLimit });
}

// eslint-disable-next-line no-underscore-dangle
async function _isVaultTokenApproved(
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
    throw new Error(`Deposit Guard  for vault ${vault.id} not found on chain ${chainId} and dex ${dex}`);
  }
  const currentAllowanceBN = await vaultTokenContract.allowance(accountAddress, depositGuardAddress);

  const sharesBN = typeof shares === 'bigint' ? shares : parseBigInt(shares, ichiVaultDecimals);

  return currentAllowanceBN > 0n && currentAllowanceBN >= sharesBN;
}

export async function isVaultTokenApproved(
  accountAddress: string,
  shares: string | number | bigint,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  return _isVaultTokenApproved(accountAddress, shares, vault, chainId, jsonProvider, dex);
}

export async function withdraw(
  accountAddress: string,
  shares: string | number | bigint,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const vaultContract = getIchiVaultContract(vaultAddress, signer);

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = typeof shares === 'bigint' ? shares : parseBigInt(shares, 18);
  if ((await userShares) < withdrawShares) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const sharesBN = typeof shares === 'bigint' ? shares : parseBigInt(shares, 18);
  const gasLimit = overrides?.gasLimit ?? calculateGasMargin(await vaultContract.withdraw.estimateGas(sharesBN, accountAddress));

  return vaultContract.withdraw(sharesBN, accountAddress, { ...overrides, gasLimit });
}

export async function withdrawWithSlippage(
  accountAddress: string,
  shares: string | number | bigint,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  if (addressConfig[chainId as SupportedChainId][dex]?.depositGuard.version !== 2) {
    throw new Error(`Unsupported function for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = typeof shares === 'bigint' ? shares : parseBigInt(shares, 18);
  if ((await userShares) < withdrawShares) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const isApproved = await _isVaultTokenApproved(accountAddress, withdrawShares, vault, chainId, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Vault token transfer is not approved for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.forwardWithdrawFromICHIVault.staticCall(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    0n,
    0n,
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, default - 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  amounts = {
    0: amountWithSlippage(amounts[0], percentSlippage),
    1: amountWithSlippage(amounts[1], percentSlippage),
    amount0: amountWithSlippage(amounts[0], percentSlippage),
    amount1: amountWithSlippage(amounts[1], percentSlippage),
  } as [bigint, bigint] & { amount0: bigint; amount1: bigint };

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.forwardWithdrawFromICHIVault.estimateGas(
        vaultAddress,
        vaultDeployerAddress,
        withdrawShares,
        accountAddress,
        amounts[0],
        amounts[1],
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    amounts[0],
    amounts[1],
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}

export async function withdrawNativeToken(
  accountAddress: string,
  shares: string | number | bigint,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  if (chainId === SupportedChainId.celo) {
    throw new Error(`This function is not supported on chain ${chainId}`);
  }

  if (addressConfig[chainId as SupportedChainId][dex]?.depositGuard.version !== 2) {
    throw new Error(`Unsupported function for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = typeof shares === 'bigint' ? shares : parseBigInt(shares, 18);
  if ((await userShares) < withdrawShares) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const isApproved = await _isVaultTokenApproved(accountAddress, withdrawShares, vault, chainId, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Vault token transfer is not approved for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const wrappedNative =
    chainId === SupportedChainId.hedera
      ? '0x0000000000000000000000000000000000163b5a'
      : await depositGuardContract.WRAPPED_NATIVE();
  if (
    wrappedNative.toLowerCase() !== vault.tokenA.toLowerCase() &&
    wrappedNative.toLowerCase() !== vault.tokenB.toLowerCase()
  ) {
    throw new Error('None of vault tokens is wrapped native token');
  }

  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.forwardNativeWithdrawFromICHIVault.staticCall(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    0n,
    0n,
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, default - 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  amounts = {
    0: amountWithSlippage(amounts[0], percentSlippage),
    1: amountWithSlippage(amounts[1], percentSlippage),
    amount0: amountWithSlippage(amounts[0], percentSlippage),
    amount1: amountWithSlippage(amounts[1], percentSlippage),
  } as [bigint, bigint] & { amount0: bigint; amount1: bigint };

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.forwardNativeWithdrawFromICHIVault.estimateGas(
        vaultAddress,
        vaultDeployerAddress,
        withdrawShares,
        accountAddress,
        amounts[0],
        amounts[1],
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardNativeWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    amounts[0],
    amounts[1],
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
