/* eslint-disable no-restricted-syntax */
import { graphUrls } from '../graphql/constants';
import { SupportedChainId, SupportedDex } from '../types';
import { addressConfig, SupportedDexConfig } from './config/addresses';

export type FactoryConfig = {
  dex: SupportedDex;
  factoryAddress: string;
  vaultDeployerAddress: string;
  depositGuardAddress: string;
  depositGuardVersion: number;
  graphUrl: string;
  publishedUrl: string;
  supportsCollectFees: boolean;
  version?: number;
  isAlgebra: boolean;
  ammVersion?: string;
  is2Thick?: boolean;
};

/**
 * Get DEX configuration by factory address.
 * This is useful when you have a vault's factory address and need to determine
 * which DEX it belongs to and get the associated configuration.
 *
 * @param chainId - The chain ID
 * @param factoryAddress - The factory address (case-insensitive)
 * @returns FactoryConfig if found, undefined otherwise
 */
export function getConfigByFactory(chainId: SupportedChainId, factoryAddress: string): FactoryConfig | undefined {
  const chainConfig = addressConfig[chainId];
  if (!chainConfig) return undefined;

  const normalizedFactory = factoryAddress.toLowerCase();

  for (const [dexName, dexConfig] of Object.entries(chainConfig)) {
    const config = dexConfig as SupportedDexConfig;
    if (config.factoryAddress.toLowerCase() === normalizedFactory) {
      const dex = dexName as SupportedDex;
      const graph = graphUrls[chainId]?.[dex];

      return {
        dex,
        factoryAddress: config.factoryAddress,
        vaultDeployerAddress: config.vaultDeployerAddress,
        depositGuardAddress: config.depositGuard.address,
        depositGuardVersion: config.depositGuard.version,
        graphUrl: graph?.url ?? '',
        publishedUrl: graph?.publishedUrl ?? '',
        supportsCollectFees: graph?.supportsCollectFees ?? false,
        version: graph?.version,
        isAlgebra: config.isAlgebra,
        ammVersion: config.ammVersion,
        is2Thick: config.is2Thick,
      };
    }
  }

  return undefined;
}

/**
 * Get all factory configurations for a chain.
 * Returns a map of factory address (lowercase) to DEX configuration.
 *
 * @param chainId - The chain ID
 * @returns Map of factory address to FactoryConfig
 */
export function getAllFactoryConfigs(chainId: SupportedChainId): Map<string, FactoryConfig> {
  const result = new Map<string, FactoryConfig>();
  const chainConfig = addressConfig[chainId];
  if (!chainConfig) return result;

  for (const [dexName, dexConfig] of Object.entries(chainConfig)) {
    const config = dexConfig as SupportedDexConfig;
    const dex = dexName as SupportedDex;
    const graph = graphUrls[chainId]?.[dex];

    result.set(config.factoryAddress.toLowerCase(), {
      dex,
      factoryAddress: config.factoryAddress,
      vaultDeployerAddress: config.vaultDeployerAddress,
      depositGuardAddress: config.depositGuard.address,
      depositGuardVersion: config.depositGuard.version,
      graphUrl: graph?.url ?? '',
      publishedUrl: graph?.publishedUrl ?? '',
      supportsCollectFees: graph?.supportsCollectFees ?? false,
      version: graph?.version,
      isAlgebra: config.isAlgebra,
      ammVersion: config.ammVersion,
      is2Thick: config.is2Thick,
    });
  }

  return result;
}
