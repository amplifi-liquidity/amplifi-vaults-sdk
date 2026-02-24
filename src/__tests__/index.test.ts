/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import 'dotenv/config';

import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import { SupportedDex, SupportedChainId } from '../types';
import ICHIVAULT_ABI from '../abis/IchiVault.json';
import {
  withdraw,
  deposit,
  getMaxDepositAmount,
  isTokenAllowed,
  getTotalAmounts,
  getIchiVaultInfo,
  isDepositTokenApproved,
  approveDepositToken,
  getTotalSupply,
  getUserAmounts,
  getUserBalance,
  getVaultsByTokens,
  getFeesCollected,
  getFeesCollectedInfo,
  getAverageDepositTokenRatios,
  depositNativeToken,
  getLpApr,
  getLpPriceChange,
  getAllUserBalances,
  getAllUserAmounts,
  getVaultMetrics,
  withdrawWithSlippage,
  approveVaultToken,
  isVaultTokenApproved,
  withdrawNativeToken,
  getVaultsByPool,
  getVaultPositions,
  getSupportedDexes,
  getChainsForDex,
  getFeeAprs,
  getRewardInfo,
  getAllRewardInfo,
  getUserRewards,
  claimRewards,
  getAllUserRewards,
  getConfigByFactory,
  getAllFactoryConfigs,
  addressConfig,
  depositWithHtsWrapping,
  withdrawWithErc20Wrapping,
  withdrawNativeTokenWithErc20Wrapping,
  approveToken,
  isTokenApproved,
} from '../index';
import formatBigInt from '../utils/formatBigInt';
import parseBigInt from '../utils/parseBigInt';
import { getTokenDecimals } from '../functions/_totalBalances';

// In ethers v6, use JsonRpcProvider directly for read operations
// For write operations (transactions), a Wallet with the private key is needed
const provider = new JsonRpcProvider(process.env.PROVIDER_URL!, SupportedChainId.base);
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
const account = process.env.ACCOUNT!;

const vault = {
  address: '0x88213a99d59e73763230342652104cA5c8430d10',
  chainId: SupportedChainId.base,
  dex: SupportedDex.TrebleswapV2,
};

const pool = {
  address: '0x205918f0Cbf3d02fFFf97A472A24610b03bB7fF4',
  chainId: SupportedChainId.base,
  dex: SupportedDex.TrebleswapV2,
};

