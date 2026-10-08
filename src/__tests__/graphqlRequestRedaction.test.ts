/* eslint-env jest */
import http from 'http';
import { AddressInfo } from 'net';
import { inspect } from 'util';
import { ClientError } from 'graphql-request';
import { graphqlRequest } from '../graphql/functions';

const KEY = '0123456789abcdef0123456789abcdef';

// Nothing listens on port 1, so node-fetch fails with "request to <full url> failed, reason: ...".
const unreachable = (path: string) => `http://127.0.0.1:1${path}`;

async function caught(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('expected the request to fail');
}

function expectRedacted(error: Error, secret: string) {
  expect(error.message).toContain('[redacted]');
  expect(error.message).not.toContain(secret);
  expect(error.stack ?? '').not.toContain(secret);
  expect(JSON.stringify(error)).not.toContain(secret);
  expect(inspect(error, { depth: null })).not.toContain(secret);
}

afterEach(() => {
  delete process.env.SUBGRAPH_API_KEY;
  delete process.env.AMPLIFI_SUBGRAPH_API_KEY;
});

test('a network error does not leak a Graph gateway key from the URL path', async () => {
  const error = await caught(graphqlRequest(unreachable(`/api/${KEY}/subgraphs/id/QmVault`), '{ ok }'));
  expect(error.name).toBe('FetchError');
  expect(error).toHaveProperty('code', 'ECONNREFUSED');
  expect(error.message).toContain('/api/[redacted]/subgraphs/id/QmVault');
  expectRedacted(error, KEY);
});

test('a network error does not leak an API key from the query string', async () => {
  const error = await caught(graphqlRequest(unreachable(`/graphql?api-key=${KEY}&chain=ink`), '{ ok }'));
  expect(error.message).toContain('api-key=[redacted]&chain=ink');
  expectRedacted(error, KEY);
});

test('configured subgraph keys are scrubbed wherever they appear', async () => {
  process.env.SUBGRAPH_API_KEY = KEY;
  const error = await caught(graphqlRequest(unreachable(`/custom/${KEY}/graphql`), '{ ok }'));
  expectRedacted(error, KEY);
});

describe('upstream error responses', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Echo the request line back, as some gateways do in auth/not-found bodies.
    server = http.createServer((req, res) => {
      if (req.url === '/success') {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ data: { literal: KEY } }));
        return;
      }
      res.statusCode = 401;
      res.setHeader('retry-after', '60');
      if (req.url === '/nested') {
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            errors: [
              {
                message: 'Unauthorized',
                extensions: {
                  locations: [`https://gateway.thegraph.com/api/${KEY}/subgraphs/id/QmVault`],
                  detail: { url: `https://subgraph.example/graphql?access_token=${KEY}` },
                },
              },
            ],
          }),
        );
        return;
      }
      if (req.url === '/headers') {
        res.setHeader('content-location', `https://gateway.thegraph.com/api/${KEY}/subgraphs/id/QmVault`);
        res.setHeader('x-api-key', req.headers['x-api-key'] ?? '');
      }
      res.end(`unauthorized: <a href="${req.url}?api_key=${KEY}">${req.url}</a> x-api-key=${req.headers['x-api-key']}`);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('a ClientError keeps its status but not the echoed key or x-api-key header', async () => {
    process.env.AMPLIFI_SUBGRAPH_API_KEY = 'amplifi-hosted-secret';
    const error = (await caught(
      graphqlRequest(`${baseUrl}/api/${KEY}/subgraphs/id/QmVault`, '{ ok }', undefined, true),
    )) as Error & { response?: { status: number } };
    expect(error).toBeInstanceOf(ClientError);
    expect(error.response?.status).toBe(401);
    expectRedacted(error, KEY);
    expectRedacted(error, 'amplifi-hosted-secret');
  });

  test('error response headers are safe for console.error and retain useful diagnostics', async () => {
    process.env.AMPLIFI_SUBGRAPH_API_KEY = 'amplifi-hosted-secret';
    const error = (await caught(graphqlRequest(`${baseUrl}/headers`, '{ ok }', undefined, true))) as ClientError;
    expect(error).toBeInstanceOf(ClientError);
    expect(error.response.status).toBe(401);
    const headers = error.response.headers as Headers;
    expect(headers.get('retry-after')).toBe('60');
    expect(headers.get('content-location')).toContain('/api/[redacted]/subgraphs/id/QmVault');
    expect(headers.get('x-api-key')).toBe('[redacted]');
    expectRedacted(error, KEY);
    expectRedacted(error, 'amplifi-hosted-secret');
  });

  test('nested body and request fields are sanitized without modifying caller variables', async () => {
    const variables = { input: { source: `https://gateway.thegraph.com/api/${KEY}/subgraphs/id/QmVault` } };
    const error = (await caught(
      graphqlRequest(`${baseUrl}/nested`, 'query($input: Input) { ok(input: $input) }', variables),
    )) as ClientError;
    expect(error).toBeInstanceOf(ClientError);
    expect(error.response.status).toBe(401);
    expectRedacted(error, KEY);
    expect(variables.input.source).toContain(KEY);
    expect(error.request.query).toBe('query($input: Input) { ok(input: $input) }');
  });

  test('successful data is untouched, even if it happens to contain a configured key', async () => {
    process.env.SUBGRAPH_API_KEY = KEY;
    await expect(graphqlRequest(`${baseUrl}/success`, '{ literal }')).resolves.toEqual({ literal: KEY });
  });
});
