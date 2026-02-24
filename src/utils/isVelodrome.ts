/* eslint-disable import/prefer-default-export */
import { SupportedChainId, SupportedDex } from '../types';
import { addressConfig, AMM_VERSIONS } from './config/addresses';

export function isVelodromeDex(chainId: SupportedChainId, dex: SupportedDex) {
  const ammVersion = addressConfig[chainId]?.[dex]?.ammVersion;
  return ammVersion === AMM_VERSIONS.VELODROME;
}
