import { JsonRpcProvider, MaxUint256, ContractTransactionResponse, Overrides, Signer } from 'ethers';
import {
  getDepositGuardWithHtsWrappingContract,
  getERC20Contract,
  getERC20WrapperContract,
  getIchiVaultContract,
} from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedDex, SupportedChainId } from '../types';
import { calculateGasMargin, getGasLimit } from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { addressConfig, ERC20_WRAPPER_ADDRESS } from '../utils/config/addresses';
import getVaultDeployer from './vaultBasics';
import { getTokenDecimals } from './_totalBalances';
import amountWithSlippage from '../utils/amountWithSlippage';

export async function isTokenApproved(
  accountAddress: string,
  tokenAddress: string,
  amount: string | number | bigint,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const tokenContract = getERC20Contract(tokenAddress, jsonProvider);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const currentAllowanceBN = await tokenContract.allowance(accountAddress, depositGuardAddress);
  const tokenDecimals = Number(await tokenContract.decimals());

  const amountBN = typeof amount === 'bigint' ? amount : parseBigInt(amount, tokenDecimals);

  return currentAllowanceBN > 0n && currentAllowanceBN >= amountBN;
}

export async function approveToken(
  accountAddress: string,
  tokenAddress: string,
  vaultAddress: string,
  signer: Signer,
  dex: SupportedDex,
  amount?: string | number | bigint,
  overrides?: Overrides,
): Promise<ContractTransactionResponse> {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider');
  }
  const jsonProvider = signer.provider as JsonRpcProvider;
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const tokenContract = getERC20Contract(tokenAddress, signer);
  const tokenDecimals = Number(await tokenContract.decimals());

  // eslint-disable-next-line no-nested-ternary
  const amountBN = amount
    ? typeof amount === 'bigint'
      ? amount
      : parseBigInt(amount, tokenDecimals || 18)
    : MaxUint256;

  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const gasLimit =
    overrides?.gasLimit ?? calculateGasMargin(await tokenContract.approve.estimateGas(depositGuardAddress, amountBN));

  return tokenContract.approve(depositGuardAddress, amountBN, { gasLimit });
}

export async function getActualDepositToken(depositToken: string, jsonProvider: JsonRpcProvider): Promise<string> {
  const erc20WrapperContract = getERC20WrapperContract(ERC20_WRAPPER_ADDRESS, jsonProvider);
  const erc20Counterpart = await erc20WrapperContract.erc20Counterpart(depositToken);

  // If there's a valid ERC20 counterpart (non-zero address), return it; otherwise return original token
  return erc20Counterpart !== '0x0000000000000000000000000000000000000000' ? erc20Counterpart : depositToken;
}

export async function depositWithHtsWrapping(
  accountAddress: string,
  amount0: string | number | bigint,
  amount1: string | number | bigint,
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

  // This function is only applicable for BONZO vaults on Hedera
  if (dex !== SupportedDex.Bonzo || chainId !== SupportedChainId.hedera) {
    throw new Error(
      `depositWithHtsWrapping is only supported for Bonzo vaults on Hedera. Got dex: ${dex}, chainId: ${chainId}`,
    );
  }
  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  const token0 = vault.tokenA;
  const token1 = vault.tokenB;
  const isToken0Allowed = vault.allowTokenA;
  const isToken1Allowed = vault.allowTokenB;
  const token0Decimals = await getTokenDecimals(token0, jsonProvider, chainId);
  const token1Decimals = await getTokenDecimals(token1, jsonProvider, chainId);
  const amount0BN = typeof amount0 === 'bigint' ? amount0 : parseBigInt(amount0, token0Decimals);
  const amount1BN = typeof amount1 === 'bigint' ? amount1 : parseBigInt(amount1, token1Decimals);

  if (!isToken0Allowed && amount0BN > 0n) {
    throw new Error(`Deposit of token0 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  if (!isToken1Allowed && amount1BN > 0n) {
    throw new Error(`Deposit of token1 is not allowed: chain ${chainId}, vault ${vaultAddress}`);
  }

  let depositAmount = amount0BN;
  let depositToken = token0;
  if (amount1BN > 0n) {
    depositAmount = amount1BN;
    depositToken = token1;
  }

  // Check if the deposit token has an ERC20 counterpart
  const actualDepositToken = await getActualDepositToken(depositToken, jsonProvider);

  const isApproved = await isTokenApproved(
    accountAddress,
    actualDepositToken,
    depositAmount,
    vaultAddress,
    jsonProvider,
    dex,
  );
  if (!isApproved) {
    throw new Error(
      `Deposit is not approved for token: ${actualDepositToken}, chain ${chainId}, vault ${vaultAddress}`,
    );
  }

  const tokenContract = getERC20Contract(actualDepositToken, jsonProvider);
  const userTokenBalance = await tokenContract.balanceOf(accountAddress);

  if (userTokenBalance < depositAmount) {
    throw new Error(`Deposit amount exceeds user token amount for token: ${actualDepositToken}, chain ${chainId}`);
  }

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const maxDeposit0 = await vaultContract.deposit0Max();
  const maxDeposit1 = await vaultContract.deposit1Max();
  if (amount0BN > maxDeposit0 || amount1BN > maxDeposit1) {
    throw new Error(`Deposit amount exceeds max deposit amount: vault ${vaultAddress}, chain ${chainId}`);
  }

  // Obtain Deposit Guard with HTS Wrapping contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const depositGuardContract = getDepositGuardWithHtsWrappingContract(depositGuardAddress, signer);
  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let lpAmount = await depositGuardContract.depositToICHIVaultAndTryWrapToHTS.staticCall(
    vaultAddress,
    vaultDeployerAddress,
    actualDepositToken,
    depositAmount,
    0n,
    accountAddress,
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, for example 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  lpAmount = amountWithSlippage(lpAmount, percentSlippage);

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.depositToICHIVaultAndTryWrapToHTS.estimateGas(
        vaultAddress,
        vaultDeployerAddress,
        actualDepositToken,
        depositAmount,
        lpAmount,
        accountAddress,
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.depositToICHIVaultAndTryWrapToHTS(
    vaultAddress,
    vaultDeployerAddress,
    actualDepositToken,
    depositAmount,
    lpAmount,
    accountAddress,
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
