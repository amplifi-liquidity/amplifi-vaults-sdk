/* eslint-disable import/prefer-default-export */
import { SupportedChainId, SupportedDex } from '../types';
import { addressConfig } from './config/addresses';

export function isMfdEnabled(chainId: SupportedChainId, dex: SupportedDex) {
  return addressConfig[chainId]?.[dex]?.mfdEnabled === true;
}
