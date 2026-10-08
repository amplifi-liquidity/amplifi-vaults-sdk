/* eslint-disable camelcase */
/* eslint-disable import/no-cycle */
// eslint-disable-next-line import/no-unresolved
import { ClientError, request } from 'graphql-request';
import {
  CollectFeesQueryData,
  FeeAprQueryResponse,
  RebalancesQueryData,
  VaultDepositsQueryData,
  VaultWithdrawsQueryData,
} from '../types/vaultQueryData';
import { feeAprQuery, extendedFeeAprQuery } from './queries';

function getAmplifiHeaders(): Record<string, string> {
  const apiKey = process.env.AMPLIFI_SUBGRAPH_API_KEY;
  return apiKey ? { 'x-api-key': apiKey } : {};
}

// Without a deadline a subgraph that accepts the connection but never answers is only cut off
// by the socket default (~5 min), which stalls batch jobs. Override with SUBGRAPH_REQUEST_TIMEOUT_MS.
export const DEFAULT_SUBGRAPH_REQUEST_TIMEOUT_MS = 20_000;

function subgraphRequestTimeoutMs(): number {
  const configured = Number(process.env.SUBGRAPH_REQUEST_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SUBGRAPH_REQUEST_TIMEOUT_MS;
}

// Gateway URLs carry the API key in the path (gateway.thegraph.com/api/<key>/subgraphs/...) and
// node-fetch puts the full URL in network error messages, so scrub keys before errors reach logs.
function redactSubgraphCredentials(text: string): string {
  let redacted = text
    .replace(/(\/api\/)[^/?#\s"']+(?=\/(?:subgraphs|deployments)\/)/g, '$1[redacted]')
    .replace(/([?&](?:api[-_]?key|key|token|access_token)=)[^&#\s"'\\]+/gi, '$1[redacted]');
  [process.env.SUBGRAPH_API_KEY, process.env.AMPLIFI_SUBGRAPH_API_KEY].forEach((secret) => {
    if (secret) redacted = redacted.split(secret).join('[redacted]');
  });
  return redacted;
}

export async function graphqlRequest<TResult, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  url: string,
  query: string,
  variables?: TVariables,
  isAmplifiHosted?: boolean,
): Promise<TResult> {
  const headers = isAmplifiHosted ? getAmplifiHeaders() : undefined;
  try {
    return await request<TResult>({
      url,
      document: query,
      variables,
      requestHeaders: headers,
      signal: AbortSignal.timeout(subgraphRequestTimeoutMs()),
    });
  } catch (error) {
    // Scrub in place so the error keeps its type and fields (ClientError.response, FetchError.code).
    // Only write when something changed: some errors (DOMException) expose message as a getter.
    if (error instanceof Error) {
      const message = redactSubgraphCredentials(error.message);
      if (message !== error.message) error.message = message;
      const stack = error.stack && redactSubgraphCredentials(error.stack);
      if (stack !== error.stack) error.stack = stack;
    }
    if (error instanceof ClientError) {
      // Headers are not JSON-serializable, but console.error still inspects their values.
      const responseHeaders = error.response.headers as Headers | undefined;
      if (responseHeaders) {
        responseHeaders.forEach((value, name) => {
          const redacted = redactSubgraphCredentials(value);
          if (redacted !== value) responseHeaders.set(name, redacted);
        });
      }
      const redactString = (_key: string, value: unknown) =>
        typeof value === 'string' ? redactSubgraphCredentials(value) : value;
      error.response = {
        ...JSON.parse(JSON.stringify(error.response, redactString)),
        headers: responseHeaders,
      };
      // Clone before sanitizing: the error's variables still belong to the caller.
      error.request = JSON.parse(JSON.stringify(error.request, redactString));
    }
    throw error;
  }
}

export async function sendAllEventsQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<any> {
  return graphqlRequest<any, { vaultAddress: string; createdAtTimestamp_gt: string }>(
    url,
    query,
    { vaultAddress, createdAtTimestamp_gt },
    isAmplifiHosted,
  ).then((result) => result);
}

export async function sendRebalancesQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<RebalancesQueryData['vaultRebalances']> {
  return graphqlRequest<RebalancesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
    url,
    query,
    { vaultAddress, createdAtTimestamp_gt },
    isAmplifiHosted,
  ).then(({ vaultRebalances }) => vaultRebalances);
}

export async function sendCollectFeesQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<CollectFeesQueryData['vaultCollectFees']> {
  return graphqlRequest<CollectFeesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
    url,
    query,
    { vaultAddress, createdAtTimestamp_gt },
    isAmplifiHosted,
  ).then(({ vaultCollectFees }) => vaultCollectFees);
}

export async function sendDepositsQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<VaultDepositsQueryData['vaultDeposits']> {
  return graphqlRequest<VaultDepositsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
    url,
    query,
    { vaultAddress, createdAtTimestamp_gt },
    isAmplifiHosted,
  ).then(({ vaultDeposits }) => vaultDeposits);
}

export async function sendWithdrawsQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
  isAmplifiHosted?: boolean,
): Promise<VaultWithdrawsQueryData['vaultWithdraws']> {
  return graphqlRequest<VaultWithdrawsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
    url,
    query,
    { vaultAddress, createdAtTimestamp_gt },
    isAmplifiHosted,
  ).then(({ vaultWithdraws }) => vaultWithdraws);
}

export async function sendFeeAprQueryRequest(
  url: string,
  vaultAddress: string,
  extended?: boolean,
  isAmplifiHosted?: boolean,
): Promise<FeeAprQueryResponse> {
  const query = extended ? extendedFeeAprQuery : feeAprQuery;
  return graphqlRequest<FeeAprQueryResponse, { vaultAddress: string }>(
    url,
    query,
    { vaultAddress: vaultAddress.toLowerCase() },
    isAmplifiHosted,
  );
}
