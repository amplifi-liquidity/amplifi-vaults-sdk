/* eslint-disable import/prefer-default-export */
import { SupportedDex, SupportedChainId } from '../types';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type GraphQL = {
  url: string;
  publishedUrl: string;
  supportsCollectFees: boolean;
  version?: number; // version 2 uses token0/1 instead of tokenA/B, supports vault fee APRs
};
type dexGraph = PartialRecord<SupportedDex, GraphQL>;

// 'none' indicates that graph is not enabled on that chain
export const graphUrls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EHrAjHvipRZ6oUpdxjMMQmmtTBGEgTeLfAbcGmwDP5MS',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5LbeEUUQSCgL9H4H1YqF6ef71z2BFnEYdkJF7ETPby6H',
      supportsCollectFees: true,
    },
    [SupportedDex.Ramses]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-ramses/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GUje3ta3bDgpyT5pUzhpuxZJetRMhYHSuBdbLC6aKh7u',
      supportsCollectFees: false,
    },
    [SupportedDex.Sushiswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-sushiswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/9LLNtWuxZC8CJ8VKNXFonZTfCZ2dkNFQ75WfAjjG5tWu',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.arthera]: {
    [SupportedDex.Thirdfy]: {
      url: 'https://subgraph.arthera.net/subgraphs/name/ichifarm/thirdfy',
      publishedUrl: 'https://subgraph.arthera.net/subgraphs/name/ichifarm/thirdfy',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.arthera_testnet]: {
    [SupportedDex.Thirdfy]: {
      url: 'https://subgraph-test.arthera.net/subgraphs/name/ichifarm/thirdfy',
      publishedUrl: 'https://subgraph-test.arthera.net/subgraphs/name/ichifarm/thirdfy',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/rsoxiRb9Ps8nd7FheU2QGeWVhTALCQjUZeUv8pS93gt',
      supportsCollectFees: false,
    },
    [SupportedDex.Blueprint]: {
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1-blueprint/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/DZ7m2Dr1ZVkeQMgi1LDLwKSCvscEUteGSKbAmcspF68G',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GtYgZPoaEtbiajpAEZCGk9Z6MGHFmXeNyvnG5voF5AuS',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapNew]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v-2-uniswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/9x1nQRYUBpBjr8V4TKAKBKDxoeVuijYYA8PNhkTFECkY',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6WH2uyXvDZByPEBQ46mieAgvyS9ELiuGXfffyGKbw1Qf',
      supportsCollectFees: false,
    },
    [SupportedDex.Retro]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1-retro/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5WyaMUnnbvGWkzpGyWNETNhgPgohtmV8wFn7Bn7akcUj',
      supportsCollectFees: false,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CbYdVpAtj6bU1jcb7FcEWn2ydLdVNhwRy1c7C2XGrNa9',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Aerodrome]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-3-aerodrome/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/nZnftbmERiB2tY6t2ika7kP9srTcKnYFEnqG3RKa38r',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Aux]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-2-aux-uniswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6VPXnjNNHVD4pF42txnerqA8zjarFcLFcT6hjmLKurX4',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/FeWJod9KKVkeRrC7MB54cJNu9qYhoyNzDYPa8D62U2AS',
      supportsCollectFees: true,
    },
    [SupportedDex.Equalizer2Thick]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-thick-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/45JgzDREhiqSh1RXnJNzgPA7byxQWD8TpUHu4GuHYsdx',
      supportsCollectFees: true,
    },
    [SupportedDex.Henjin]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-henjin/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BBF1RTBGjEhMzoHg7WV4HYKj3rXxE6BZJGYe4n6BgkMv',
      supportsCollectFees: true,
    },
    [SupportedDex.Hydrex]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-2-hydrex/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/AusreZtgQFkkCDsvGZ6uLZxxCD3KwcpCjrE2sK3ZkW1J',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Kim]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-kim/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BWxqY53LHYaYVCHiAjv8mHNPWL3HKaNbZoXt48CnthCw',
      supportsCollectFees: true,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/AWny6b9W1v63MPFqeCSFQJt5dMP7xX1nzSCJd2zh8Dgd',
      supportsCollectFees: true,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-2-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EJLBiJxWkpS4eNGErvpShfCzLnzhAv8GHFMe4kVTebY3',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Thirdfy]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-2-thirdfy/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5hB9frAcP8qbdMof5qmhE7tXu8hdaT1BeA8HBtvKb3KG',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Trebleswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-trebleswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/AdkJodYmr7P6xa221cwdhPBT3xZF3g7FftcrbRV4y75u',
      supportsCollectFees: true,
    },
    [SupportedDex.TrebleswapV2]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v-2-trebleswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/E5F7onPEQgaXnASENVZEoaaAhMxaktzBj9rih4msXNAT',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2RW5ke8ps9rAjPaAxxQpe8rFexLWWMLL5ySzwLZPnG6g',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.base_sepolia]: {
    [SupportedDex.Hydrex]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-sepolia-v-2-hydrex/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BMMasWpeHafiTQQsG7TC871zzUMLH7LPTrN5aYmAod1o',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Thirdfy]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-sepolia-v2-thirdfy/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/9JrFqJq9MjKR2wibqcvpB98BywRqNuwgencrYGKBsqBD',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.berachain]: {
    [SupportedDex.Kodiak]: {
      url: 'https://api.studio.thegraph.com/query/88584/berachain-v1-kodiak/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/7P9DAPWihEJ3QHrR9eeEp3KAP9FgTTo2SnzAaXXPQSau',
      supportsCollectFees: true,
    },
    [SupportedDex.Wasabee]: {
      url: 'https://api.studio.thegraph.com/query/88584/berachain-v2-wasabee/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/8hmju8E9uZRmMAFGv2j4cGHF6GFVm8ederosj7hF4gsw',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.berachain_bartio]: {
    [SupportedDex.Honeypot]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-honeypot/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-honeypot/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Kodiak]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-kodiak/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-kodiak/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/ichi-new-subgraph/0.0.1/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/ichi-new-subgraph/0.0.1/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Thruster]: {
      url: 'https://api.studio.thegraph.com/query/88584/blast-v1-thruster/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/JDXqs18mzaghk5kZRTRLtQZAMkrqhfYk1LJagcAgHwPc',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/blast-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2WUyxDQ824jLYkQ53JXMByumvXVgTeJcLD6XezRr9QgV',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-sepolia-v1-fenix/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-sepolia-v1-fenix/1.0.0/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.botanix]: {
    [SupportedDex.Bitzy]: {
      url: 'https://api.studio.thegraph.com/query/88584/botanix-v-2-bitzy/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/JCJdoEihvoziMjpMHs9eyMnaBmXijWoeuq73zoy8tNJN',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/bnb-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/A5d7JgbjDdfD2iSgArqdBUQubFEWHG264vCZuqWBiJDU',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/bsc-v-2-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/zGTwSohEE3tmbnoUSdm5PRTFVscBUPDGgpz2VHvN1vG',
      supportsCollectFees: false,
      version: 2,
    },
    [SupportedDex.Thena]: {
      url: 'https://api.studio.thegraph.com/query/88584/bnb-v1-thena/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6x5DWy8Tnber9jND8qbxjtCtus11tkkjd6r2qJphoLvf',
      supportsCollectFees: true,
    },
    [SupportedDex.ThenaV3Fees]: {
      url: 'https://api.studio.thegraph.com/query/88584/bsc-v3-thena-fees/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CUDHBLjeeqpprHGZeesTi9kxtjsZTQnJrvuT4Sm8nyx5',
      supportsCollectFees: true,
    },
    [SupportedDex.ThenaV3Rewards]: {
      url: 'https://api.studio.thegraph.com/query/88584/bsc-v-2-thena-rw/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/hsjGcogPgNcYYmdXnZNedrbotTsFxSSn8Sso9FUWc25',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.ThenaV4Rewards]: {
      url: 'https://api.studio.thegraph.com/query/88584/bsc-v-4-thena-rw/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/oQ2dLgNeZYJcn8gqViDRrEm9r4vkXwbWgZaeUKqYw8h',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.Ubeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/celo-v1-ubeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/8N5VoyCYnFxFVLiMgNWXR9dMtcRrTRC1DjHwNeq5DzNY',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/celo-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/7dD1q2C5qCXmQpGCgnUsHmFaufD9c9qfppNoeEjEfkLm',
      supportsCollectFees: true,
    },
    [SupportedDex.Velodrome]: {
      url: 'https://api.studio.thegraph.com/query/88584/celo-v-3-velodrome/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/B5bAxkSXt1oXaDJgTdP3UqigxcwgXjeBY51eo9WMmija',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.citrea]: {
    [SupportedDex.Satsuma]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/citrea-v2-satsuma/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/citrea-v2-satsuma/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.citrea_testnet]: {
    [SupportedDex.Satsuma]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/citrea-testnet-v2-satsuma/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/citrea-testnet-v2-satsuma/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.cronos]: {
    [SupportedDex.VVS]: {
      url: 'https://api.studio.thegraph.com/query/88584/cronos-v-2-vvs/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2q9731g9mpWPpzNDXuSDZ7o92sxHzBs8Nqq4EUHLoQqc',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.evmos]: {
    [SupportedDex.Forge]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.fantom]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/88584/fantom-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/sB5joTEeHxm7ab61PTbGsrqMpkdsFeMdiwjsURXWXcY',
      supportsCollectFees: true,
    },
    [SupportedDex.SpiritSwap]: {
      url: 'https://api.studio.thegraph.com/query/88584/fantom-v1-spiritswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/62EgsMcsvnSR2vUbS2c6u1Au3janYYtuKFhd3D2NkyMd',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.flare]: {
    [SupportedDex.SparkDex]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v2-sparkdex/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v2-sparkdex/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.SparkDexV1]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v1-sparkdex/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v1-sparkdex/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.SparkDexV4]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flare-v4-sparkdex/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flare-v4-sparkdex/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.flow]: {
    [SupportedDex.FlowSwap]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flow-v2-flowswap/gn',
      publishedUrl: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flow-v2-flowswap/gn',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.KittyPunch]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flow-v2-kittypunch/gn',
      publishedUrl: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/flow-v2-kittypunch/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.fuse]: {
    [SupportedDex.Voltage]: {
      url: 'https://api.studio.thegraph.com/query/88584/fuse-v1-voltage/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3vPXgLUrHhG6tRs6YoT7656UQXSa2dN6breZt9P8TfsQ',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.haven1]: {
    [SupportedDex.hSwap]: {
      url: 'https://api.haven1.0xgraph.xyz/api/public/4ba4443d-fa4a-4ec0-be0d-ba1a189c2277/subgraphs/haven1-v2-ichi-hswap/v0.0.1/gn',
      publishedUrl:
        'https://api.haven1.0xgraph.xyz/api/public/4ba4443d-fa4a-4ec0-be0d-ba1a189c2277/subgraphs/haven1-v2-ichi-hswap/v0.0.1/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.haven1_devnet]: {
    [SupportedDex.hSwap]: {
      url: 'https://api.haven1.0xgraph.xyz/api/public/4ba4443d-fa4a-4ec0-be0d-ba1a189c2277/subgraphs/ichi-staging-v2/v0.0.1/gn',
      publishedUrl:
        'https://api.haven1.0xgraph.xyz/api/public/4ba4443d-fa4a-4ec0-be0d-ba1a189c2277/subgraphs/ichi-staging-v2/v0.0.1/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.hedera]: {
    [SupportedDex.SaucerSwap]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v1-saucerswap/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v1-saucerswap/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Bonzo]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v2-bonzo/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v2-bonzo/gn',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Aux]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v2-aux/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hedera-v2-aux/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.hemi]: {
    [SupportedDex.Sushiswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/hemi-v-2-sushiswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GhoXkgbWWpAMQ6C1sgJ7hQJt36ocDR31XxPb9RhjXgL2',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/hemi-v-2-uniswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6vgG6d1icWJ8xYonLW5iZTSgJMMSMsGuuk5F137ksQVf',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.hyperevm]: {
    [SupportedDex.HyperSwap]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-hyperswap/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-hyperswap/gn',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.Nest]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-nest/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-nest/gn',
      supportsCollectFees: true,
      version: 2,
    },
    [SupportedDex.ProjectX]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-projectx/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/hyperevm-v2-projectx/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.ink]: {
    [SupportedDex.Reservoir]: {
      url: 'https://api.studio.thegraph.com/query/88584/ink-v-1-reservoir/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/HpknPC4bxoVsiNp1gXq63w4tcjFGN9ZokWSWdc3aKSRz',
      supportsCollectFees: true,
    },
    [SupportedDex.Velodrome]: {
      url: 'https://api.studio.thegraph.com/query/88584/ink-v-3-velodrome/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/DpBJxoNPbremsbV22e6wm3GCq41R715QXPUYdPxd9TQi',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.ink_sepolia]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/open-v3/ink-sepolia-v1/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/open-v3/ink-sepolia-v1/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.katana]: {
    [SupportedDex.Sushiswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/katana-v-2-sushiswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/F4BWERAWUduNTwZEF72yYi8GyEbWWsDdDZbJADUEUG16',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.kava]: {
    [SupportedDex.Kinetix]: {
      url: 'https://the-graph.kava.io/subgraphs/name/ichi-org/kava-v1-kinetix',
      publishedUrl: 'https://the-graph.kava.io/subgraphs/name/ichi-org/kava-v1-kinetix',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Linehub]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-linehub/v0.0.3',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/T2KQrNBqn6Et7xEjDAhMrvb9aJBYnHqmQhimbauYW9E',
      supportsCollectFees: true,
    },
    [SupportedDex.Lynex]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-lynex/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BXngwuUh7YYXg9QY2bFW5tqhuG2okNgczm1utfpEyCX9',
      supportsCollectFees: true,
    },
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CVBmJy2wVp3NPZQRzwHjboNyfVKsp2jaQoXZbFx1rR2A',
      supportsCollectFees: true,
    },
    [SupportedDex.Nile]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-nile/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3vrWez6BeB5jnvzXh9Vs9rbUSWmSKNbwDTcnuHQTbehu',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3FDwqSf1ftVtvDiTZExGZut3TPJKVx74htgPL2cuWh7g',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Agni]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-agni/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-agni/v0.0.2/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Cleo]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-cleo/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-cleo/v0.0.2/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Crust]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-crust/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-crust/v0.0.2/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.megaeth]: {
    [SupportedDex.Kumbaya]: {
      url: 'https://api.studio.thegraph.com/query/88584/megaeth-v-2-kumbaya/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Cii4puahhoSVBLrvnSb938vQWKBwD2Zr2z9tBv9VPjEW',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.mode]: {
    [SupportedDex.Kim]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/mode-v1-kim/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/mode-v1-kim/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.monad]: {
    [SupportedDex.Atlantis]: {
      url: 'https://api.studio.thegraph.com/query/88584/monad-v-2-atlantis/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EZgWBfZdrmM59HL5SbQkcQp53toKpvKkHgP8RcuQH5uw',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.monad_testnet]: {
    [SupportedDex.Atlantis]: {
      url: 'https://api.studio.thegraph.com/query/88584/monad-testnet-v-2-1-atlantis/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/rJu7xtaKTLrbvhgoqDNGYxULnFnHdMptq19gU8yRqkB',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.moonbeam]: {
    [SupportedDex.StellaSwap]: {
      url: 'https://api.studio.thegraph.com/query/88584/moonbeam-v-2-stellaswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/DgBPraNX8mK7uthvPtzq2rMWx1eU543rWT8kBi1ogWh8',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.nibiru]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/nibiru-v2-uniswap/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/nibiru-v2-uniswap/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zkevm-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6suvZcqmzNcrr6ewVwjeMtq2vNsZ6Z7pL3dVjWvDF96f',
      supportsCollectFees: true,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zkevm-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/4LAUjmgShgrvFFv7W9zPRKKDqLeSHMp1BMtPeR7cfBHt',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.real]: {
    [SupportedDex.Pearl]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/real-v1-pearl/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/real-v1-pearl/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.rootstock]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/rootstock-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BAvYHGJeD743cE3eg3UXYmjuEjtz72CCJ94Vp1zbFHhY',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/88584/scroll-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/J9ftF7FnUTbLDxxTXza1ekix2w39dspgpiFiquRK1qL',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/scroll-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3LqDsCLFLTTkwSfoCNVuHufLBeWyogSb1fZYicPmjron',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.skale_europa]: {
    [SupportedDex.Sushiswap]: {
      url: 'https://elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name/ichi-org/skale-europa-v1-sushiswap',
      publishedUrl:
        'https://elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name/ichi-org/skale-europa-v1-sushiswap',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.sonic]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/88584/sonic-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/nPdJMpi6vnGWYWwLXwkmtGe7qW6oUC28pmYPmWz2eY1',
      supportsCollectFees: true,
    },
    [SupportedDex.SwapX]: {
      url: 'https://api.studio.thegraph.com/query/88584/sonic-v1-swapx/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Gw1DrPbd1pBNorCWEfyb9i8txJ962qYqqPtuyX6iEH8u',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.tac]: {
    [SupportedDex.Snap]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/tac-v2-snap/gn',
      publishedUrl: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/g2/tac-v2-snap/gn',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.taiko]: {
    [SupportedDex.Henjin]: {
      url: 'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/henjin-ichi/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/henjin-ichi/1.0.0/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.taiko_hekla]: {
    [SupportedDex.Henjin]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.unichain]: {
    [SupportedDex.Catex]: {
      url: 'https://api.studio.thegraph.com/query/88584/unichain-v-2-uniswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/8fsJpbjBEzkwBUjsNbnA8tDd94NLSh6DvEUGhvFfNfho',
      supportsCollectFees: true,
      version: 2,
    },
  },
  [SupportedChainId.unreal]: {
    [SupportedDex.Pearl]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/unreal-v1-pearl/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/unreal-v1-pearl/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.x_layer_testnet]: {
    [SupportedDex.XSwap]: {
      url: 'https://api.studio.thegraph.com/query/88584/xlayer-sepolia-v1-xswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EsPs6Mz2akM2Hbqm66jTb4YrnW1cjHVDnoqcJV2Xvitt',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.zircuit]: {
    [SupportedDex.Ocelex]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/zircuit-v1-ocelex-0.0.1/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/zircuit-v1-ocelex-0.0.1/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zksync-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/HRoLbVrr8T8zCbC769cMseTpHq9Ebnqv5fKaJKJ4qkYc',
      supportsCollectFees: true,
    },
    [SupportedDex.Velocore]: {
      url: 'https://api.studio.thegraph.com/query/88584/zksync-v1-velocore/version/latest',
      publishedUrl: 'https://api.studio.thegraph.com/query/88584/zksync-v1-velocore/version/latest',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: true,
    },
  },
};
