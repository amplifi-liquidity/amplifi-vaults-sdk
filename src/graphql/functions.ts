/* eslint-disable camelcase */
/* eslint-disable import/no-cycle */
// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
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

export async function graphqlRequest<TResult, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  url: string,
  query: string,
  variables?: TVariables,
  isAmplifiHosted?: boolean,
): Promise<TResult> {
  const headers = isAmplifiHosted ? getAmplifiHeaders() : undefined;
  // graphql-request's request() uses rest args: (url, doc, ...variablesAndHeaders)
  return request<TResult>(url, query, variables, headers);
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

export async function sendFeeAprQueryRequest(url: string, vaultAddress: string, extended?: boolean, isAmplifiHosted?: boolean): Promise<FeeAprQueryResponse> {
  const query = extended ? extendedFeeAprQuery : feeAprQuery;
  return graphqlRequest<FeeAprQueryResponse, { vaultAddress: string }>(
    url,
    query,
    { vaultAddress: vaultAddress.toLowerCase() },
    isAmplifiHosted,
  );
}
