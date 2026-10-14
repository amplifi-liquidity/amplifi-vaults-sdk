/* eslint-env jest */
import { Interface, JsonRpcProvider } from 'ethers';
import { getAllUserAmounts, getAllUserBalances } from '../functions/userBalances';
import { graphqlRequest } from '../graphql/functions';
import { SupportedDex } from '../types';
import { multicall } from '../utils/multicallUtils';
import ichiVaultAbi from '../abis/IchiVault.json';
import tokenAbi from '../abis/ERC20.json';

jest.mock('../graphql/functions', () => ({ graphqlRequest: jest.fn() }));
jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: () => ({ publishedUrl: 'https://subgraph.example/graphql', version: 2 }),
}));
jest.mock('../utils/multicallUtils', () => ({
  ...jest.requireActual('../utils/multicallUtils'),
  multicall: jest.fn(),
}));

const account = '0x1111111111111111111111111111111111111111';
const vault = '0x2222222222222222222222222222222222222222';
const token0 = '0x3333333333333333333333333333333333333333';
const token1 = '0x4444444444444444444444444444444444444444';
const provider = { getNetwork: async () => ({ chainId: 57073n }) } as JsonRpcProvider;
const vaultInterface = new Interface(ichiVaultAbi);
const tokenInterface = new Interface(tokenAbi);

function mockShares(wallet: string, staked?: string) {
  (graphqlRequest as jest.Mock).mockResolvedValue({
    user: {
      vaultShares: [
        {
          vault: { id: vault, token0, token1 },
          vaultShareBalance: wallet,
          stakedVaultShareBalance: staked,
        },
      ],
    },
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  // Ten total vault shares own 100 USDC (6 decimals) and 20 WETH (18 decimals).
  // Exercise actual ABI encoding/decoding; only the network transport is mocked.
  (multicall as jest.Mock).mockResolvedValue([
    {
      success: true,
      returnData: vaultInterface.encodeFunctionResult('getTotalAmounts', [100000000n, 20000000000000000000n]),
    },
    { success: true, returnData: vaultInterface.encodeFunctionResult('totalSupply', [10000000000000000000n]) },
    { success: true, returnData: tokenInterface.encodeFunctionResult('decimals', [6]) },
    { success: true, returnData: tokenInterface.encodeFunctionResult('decimals', [18]) },
  ]);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test.each([
  {
    name: 'mixed wallet and staked',
    wallet: '2',
    staked: '3',
    amount0: '50',
    amount1: '10',
    raw0: 50000000n,
    raw1: 10000000000000000000n,
  },
  {
    name: 'fully staked',
    wallet: '0',
    staked: '3',
    amount0: '30',
    amount1: '6',
    raw0: 30000000n,
    raw1: 6000000000000000000n,
  },
  {
    name: 'wallet only',
    wallet: '2',
    staked: '0',
    amount0: '20',
    amount1: '4',
    raw0: 20000000n,
    raw1: 4000000000000000000n,
  },
  {
    name: 'missing optional stake',
    wallet: '2',
    staked: undefined,
    amount0: '20',
    amount1: '4',
    raw0: 20000000n,
    raw1: 4000000000000000000n,
  },
])(
  '$name: bulk amounts include the owned shares once with each token decimal',
  async ({ wallet, staked, amount0, amount1, raw0, raw1 }) => {
    mockShares(wallet, staked);
    expect(await getAllUserAmounts(account, provider, SupportedDex.Velodrome)).toEqual([
      { vaultAddress: vault, userAmounts: { amount0, amount1, 0: amount0, 1: amount1 } },
    ]);
    expect(await getAllUserAmounts(account, provider, SupportedDex.Velodrome, true)).toEqual([
      { vaultAddress: vault, userAmounts: { amount0: raw0, amount1: raw1, 0: raw0, 1: raw1 } },
    ]);
  },
);

test('a DEX without MFD support uses wallet shares only', async () => {
  mockShares('2', '3');
  expect(await getAllUserAmounts(account, provider, SupportedDex.Reservoir)).toEqual([
    { vaultAddress: vault, userAmounts: { amount0: '20', amount1: '4', 0: '20', 1: '4' } },
  ]);
});

test('bulk balances preserve exact share precision and keep stakedShares as a subset', async () => {
  mockShares('9007199254740992.000000000000000001', '1.000000000000000002');
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome)).toEqual([
    { vaultAddress: vault, shares: '9007199254740993.000000000000000003', stakedShares: '1.000000000000000002' },
  ]);
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome, true)).toEqual([
    { vaultAddress: vault, shares: 9007199254740993000000000000000003n, stakedShares: 1000000000000000002n },
  ]);
});

test('bulk balances without the optional stake remain the exact wallet total', async () => {
  mockShares('2.000000000000000001');
  expect(await getAllUserBalances(account, provider, SupportedDex.Velodrome, true)).toEqual([
    { vaultAddress: vault, shares: 2000000000000000001n, stakedShares: 0n },
  ]);
});
