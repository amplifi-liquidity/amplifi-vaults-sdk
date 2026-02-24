import { Contract, Interface, Signer } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import { SupportedChainId } from '../types';
import { MULTICALL_ADDRESSES } from './config/addresses';
import { getERC20Contract, getIchiVaultContract, getMultiFeeDistributorContract } from '../contracts';
import multicallAbi from '../abis/multicall.json';

interface Call {
  target: string;
  gasLimit: number;
  callData: string;
}

export interface Result {
  success: boolean;
  gasUsed: bigint;
  returnData: string;
}

interface MulticallResponse {
  blockNumber: bigint;
  returnData: Result[];
}

export function getMulticallContract(chainId: SupportedChainId, provider: JsonRpcProvider | Signer): Contract {
  const address = MULTICALL_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`Multicall not supported on chain ${chainId}`);
  }
  return new Contract(address, multicallAbi, provider);
}

const DEFAULT_BATCH_SIZE = 50;

export async function multicall(
  calls: Call[],
  chainId: SupportedChainId,
  provider: JsonRpcProvider | Signer,
  batchSize: number = DEFAULT_BATCH_SIZE,
): Promise<Result[]> {
  const multicallContract = getMulticallContract(chainId, provider);

  // If calls fit in one batch, execute directly
  if (calls.length <= batchSize) {
    const { returnData }: MulticallResponse = await multicallContract.multicall.staticCall(calls);
    return returnData;
  }

  // Split calls into batches to avoid gas limit issues
  const batches: Call[][] = [];
  for (let i = 0; i < calls.length; i += batchSize) {
    batches.push(calls.slice(i, i + batchSize));
  }

  // Execute all batches in parallel
  const batchResults = await Promise.all(
    batches.map(async (batch) => {
      const { returnData }: MulticallResponse = await multicallContract.multicall.staticCall(batch);
      return returnData;
    }),
  );

  // Flatten results
  return batchResults.flat();
}

export function encodeTotalAmountsCall(vaultAddress: string): Call {
  const vaultInterface = new Interface(getIchiVaultContract(vaultAddress, null as any).interface.format());
  return {
    target: vaultAddress,
    gasLimit: 1000000,
    callData: vaultInterface.encodeFunctionData('getTotalAmounts'),
  };
}

export function encodeTotalSupplyCall(vaultAddress: string): Call {
  const vaultInterface = new Interface(getIchiVaultContract(vaultAddress, null as any).interface.format());
  return {
    target: vaultAddress,
    gasLimit: 1000000,
    callData: vaultInterface.encodeFunctionData('totalSupply'),
  };
}

export function encodeDecimalsCall(tokenAddress: string): Call {
  const tokenInterface = new Interface(getERC20Contract(tokenAddress, null as any).interface.format());
  return {
    target: tokenAddress,
    gasLimit: 1000000,
    callData: tokenInterface.encodeFunctionData('decimals'),
  };
}

export function encodeFarmingRewardsCall(farmingContractAddress: string, userAddress: string): Call {
  const farmingInterface = new Interface(
    getMultiFeeDistributorContract(farmingContractAddress, null as any).interface.format(),
  );
  return {
    target: farmingContractAddress,
    gasLimit: 1000000,
    callData: farmingInterface.encodeFunctionData('claimableRewards', [userAddress]),
  };
}

export function decodeTotalAmountsResult(
  result: Result,
  vaultAddress: string,
): { total0: bigint; total1: bigint } {
  if (!result.success) {
    throw new Error('Failed to get total amounts');
  }
  const vaultInterface = new Interface(getIchiVaultContract(vaultAddress, null as any).interface.format());
  const decoded = vaultInterface.decodeFunctionResult('getTotalAmounts', result.returnData);
  return {
    total0: decoded[0],
    total1: decoded[1],
  };
}

export function decodeTotalSupplyResult(result: Result, vaultAddress: string): bigint {
  if (!result.success) {
    throw new Error('Failed to get total supply');
  }
  const vaultInterface = new Interface(getIchiVaultContract(vaultAddress, null as any).interface.format());
  return vaultInterface.decodeFunctionResult('totalSupply', result.returnData)[0];
}

export function decodeDecimalsResult(result: Result, tokenAddress: string): number {
  if (!result.success) {
    throw new Error('Failed to get decimals');
  }
  const tokenInterface = new Interface(getERC20Contract(tokenAddress, null as any).interface.format());
  return Number(tokenInterface.decodeFunctionResult('decimals', result.returnData)[0]);
}

export function decodeFarmingRewardsResult(result: Result, farmingContractAddress: string): [string[], bigint[]] {
  if (!result.success) {
    throw new Error('Failed to get farming rewards');
  }
  const farmingInterface = new Interface(
    getMultiFeeDistributorContract(farmingContractAddress, null as any).interface.format(),
  );
  const decoded = farmingInterface.decodeFunctionResult('claimableRewards', result.returnData);
  return [decoded[0], decoded[1]]; // [token addresses array, amounts array]
}
