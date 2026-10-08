/* eslint-env jest */
import { JsonRpcProvider } from 'ethers';
import { inspect } from 'util';
import { getAllUserAmounts } from '../functions/userBalances';
import { graphqlRequest } from '../graphql/functions';
import { SupportedDex } from '../types';
import { multicall } from '../utils/multicallUtils';

jest.mock('../graphql/functions', () => ({ graphqlRequest: jest.fn() }));
jest.mock('../utils/getGraphUrls', () => ({
  getGraphUrls: () => ({ url: 'https://subgraph.example/graphql', version: 2 }),
}));
jest.mock('../utils/multicallUtils', () => ({
  ...jest.requireActual('../utils/multicallUtils'),
  multicall: jest.fn(),
}));

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('user amounts RPC failure logs safe context and rethrows the original exception', async () => {
  jest.useFakeTimers();
  const account = '0x1111111111111111111111111111111111111111';
  const vault = '0x2222222222222222222222222222222222222222';
  const provider = { getNetwork: async () => ({ chainId: 57073n }) } as JsonRpcProvider;
  const key = 'rpc-provider-credential-fixture';
  const url = `https://provider.example/${key}/`;
  const error = Object.assign(new Error(`Request to ${url} failed`), {
    code: 'SERVER_ERROR',
    request: { url, headers: { authorization: `Bearer ${key}` } },
  });
  (graphqlRequest as jest.Mock).mockResolvedValue({
    user: {
      vaultShares: [{ vault: { id: vault, token0: account, token1: vault }, vaultShareBalance: '1' }],
    },
  });
  (multicall as jest.Mock).mockRejectedValue(error);
  const logger = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  await expect(getAllUserAmounts(account, provider, SupportedDex.Reservoir)).rejects.toBe(error);
  expect(multicall).toHaveBeenCalledTimes(1);
  expect(inspect(logger.mock.calls, { depth: null })).not.toContain(key);
  expect(logger).toHaveBeenCalledWith(
    `Could not get user amounts for ${account} on chain 57073 and dex ${SupportedDex.Reservoir} (code=SERVER_ERROR)`,
  );
});
