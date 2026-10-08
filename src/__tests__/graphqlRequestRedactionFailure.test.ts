/* eslint-env jest */
import { inspect } from 'util';
import { ClientError, request } from 'graphql-request';
import { graphqlRequest } from '../graphql/functions';

jest.mock('graphql-request', () => ({
  ...jest.requireActual('graphql-request'),
  request: jest.fn(),
}));

const KEY = '0123456789abcdef0123456789abcdef';

test('if redaction itself fails, a generic error is thrown instead of the original or the redaction error', async () => {
  const body: Record<string, unknown> = { error: `https://gateway.thegraph.com/api/${KEY}/subgraphs/id/QmVault` };
  const original = new ClientError({ status: 401, headers: undefined, body } as never, {
    query: '{ ok }',
    variables: { source: `https://gateway.thegraph.com/api/${KEY}/subgraphs/id/QmVault` },
  });
  // A circular response body makes JSON.stringify throw a TypeError partway through sanitizing.
  body.self = body;
  (request as jest.Mock).mockRejectedValue(original);

  const failure = await graphqlRequest('https://subgraph.example/graphql', '{ ok }').catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(Error);
  expect(failure).not.toBe(original);
  expect(failure).not.toBeInstanceOf(ClientError);
  expect(failure).toHaveProperty('message', 'Subgraph request failed (details redacted)');
  expect(inspect(failure, { depth: null })).not.toContain(KEY);
});