const tokens = {
  pairedToken: '0xB96450dCB16e4a30b999Cb5F4087bae9c0ffAc4e',
  depositToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

const iface = new ethers.Interface(ICHIVAULT_ABI);
const amount0 = '0.1';
const amount1 = '0';
const sharesToWithdraw = '1.8e-16';
const bigAmount = '1000';

describe('Vault', () => {
  let share: string | null = null;

  it.skip('getFeeAprs', async () => {
    const feeAprs = await getFeeAprs(vault.address, provider, vault.dex);
    if (feeAprs) {
      expect(Number(feeAprs.feeApr_1d)).toBeGreaterThanOrEqual(0);
    }
  });

  it.skip('getVaultMetrics', async () => {
    const metrics = await getVaultMetrics(vault.address, provider, vault.dex);
    expect(Number(metrics[0]?.avgDtr)).toBeGreaterThan(0);
  });

  it('getTotalSupply', async () => {
    const totalSupply = await getTotalSupply(vault.address, provider, vault.dex);

    expect(Number(totalSupply)).toBeGreaterThan(0);
  });

  it.skip('approve', async () => {
    let approve: ethers.ContractTransactionResponse | null = null;
    approve = await approveDepositToken(account, 0, vault.address, wallet, vault.dex, amount0);
    await approve.wait();
    const isApproved = await isDepositTokenApproved(account, 0, amount0, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(true);
  });

  it.skip('approveToken', async () => {
    const approve = await approveToken(account, '0xd7d4d91d64a6061fa00a94e2b3a2d2a5fb677849', vault.address, wallet, vault.dex, amount1);
    await approve.wait();
    const isApproved = await isTokenApproved(account, '0xd7d4d91d64a6061fa00a94e2b3a2d2a5fb677849', amount1, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(true);
  });

  it('isDepositTokenApproved', async () => {
    const isApproved = await isDepositTokenApproved(account, 0, bigAmount, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(false);
  });

  it.skip('deposit', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const maxDeposit0 = await getMaxDepositAmount(0, vault.address, provider, vault.dex);
    const maxDeposit1 = await getMaxDepositAmount(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery)
      throw new Error(`Vault ${vault.address} not found on chain ${vault.chainId} and dex ${vault.dex}]`);
    const token0Decimals = await getTokenDecimals(vaultFromQuery.tokenA, provider, vault.chainId);
    const token1Decimals = await getTokenDecimals(vaultFromQuery.tokenB, provider, vault.chainId);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;
    if (parseBigInt(amount0, token0Decimals) > maxDeposit0 || parseBigInt(amount1, token1Decimals) > maxDeposit1)
      return;

    const r = await deposit(account, amount0, amount1, vault.address, wallet, vault.dex);
    const a = await r.wait();

    const result: any = a!.logs
      .map((e: any) => {
        try {
          console.log('iface.parseLog(e):', iface.parseLog(e));
          return iface.parseLog(e);
        } catch (error) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'Deposit')?.args;

    console.log('Deposit:', result);

    share = formatBigInt(result.shares);
    console.log('Deposit share:', share);
  });

  it.skip('depositNativeToken', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const maxDeposit0 = await getMaxDepositAmount(0, vault.address, provider, vault.dex);
    const maxDeposit1 = await getMaxDepositAmount(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery)
      throw new Error(`Vault ${vault.address} not found on chain ${vault.chainId} and dex ${vault.dex}]`);
    const token0Decimals = await getTokenDecimals(vaultFromQuery.tokenA, provider, vault.chainId);
    const token1Decimals = await getTokenDecimals(vaultFromQuery.tokenB, provider, vault.chainId);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;
    if (parseBigInt(amount0, token0Decimals) > maxDeposit0 || parseBigInt(amount1, token1Decimals) > maxDeposit1)
      return;

    const r = await depositNativeToken(account, amount0, amount1, vault.address, wallet, vault.dex);
    const a = await r.wait();

    const result: any = a!.logs
      .map((e: any) => {
        try {
          console.log('iface.parseLog(e):', iface.parseLog(e));
          return iface.parseLog(e);
        } catch (error) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'Deposit')?.args;

    console.log('Deposit:', result);

    share = formatBigInt(result.shares);
    console.log('Deposit share:', share);
  });

  it.skip('depositWithHtsWrapping', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery)
      throw new Error(`Vault ${vault.address} not found on chain ${vault.chainId} and dex ${vault.dex}]`);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;

    const r = await depositWithHtsWrapping(account, amount0, amount1, vault.address, wallet, vault.dex);
    const a = await r.wait();

    const result: any = a!.logs
      .map((e: any) => {
        try {
          console.log('iface.parseLog(e):', iface.parseLog(e));
          return iface.parseLog(e);
        } catch (error) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'Deposit')?.args;

    console.log('Deposit:', result);

    share = formatBigInt(result.shares);
    console.log('Deposit share:', share);
  });

  it('getUserBalance', async () => {
    const userShares = await getUserBalance(account, vault.address, provider, vault.dex);

    expect(Number(userShares)).toBeGreaterThanOrEqual(0);
  });

  it('getAllUserBalances', async () => {
    const allUserShares = await getAllUserBalances(account, provider, vault.dex);

    expect(Number(allUserShares[0].shares)).toBeGreaterThanOrEqual(0);
  });

  it('getAllUserAmounts', async () => {
    const userAmounts = await getAllUserAmounts(account, provider, vault.dex);

    expect(Number(userAmounts[0].userAmounts.amount0)).toBeGreaterThanOrEqual(0);
  });

  it('getTotalAmounts', async () => {
    const totalAmounts = await getTotalAmounts(vault.address, provider, vault.dex);

    expect(Number(totalAmounts.total0)).toBeGreaterThan(0);
  });

  it('getUserAmounts', async () => {
    const amounts = await getUserAmounts(account, vault.address, provider, vault.dex);

    expect(Number(amounts.amount0)).toBeGreaterThanOrEqual(0);
  });

  it('getFeesCollected_All', async () => {
    const fees = await getFeesCollected(vault.address, provider, vault.dex);

    expect(Number(fees[0])).toBeGreaterThanOrEqual(0);
  });

  it('getFeesCollectedInfo', async () => {
    const feeCollected = await getFeesCollectedInfo(vault.address, provider, vault.dex, [1, 7, 30, 1000]);

    expect(Number(feeCollected[0].pctAPR)).toBeGreaterThanOrEqual(0);
  });

  it('getAverageDepositTokenRatios', async () => {
    const avgDtr = await getAverageDepositTokenRatios(vault.address, provider, vault.dex);

    expect(Number(avgDtr[0].percent)).toBeGreaterThanOrEqual(0);
  });

  it('getLpApr', async () => {
    const lpAprs = await getLpApr(vault.address, provider, vault.dex);

    expect(Number(lpAprs[0]?.timeInterval)).toEqual(1);
  });
  it('getLpPriceChange', async () => {
    const lpPriceChange = await getLpPriceChange(vault.address, provider, vault.dex);

    expect(Number(lpPriceChange[0]?.timeInterval)).toEqual(1);
  });
  it('getVaultPositions', async () => {
    const positions = await getVaultPositions(vault.address, provider, vault.dex);
    expect(positions.currentPrice).toBeGreaterThanOrEqual(0);
  });
});

describe('Withdraws', () => {
  it.skip('withdraw:deposited', async () => {
    await withdraw(account, sharesToWithdraw, vault.address, wallet, vault.dex)
      .then((e) => e.wait())
      .then((a) => {
        const result: any = a!.logs
          .map((e: any) => {
            try {
              return iface.parseLog(e);
            } catch (error) {
              return null;
            }
          })
          .find((e: any) => e && e.name === 'Withdraw')?.args;

        console.log('Withdraw:', result);
        expect(formatBigInt(result.shares)).toEqual(sharesToWithdraw);
      });
  });

  it.skip('approveVaultToken', async () => {
    let approve: ethers.ContractTransactionResponse | null = null;
    approve = await approveVaultToken(account, vault.address, wallet, vault.dex, Number(sharesToWithdraw)*2);
    await approve.wait();
    const isApproved = await isVaultTokenApproved(account, sharesToWithdraw, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(true);
  });

  it.skip('withdrawWithSlippage', async () => {
    await withdrawWithSlippage(account, sharesToWithdraw, vault.address, wallet, vault.dex, 2)
      .then((e) => e.wait())
      .then((a) => {
        const result: any = a!.logs
          .map((e: any) => {
            try {
              return iface.parseLog(e);
            } catch (error) {
              return null;
            }
          })
          .find((e: any) => e && e.name === 'Withdraw')?.args;

        console.log('Withdraw with slippage:', result);
        expect(formatBigInt(result.shares)).toEqual(sharesToWithdraw);
      });
  });
  it.skip('withdrawNativeToken', async () => {
    await withdrawNativeToken(account, sharesToWithdraw, vault.address, wallet, vault.dex)
      .then((e) => e.wait())
      .then((a) => {
        const result: any = a!.logs
          .map((e: any) => {
            try {
              return iface.parseLog(e);
            } catch (error) {
              return null;
            }
          })
          .find((e: any) => e && e.name === 'Withdraw')?.args;

        console.log('withdrawNativeToken:', result);
        expect(formatBigInt(result.shares)).toEqual(sharesToWithdraw);
      });
  });
  it.skip('withdrawWithErc20Wrapping', async () => {
    await withdrawWithErc20Wrapping(account, sharesToWithdraw, vault.address, wallet, vault.dex)
      .then((e) => e.wait())
      .then((a) => {
        const result: any = a!.logs
          .map((e: any) => {
            try {
              return iface.parseLog(e);
            } catch (error) {
              return null;
            }
          })
          .find((e: any) => e && e.name === 'Withdraw')?.args;

        console.log('withdrawWithErc20Wrapping:', result);
        expect(formatBigInt(result.shares)).toEqual(sharesToWithdraw);
      });
  });
});

describe('GraphQL', () => {
  it('GetIchiVaultInfo', async () => {
    const vaultInfo = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    expect(vaultInfo).toBeTruthy();
  });
  it('Get vaults by tokens', async () => {
    const vaultsByTokens = await getVaultsByTokens(vault.chainId, vault.dex, tokens.depositToken, tokens.pairedToken);

    expect(vaultsByTokens).toBeTruthy();
  });
  it('Get vaults by pool', async () => {
    const vaultsByPool = await getVaultsByPool(pool.address, pool.chainId, pool.dex);

    expect(vaultsByPool).toBeTruthy();
  });
});

describe('Dexes', () => {
  it('getSupportedDexes', async () => {
    const dexes = getSupportedDexes(vault.chainId);
    expect(dexes.length).toBeGreaterThan(0);
  });
  it('getChainsForDex', async () => {
    const chains = getChainsForDex(vault.dex);
    expect(chains.length).toBeGreaterThan(0);
  });
});

describe('Rewards', () => {
  it.skip('getRewardInfo', async () => {
    const rewardInfo = await getRewardInfo(vault.chainId, vault.dex, vault.address);

    expect(rewardInfo.id).toBeDefined();
  });
  it.skip('getAllRewardInfo', async () => {
    const allRewardInfo = await getAllRewardInfo(vault.chainId, vault.dex);

    expect(allRewardInfo.length).toBeGreaterThan(0);
  });
  it.skip('getUserRewards', async () => {
    const userRewards = await getUserRewards(account, vault.address, provider, vault.dex);

    expect(Number(userRewards[0].rewardAmount)).toBeGreaterThan(0);
  });
  it.skip('claimRewards', async () => {
    const tx = await claimRewards(account, vault.address, wallet, vault.dex);
    const a = await tx.wait();

    a!.logs.map((e: any) => {
      try {
        console.log('iface.parseLog(e):', iface.parseLog(e));
        return iface.parseLog(e);
      } catch (error) {
        return null;
      }
    });
  });
  it.skip('getAllUserRewards', async () => {
    const rewards = await getAllUserRewards(account, provider, vault.dex);
    console.log({rewards})

    expect(rewards.length).toBeGreaterThan(0);
  });
});

describe('Factory Config', () => {
  it('getConfigByFactory returns config for valid factory', () => {
    // Use Base Aerodrome factory address
    const factoryAddress = '0xf6B5Ab192F2696921F60a1Ff00b99596C4045FA6';
    const config = getConfigByFactory(SupportedChainId.base, factoryAddress);

    expect(config).toBeDefined();
    expect(config?.dex).toBe(SupportedDex.Aerodrome);
    expect(config?.factoryAddress.toLowerCase()).toBe(factoryAddress.toLowerCase());
    expect(config?.vaultDeployerAddress).toBeDefined();
    expect(config?.graphUrl).toBeDefined();
    expect(typeof config?.supportsCollectFees).toBe('boolean');
    expect(typeof config?.isAlgebra).toBe('boolean');
  });

  it('getConfigByFactory returns config case-insensitively', () => {
    // Use lowercase version of factory address
    const factoryAddress = '0xf6b5ab192f2696921f60a1ff00b99596c4045fa6';
    const config = getConfigByFactory(SupportedChainId.base, factoryAddress);

    expect(config).toBeDefined();
    expect(config?.dex).toBe(SupportedDex.Aerodrome);
  });

  it('getConfigByFactory returns undefined for invalid factory', () => {
    const config = getConfigByFactory(SupportedChainId.base, '0x0000000000000000000000000000000000000000');

    expect(config).toBeUndefined();
  });

  it('getConfigByFactory returns undefined for invalid chain', () => {
    const factoryAddress = '0xf6B5Ab192F2696921F60a1Ff00b99596C4045FA6';
    const config = getConfigByFactory(999999 as SupportedChainId, factoryAddress);

    expect(config).toBeUndefined();
  });

  it('getAllFactoryConfigs returns all factories for a chain', () => {
    const configs = getAllFactoryConfigs(SupportedChainId.base);

    expect(configs.size).toBeGreaterThan(0);

    // Verify the structure of returned configs
    const firstConfig = configs.values().next().value;
    expect(firstConfig?.dex).toBeDefined();
    expect(firstConfig?.factoryAddress).toBeDefined();
    expect(firstConfig?.vaultDeployerAddress).toBeDefined();
    expect(typeof firstConfig?.isAlgebra).toBe('boolean');
  });

  it('getAllFactoryConfigs returns empty map for invalid chain', () => {
    const configs = getAllFactoryConfigs(999999 as SupportedChainId);

    expect(configs.size).toBe(0);
  });

  it('getAllFactoryConfigs keys are lowercase factory addresses', () => {
    const configs = getAllFactoryConfigs(SupportedChainId.base);

    configs.forEach((value, key) => {
      expect(key).toBe(key.toLowerCase());
      expect(key).toBe(value.factoryAddress.toLowerCase());
    });
  });

  it('addressConfig is exported and has expected structure', () => {
    expect(addressConfig).toBeDefined();
    expect(addressConfig[SupportedChainId.base]).toBeDefined();
    expect(addressConfig[SupportedChainId.base]?.[SupportedDex.Aerodrome]).toBeDefined();
    expect(addressConfig[SupportedChainId.base]?.[SupportedDex.Aerodrome]?.factoryAddress).toBeDefined();
  });
});
