/* eslint-env jest */
import http from 'http';
import { AddressInfo } from 'net';
import { graphqlRequest } from '../graphql/functions';

// A real HTTP server proves the request is aborted on the wire, not merely abandoned.
let server: http.Server;
let url: string;
const sockets = new Set<import('net').Socket>();
let mode: 'hang' | 'ok' = 'hang';
let lastHeaders: http.IncomingHttpHeaders = {};

beforeAll(async () => {
  server = http.createServer((req, res) => {
    lastHeaders = req.headers;
    if (mode === 'hang') return; // accept the request, never answer
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ data: { ok: true } }));
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/graphql`;
});

afterAll(async () => {
  sockets.forEach((s) => s.destroy());
  await new Promise((resolve) => server.close(resolve));
});

afterEach(() => {
  delete process.env.SUBGRAPH_REQUEST_TIMEOUT_MS;
  delete process.env.AMPLIFI_SUBGRAPH_API_KEY;
});

test('a subgraph that never answers is aborted at the configured deadline', async () => {
  mode = 'hang';
  process.env.SUBGRAPH_REQUEST_TIMEOUT_MS = '150';
  const started = Date.now();
  await expect(graphqlRequest(url, '{ ok }')).rejects.toThrow();
  expect(Date.now() - started).toBeLessThan(2_000);
});

test('a responsive subgraph still succeeds and hosted requests keep the API key header', async () => {
  mode = 'ok';
  process.env.AMPLIFI_SUBGRAPH_API_KEY = 'test-key';
  await expect(graphqlRequest(url, '{ ok }', undefined, true)).resolves.toEqual({ ok: true });
  expect(lastHeaders['x-api-key']).toBe('test-key');
  await graphqlRequest(url, '{ ok }', undefined, false);
  expect(lastHeaders['x-api-key']).toBeUndefined();
});
