/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { JsonRpcProvider } from 'ethers';
import { inspect } from 'util';
import { getERC20Contract, getIchiVaultContract } from '../contracts';
import { getTokenDecimals, _getTotalSupply } from '../functions/_totalBalances';
import { SupportedChainId } from '../types';
import cache from '../utils/cache';

jest.mock('../contracts', () => ({
  getERC20Contract: jest.fn(),
  getIchiVaultContract: jest.fn(),
}));

const address = '0x1111111111111111111111111111111111111111';
const provider = {} as JsonRpcProvider;
const key = 'rpc-credential-fixture';
const url = `https://provider.example/${key}/`;
const rpcError = Object.assign(new Error(`RPC request to ${url} failed`), {
  code: 'SERVER_ERROR',
  request: { url, headers: { authorization: `Bearer ${key}` } },
});

afterEach(() => {
  cache.flushAll();
  jest.restoreAllMocks();
});

test.each([
  {
    operation: 'token decimals',
    call: () => getTokenDecimals(address, provider, SupportedChainId.ink),
    context: `Could not get token decimals for ${address} on 57073`,
  },
  {
    operation: 'total supply',
    call: () => _getTotalSupply(address, provider),
    context: `Could not get total supply for ${address}`,
  },
])('$operation failure logs safe context and preserves the existing safe exception', async ({ call, context }) => {
  (getERC20Contract as jest.Mock).mockReturnValue({ decimals: jest.fn().mockRejectedValue(rpcError) });
  (getIchiVaultContract as jest.Mock).mockReturnValue({ totalSupply: jest.fn().mockRejectedValue(rpcError) });
  const logger = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  const failure = await call().catch((error: unknown) => error);
  expect(inspect(logger.mock.calls, { depth: null })).not.toContain(key);
  expect(logger).toHaveBeenCalledWith(`${context} (code=SERVER_ERROR)`);
  expect(failure).toBeInstanceOf(Error);
  expect(failure).toHaveProperty('message', context);
  expect(failure).not.toBe(rpcError);
  expect(inspect(failure, { depth: null })).not.toContain(key);
});

test('a failure without an error code logs code=unknown', async () => {
  const uncoded = new Error(`RPC request to ${url} failed`);
  (getERC20Contract as jest.Mock).mockReturnValue({ decimals: jest.fn().mockRejectedValue(uncoded) });
  (getIchiVaultContract as jest.Mock).mockReturnValue({ totalSupply: jest.fn().mockRejectedValue(uncoded) });
  const logger = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  await expect(getTokenDecimals(address, provider, SupportedChainId.ink)).rejects.toThrow();
  await expect(_getTotalSupply(address, provider)).rejects.toThrow();
  expect(logger).toHaveBeenNthCalledWith(1, `Could not get token decimals for ${address} on 57073 (code=unknown)`);
  expect(logger).toHaveBeenNthCalledWith(2, `Could not get total supply for ${address} (code=unknown)`);
  expect(inspect(logger.mock.calls, { depth: null })).not.toContain(key);
});
