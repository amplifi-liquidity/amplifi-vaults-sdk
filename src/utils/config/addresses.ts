import { SupportedDex, SupportedChainId } from '../../types';

// ERC20 Wrapper address for Hedera HTS wrapping
export const ERC20_WRAPPER_ADDRESS = '0x000000000000000000000000000000000093A3A8';

export type AddressConfig = { [key in SupportedDex]?: string };

export const AMM_VERSIONS = {
  ALGEBRA_INTEGRAL: 'algebraIntegral',
  VELODROME: 'velodrome',
};

export type SupportedDexConfig = {
  factoryAddress: string;
  depositGuard: {
    address: string;
    version: number;
  };
  vaultDeployerAddress: string;
  isAlgebra: boolean;
  ammVersion?: string;
  is2Thick?: boolean; // Equalizer 2Thick deployment, vaults don't have fee
};

export type Config = { [key in SupportedDex]?: SupportedDexConfig };

export const addressConfig: Record<SupportedChainId, Config> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xFB5263779D551d0f8a85D47a7D576C4893686D12',
        version: 2,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x0aC9e4a0423eec93357e2B0F83ef8c6469FD47F7',
      depositGuard: {
        address: '0x28cF3b462a1ADdE87fe7144d110BcF0D464C97b7',
        version: 1,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Ramses]: {
      factoryAddress: '0xedAc86bc526557c422AB1F6BF848bF0da9fB44A6',
      depositGuard: {
        address: '0x2472cA62c19ab99AB9947A7754fc38945b68Fb68',
        version: 1,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0xbA4c7b5eFD44Aa60da0440D0427555bdBE50e6BC',
      depositGuard: {
        address: '0xB77463Eba7f1bD5F37FCA35fdF9306B09bAa7379',
        version: 1,
      },
      isAlgebra: false,
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
    },
  },
  [SupportedChainId.arthera]: {
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xd466e09be665dDb3e1B3e2631413c6fa033E0e1e',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.arthera_testnet]: {
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0xbb7A3d439abf42Cf39837f9102F987bab3Ee2e73',
      depositGuard: {
        address: '0xe573920139a208989d83C57ea48837C6285F2cd3',
        version: 2,
      },
      vaultDeployerAddress: '0x21222daEcAB7E64556ADED3EE7B891742E7e766b',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapNew]: {
      factoryAddress: '0xF39A4c7C87310116Ad915833769d301c599b0298',
      depositGuard: {
        address: '0x2B8Ca8e6768e49f1256F91Bf5b0D8f30a776D4c6',
        version: 2,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0x64E44525a98bC85aC097Cc6Ca4c8F6BE7D483041',
        version: 2,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: false,
    },
    [SupportedDex.Retro]: {
      factoryAddress: '0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7',
      depositGuard: {
        address: '0x9B3Ea1A39576925fA94c4BCC7eECFA0d95D331E1',
        version: 1,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: false,
    },
    [SupportedDex.Quickswap]: {
      factoryAddress: '0x11700544C577Cb543a498B27B4F0f7018BDb6E8a',
      depositGuard: {
        address: '0xDB8E25D78483D13781622A40e69a9E39A4b590B6',
        version: 1,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: true,
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      depositGuard: {
        address: '0x3E1aFdB89B6Ea49e828C565ab6A36a485b7A4775',
        version: 2,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
    [SupportedDex.Blueprint]: {
      factoryAddress: '0xEAeC81F0eD4F622D4b389672d9859166C0832b3E',
      depositGuard: {
        address: '0xC3822b5e61d6702315EFD86573978a8a3f3Acb83',
        version: 1,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x8Dd50926e12BD71904bCCc6D86DFA55D42715094',
      depositGuard: {
        address: '0x81B2F475e1ca7AB6b2720AdFa2fA6D4c52C4F49d',
        version: 1,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Aerodrome]: {
      factoryAddress: '0xf6B5Ab192F2696921F60a1Ff00b99596C4045FA6',
      depositGuard: {
        address: '0x4A094b3e476D7C94445f023B5DAc837f9E0F98c2',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
      ammVersion: AMM_VERSIONS.VELODROME,
    },
    [SupportedDex.Aux]: {
      factoryAddress: '0x8371E865eB806631BE237c392C429E2e0c5f8671',
      depositGuard: {
        address: '0x92678D60e3d232307c6C7040CAa8acde8a4FA3a5',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
    [SupportedDex.Equalizer]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xBf38e4Ffb0B0Aa075531b38d71d3b18a5f599819',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
    [SupportedDex.Equalizer2Thick]: {
      factoryAddress: '0x4FD26d58de76b5E932548f11ab0d9E92d4FF65C8',
      depositGuard: {
        address: '0xE47d9A62c7982e7c8991223270E60903A9B85B45',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
      is2Thick: true,
    },
    [SupportedDex.Henjin]: {
      factoryAddress: '0x51a0D74e1791399cE02aafD9a21dc4637Fe57959',
      depositGuard: {
        address: '0xc7944fB8e8F4c89e7D8a997F59F2efec3Ce02B12',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Hydrex]: {
      factoryAddress: '0x2b52c416F723F16e883E53f3f16435B51300280a',
      depositGuard: {
        address: '0x9A0EBEc47c85fD30F1fdc90F57d2b178e84DC8d8',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Kim]: {
      factoryAddress: '0x28cF3b462a1ADdE87fe7144d110BcF0D464C97b7',
      depositGuard: {
        address: '0xd8Bb912F45681C2e637F884aAE14C6c784aB1cF0',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x24430E837efB64EF87bb32be03437fc6005EEF74',
      depositGuard: {
        address: '0xfA196A6c9137B320E8801252E3020f25aEe5C234',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
    [SupportedDex.Quickswap]: {
      factoryAddress: '0x8f4E7E81a2871d84c7DCDaB6Ba6F53b6b13003Ce',
      depositGuard: {
        address: '0x9a35206d6b6E3fE33591A0f05E27CA4D480a35CE',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0xaF5EA18bc8296e1EdF253d6f766a6e184eCAf1c3',
      depositGuard: {
        address: '0x726e0A1D0fE3B9b2A7759401887812a1afb0696e',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Trebleswap]: {
      factoryAddress: '0xbA096706A850caF1cADAEfE7529Db1343a0c187E',
      depositGuard: {
        address: '0x01EEbBA41FA1c5c8655fDe507a816F7DF76702b2',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.TrebleswapV2]: {
      factoryAddress: '0xB7864cfC3F1d36F8D6d87137f7c4Fc0a2dCc39A3',
      depositGuard: {
        address: '0xe0b5A8f510e81C65B649657507b1896E699F53c7',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3',
      depositGuard: {
        address: '0xe2381b5AFae99B899596Bc550184a080dAa31F26',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
  },
  [SupportedChainId.base_sepolia]: {
    [SupportedDex.Hydrex]: {
      factoryAddress: '0x4431CFdA42fB518A87f5928774DeA5389c43363a',
      depositGuard: {
        address: '0x92d46AC86f636202d24E178505Be1D7a99F8f182',
        version: 2,
      },
      vaultDeployerAddress: '0xAe781EB26fcA1486032e8A37FAae0C610979C7a1',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0x50893Df23638dB2607A3d398EaC6c65CDf847bB7',
      depositGuard: {
        address: '0xEb6EA277d7b0a876444dab30eEF0f154F406CfB4',
        version: 2,
      },
      vaultDeployerAddress: '0xAe781EB26fcA1486032e8A37FAae0C610979C7a1',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.berachain]: {
    [SupportedDex.Kodiak]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0xc0c6D4178410849eC9765B4267A73F4F64241832',
        version: 2,
      },
      vaultDeployerAddress: '0x9Fbba6c87923af2561A2391198166b51Cf5736E8',
      isAlgebra: false,
    },
    [SupportedDex.Wasabee]: {
      factoryAddress: '0x7d125D0766C968353454b7A67bB2D61a97E5665d',
      depositGuard: {
        address: '0x3bE78614342C7763d87520b2502085761Aa4e5f8',
        version: 2,
      },
      vaultDeployerAddress: '0x9Fbba6c87923af2561A2391198166b51Cf5736E8',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.berachain_bartio]: {
    [SupportedDex.Honeypot]: {
      factoryAddress: '0x0aC9e4a0423eec93357e2B0F83ef8c6469FD47F7',
      depositGuard: {
        address: '0xD360846137c2be74c6B7624A06A809Ca3aD4e014',
        version: 2,
      },
      vaultDeployerAddress: '0x249397Aa78bE5955DBc2102DF31B3FB2A92B1AA8',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Kodiak]: {
      factoryAddress: '0xCa8310832053de4909fe1A6C89C7200D033CBB76',
      depositGuard: {
        address: '0x0Dad5a47adbec92E7472F6F34AC066798dEdEE40',
        version: 2,
      },
      vaultDeployerAddress: '0x249397Aa78bE5955DBc2102DF31B3FB2A92B1AA8',
      isAlgebra: false,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      factoryAddress: '0xb42D5956cDe4386B65C087CfCD16910aB6114F15',
      depositGuard: {
        address: '0xd4493957338e3f66214c733883F789b99558758F',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.Thruster]: {
      factoryAddress: '0x2145B1CCe3A13AF4fBB14131f1F480fc121EAD93',
      depositGuard: {
        address: '0x8346A803e1754f9d4c6935aee1fd864Ff15955F1',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: false,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      factoryAddress: '0xA23A224add122F31EeD712E0C074CE0501b4CDC6',
      depositGuard: {
        address: '0x138361EA0f91CEcDe6A282089EdfEeB740076724',
        version: 2,
      },
      vaultDeployerAddress: '0x4d999694f53614de3fd6748C0f5c7f0CdC16639b',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.botanix]: {
    [SupportedDex.Bitzy]: {
      factoryAddress: '0x53511764DE94CdA43CbBadFFCca3F29D2EFAB0F8',
      depositGuard: {
        address: '0xd68b0114dB1e3CAcb5A334AA8aF3D14295c772E7',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x065356d9f628cDd1bb9F2384E2972CdAC50f51b7',
      depositGuard: {
        address: '0xa9b751f37857790D0412c81B072DB57CCc0aF545',
        version: 2,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D',
      depositGuard: {
        address: '0x2174154294729e593001CBF0232fb787a914b232',
        version: 2,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: false,
    },
    [SupportedDex.Thena]: {
      factoryAddress: '0xAc93148e93d1C49D89b1166BFd74942E80F5D501',
      depositGuard: {
        address: '0xd9272a45BbF488816C6A5351894bCE7b04a66eE1',
        version: 1,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: true,
    },
    [SupportedDex.ThenaV3Fees]: {
      factoryAddress: '0x7ca1Fe9087c264518a6420ADC41841DeA9c86BDb',
      depositGuard: {
        address: '0xfac2f9E2c03185d34982B99198765955b56b6933',
        version: 1,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.ThenaV3Rewards]: {
      factoryAddress: '0x076e46A317DfAE50eEF30dca94Ff41A63118948D',
      depositGuard: {
        address: '0x2b52c416F723F16e883E53f3f16435B51300280a',
        version: 2,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.ThenaV4Rewards]: {
      factoryAddress: '0xdf1da53334f1C71a1e377C371e11f55c9CDdFc8E',
      depositGuard: {
        address: '0x72B735e20210FA8bb38E41287CBaDC6520ff8cE1',
        version: 2,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.Ubeswap]: {
      factoryAddress: '0x8D05f6870106707BaeCFCf5C0570DB7a583eb92A',
      depositGuard: {
        address: '0x238394541dE407Fd494e455eF17C9D991F4FBEd8',
        version: 2,
      },
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x62fd1824C810906F449227F1f453528bb54774C2',
        version: 2,
      },
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      isAlgebra: false,
    },
    [SupportedDex.Velodrome]: {
      factoryAddress: '0x82DcA62C4B5Dd28Cc85CE8Ae3B170Ce020e33870',
      depositGuard: {
        address: '0x141dB85183DDB07Dee22C33846aebDe2101D9F25',
        version: 2,
      },
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      isAlgebra: false,
      ammVersion: AMM_VERSIONS.VELODROME,
    },
  },
  [SupportedChainId.citrea]: {
    [SupportedDex.Satsuma]: {
      factoryAddress: '0x1E3B3F9562adaF0351A558f8A1cE281E5a2623AC',
      depositGuard: {
        address: '0x968bD363728e85D696b2C981a12864E32337C2d0',
        version: 2,
      },
      vaultDeployerAddress: '0x90434237670C37bfbBadF61EBbbf60be70c214dD',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.citrea_testnet]: {
    [SupportedDex.Satsuma]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0xcA3534C15Cc22535BF880Ba204c69340f813730b',
        version: 2,
      },
      vaultDeployerAddress: '0x5B4b1f40CEa75f3b7E4df178AD1B1804d82491d9',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.cronos]: {
    [SupportedDex.VVS]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x05043eE22e5E64677D42A632D42a5cb15187947B    ',
        version: 2,
      },
      vaultDeployerAddress: '0xb3104ba008610C2CC7F665F2a6117f2E93515309',
      isAlgebra: false,
    },
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: {
      factoryAddress: '0x242cd12579467983dc521D8aC46EB13936ab65De',
      depositGuard: {
        address: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3',
        version: 1,
      },
      vaultDeployerAddress: '0xB9200A707f11357D3B1cBDEbd51c8dDA84960Bde',
      isAlgebra: false,
    },
  },
  [SupportedChainId.evmos]: {
    [SupportedDex.Forge]: {
      factoryAddress: '0x7c6389714719c68caac8ae06bae6e878b3605f6d',
      depositGuard: {
        address: '0x0248b992ac2a75294b05286E9DD3A2bD3C9CFE4B',
        version: 2,
      },
      vaultDeployerAddress: '0x5BD1EC3Aba15642a25FBA7b49497b4e49Ebf9C83',
      isAlgebra: false,
    },
  },
  [SupportedChainId.fantom]: {
    [SupportedDex.Equalizer]: {
      factoryAddress: '0x932E1908461De58b0891E5022431dc995Cb95C5E',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xE495eFdf1d19668a27042D30ee22AC3C58b6fB6c',
      isAlgebra: false,
    },
    [SupportedDex.SpiritSwap]: {
      factoryAddress: '0x89FFdaa18b296d9F0CF02fBD88e5c633FEFA5f34',
      depositGuard: {
        address: '0x02F4a98A4e59E8c7Ba3269cbcd1F1e9F3eCcfcf5',
        version: 2,
      },
      vaultDeployerAddress: '0xE495eFdf1d19668a27042D30ee22AC3C58b6fB6c',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.flare]: {
    [SupportedDex.SparkDex]: {
      factoryAddress: '0x85a4dd4ed356A7976a8302b1b690202d58583c55',
      depositGuard: {
        address: '0x4F15CED4dD9B8eF545809431c177a3ae46A29c37',
        version: 2,
      },
      vaultDeployerAddress: '0x2d1918dBa43d55B9F0E2596aecC74826BbB7d668',
      isAlgebra: false,
    },
    [SupportedDex.SparkDexV1]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x4F15CED4dD9B8eF545809431c177a3ae46A29c37',
        version: 2,
      },
      vaultDeployerAddress: '0x2d1918dBa43d55B9F0E2596aecC74826BbB7d668',
      isAlgebra: false,
    },
    [SupportedDex.SparkDexV4]: {
      factoryAddress: '0xAD8408D13381815fDb1B598bf162e7bE8740b780',
      depositGuard: {
        address: '0x03503AA94c1588abD9Df7f1c8B0e3c6e94fb6E36',
        version: 2,
      },
      vaultDeployerAddress: '0x2d1918dBa43d55B9F0E2596aecC74826BbB7d668',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.flow]: {
    [SupportedDex.FlowSwap]: {
      factoryAddress: '0x6992bB9dDbf44166e3739c8A3147e7e70a082cEb',
      depositGuard: {
        address: '0xA3E172C181508A63571840cB8E42723F082bCeC2',
        version: 2,
      },
      vaultDeployerAddress: '0x2ca0824135b7da7B956CD1B851C451Bc801eb976',
      isAlgebra: false,
    },
    [SupportedDex.KittyPunch]: {
      factoryAddress: '0x3bE78614342C7763d87520b2502085761Aa4e5f8',
      depositGuard: {
        address: '0xe48aD9fDB787ff25f7bBb400Fc993122d430C8E1',
        version: 2,
      },
      vaultDeployerAddress: '0x2ca0824135b7da7B956CD1B851C451Bc801eb976',
      isAlgebra: false,
    },
  },
  [SupportedChainId.fuse]: {
    [SupportedDex.Voltage]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0x9f99f94B6AF33a04684Ab3c9578608a2Ae1706AA',
      isAlgebra: false,
    },
  },
  [SupportedChainId.haven1]: {
    [SupportedDex.hSwap]: {
      factoryAddress: '0x53511764DE94CdA43CbBadFFCca3F29D2EFAB0F8',
      depositGuard: {
        address: '0xf0d899E6582CF2fd1A05F52C8e1b3a56feD9fdb9',
        version: 2,
      },
      vaultDeployerAddress: '0x19ad5C1d7867115a0545DCA69884Aa2DA0bfb3B1',
      isAlgebra: false,
    },
  },
  [SupportedChainId.haven1_devnet]: {
    [SupportedDex.hSwap]: {
      factoryAddress: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3',
      depositGuard: {
        address: '0x0e44F5cdaBefe34d5B729acFa0a79971FFBC0E7e',
        version: 2,
      },
      vaultDeployerAddress: '0x9D821cb8b2D02115cEFe677E61582b6275770cbF',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hedera]: {
    [SupportedDex.SaucerSwap]: {
      factoryAddress: '0xb62399d23d1c81f08ea445a42d7f15cc12090a71',
      depositGuard: {
        address: '0x1B0ef045830466171D617dD0F1142aD699A4Cd63',
        version: 2,
      },
      vaultDeployerAddress: '0x8514B2Fa2889F7A2f46F1AA66b514999F2a7327F',
      isAlgebra: false,
    },
    [SupportedDex.Bonzo]: {
      factoryAddress: '0x822b0bE4958ab5b4A48DA3c5f68Fc54846093618',
      depositGuard: {
        address: '0xCEc8716cdd60856eaCaa74d499Abd14AE34B7dA8', // with HTS Wrapping new
        version: 2,
      },
      vaultDeployerAddress: '0xC159b19C5bd0E4a0709eC13C1303Ff2Bb67F7145',
      isAlgebra: false,
    },
    [SupportedDex.Aux]: {
      factoryAddress: '0x3A85eDF32EF87A67771A9Be4a0B93a07987FbBD6',
      depositGuard: {
        address: '0x7F4045Dc51EA17F33a8695c7C98E83da58c6418f',
        version: 2,
      },
      vaultDeployerAddress: '0xC159b19C5bd0E4a0709eC13C1303Ff2Bb67F7145',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: {
      factoryAddress: '0x3DfD6dd38F055188adCb2332C2926DDA28d318bD',
      depositGuard: {
        address: '0x16Dd62dB239DF67786F0AB7596C445aCDe81a16F',
        version: 2,
      },
      vaultDeployerAddress: '0xEc7428cB95cD92e7556172FfBe735c6D48f6DEB7',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hemi]: {
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0x5541Bcd3d163326CF12267D1cF6207dbde788348',
      depositGuard: {
        address: '0x4196f1cD200739AAC173D83853B4060DA1adB1F6',
        version: 2,
      },
      vaultDeployerAddress: '0xAFE7041797E8916616952a719971575f352e2b0d',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x38e6706860dE0b96CD12Eff815DEDF01E5fe0722',
        version: 2,
      },
      vaultDeployerAddress: '0xAFE7041797E8916616952a719971575f352e2b0d',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hyperevm]: {
    [SupportedDex.HyperSwap]: {
      factoryAddress: '0xCd952718e6Ef25ac7DBDDd55E501AAA0177dbfA0',
      depositGuard: {
        address: '0x4a72DE60A93055139EfB3Dc8F021ceeCaD8CAa7a',
        version: 2,
      },
      vaultDeployerAddress: '0xd71D9b66875C7d57AD630ee58F82e5e76B227aaB',
      isAlgebra: false,
    },
    [SupportedDex.Nest]: {
      factoryAddress: '0x2A3EB890dC0902c7Ca6CC71a1E9670463b32a3f0',
      depositGuard: {
        address: '0x547aD1D6ff5127b89BBdC20656C92Df87cf0F39c',
        version: 2,
      },
      vaultDeployerAddress: '0xd71D9b66875C7d57AD630ee58F82e5e76B227aaB',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
    [SupportedDex.ProjectX]: {
      factoryAddress: '0xF0974cB26aB861221C16d4A93B1273Cd668ed0B3',
      depositGuard: {
        address: '0x8CB886A9F7e86d0429bB79aF468258e54735a23C',
        version: 2,
      },
      vaultDeployerAddress: '0xd71D9b66875C7d57AD630ee58F82e5e76B227aaB',
      isAlgebra: false,
    },
  },
  [SupportedChainId.ink]: {
    [SupportedDex.Reservoir]: {
      factoryAddress: '0x65CD1f0ac298519BE4891B5812053e00BD2074AC',
      depositGuard: {
        address: '0x51339a25FB3f8351c43b4B552AF82C1B234FED93',
        version: 2,
      },
      vaultDeployerAddress: '0xcBd1F70235904d3764f5d159022BA0281536E3E8',
      isAlgebra: false,
    },
    [SupportedDex.Velodrome]: {
      factoryAddress: '0x822b0bE4958ab5b4A48DA3c5f68Fc54846093618',
      depositGuard: {
        address: '0x2AB2C46dF4146E092bAC933B73Ed37B420Ae52EA',
        version: 2,
      },
      vaultDeployerAddress: '0xcBd1F70235904d3764f5d159022BA0281536E3E8',
      isAlgebra: false,
      ammVersion: AMM_VERSIONS.VELODROME,
    },
  },
  [SupportedChainId.ink_sepolia]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x259743Ff627313D55b6a15735bD40Aa9aC4D6aDE',
      depositGuard: {
        address: '0xCa8310832053de4909fe1A6C89C7200D033CBB76',
        version: 2,
      },
      vaultDeployerAddress: '0xC5901f39c510c6D8c4d7b692608A6AA8982E4C3f',
      isAlgebra: false,
    },
  },
  [SupportedChainId.katana]: {
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0x9176B8Eb7Fdff309BE258F2F2eDB32a8b79f19B5',
      depositGuard: {
        address: '0x046c3B5de733524468097A51dfeAd097B2ddbAdD',
        version: 2,
      },
      vaultDeployerAddress: '0x76c34b69c3c4726dedb89AE51a4Ae40B0F09F2a2',
      isAlgebra: false,
    },
  },
  [SupportedChainId.kava]: {
    [SupportedDex.Kinetix]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Linehub]: {
      factoryAddress: '0xb0e7871d53BE1b1d746bBfD9511e2eF3cD70a6E7',
      depositGuard: {
        address: '0x60f50858953dBf1A699B88037D9dce235b8c505D',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.Lynex]: {
      factoryAddress: '0x0248b992ac2a75294b05286E9DD3A2bD3C9CFE4B',
      depositGuard: {
        address: '0x57C9d919AEA56171506cfb62B60ce76be0A079DF',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: true,
    },
    [SupportedDex.Metavault]: {
      factoryAddress: '0x2592686212C164C1851dF2f62c5d5EC50600195E',
      depositGuard: {
        address: '0x92Bce3972916C2CEDA46c4EEbC9684aC26EFfe5B',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.Nile]: {
      factoryAddress: '0xa29F3D5403D50Ea1BF597E2Ef01791A1Ce4F544E',
      depositGuard: {
        address: '0x19227E17944FAF42419F019Dcc8762C400fE50A7',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x6E3eB904966B0158833852cAFD1200c171772b53',
      depositGuard: {
        address: '0xCf99c2b3D1a9588A9a9A34eab25cD6f425FA8801',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Agni]: {
      factoryAddress: '0x92Bce3972916C2CEDA46c4EEbC9684aC26EFfe5B',
      depositGuard: {
        address: '0x2121AA95a8B05d9C1Db90368B60C6867618814b8',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
    [SupportedDex.Cleo]: {
      factoryAddress: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
    [SupportedDex.Crust]: {
      factoryAddress: '0x797ebB6A84367B0409094FEA0D10aC7516432433',
      depositGuard: {
        address: '0x15Ea9A2a0FfBaA8Ad51a10a9bda84E60585Ba0De',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
  },
  [SupportedChainId.megaeth]: {
    [SupportedDex.Kumbaya]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x886Ef6D0E38D3e37Eef7E73c856EDedf0E6c0E40',
        version: 2,
      },
      vaultDeployerAddress: '0x267bbB157Efe222d9D2A843025127b9390C67596',
      isAlgebra: false,
    },
  },
  [SupportedChainId.mode]: {
    [SupportedDex.Kim]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x2E76A8D053f839A04235341dF1f25235437fEDd6',
        version: 2,
      },
      vaultDeployerAddress: '0x124871b2FC05fD96521238cA2Bd01B770FBf1E37',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.monad]: {
    [SupportedDex.Atlantis]: {
      factoryAddress: '0xA6cEEf2a9b7B080F62ea2F73F2271214F0d928F8',
      depositGuard: {
        address: '0xf10075dA7DD842e8c5FBa17398e8F64F39C201E2',
        version: 2,
      },
      vaultDeployerAddress: '0xd50b5AD0d8D9CcAfe837162Abb80F9D612026a13',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.monad_testnet]: {
    [SupportedDex.Atlantis]: {
      factoryAddress: '0x4431CFdA42fB518A87f5928774DeA5389c43363a',
      depositGuard: {
        address: '0x8d963e46da8eC0365D7ef875dA52c53288b88C73',
        version: 2,
      },
      vaultDeployerAddress: '0x6d2eF63eAe5D6B99474b7d0479877C4037769fdf',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.moonbeam]: {
    [SupportedDex.StellaSwap]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x4858d61E83118f124b7dF3E908a3bb465540fFBc',
        version: 2,
      },
      vaultDeployerAddress: '0xD32bCFA0375c6807E89DA2721481085A183d2258',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.nibiru]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x63703A4DdFA51B6CffC1Bb40cc73912dF62535FA',
      depositGuard: {
        address: '0x85a4dd4ed356A7976a8302b1b690202d58583c55',
        version: 2,
      },
      vaultDeployerAddress: '0x88653A91538B17E58c9268573c2345A48B0493C7',
      isAlgebra: false,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0xe8532Db60408f2d47693dA5b9093D71580B8C23F',
      depositGuard: {
        address: '0x71338eAcdE9eF818d4F5ff979e0E727b90Dd5F59',
        version: 2,
      },
      vaultDeployerAddress: '0xCAE2d9760B852861e1A552b35e48c263047Fbc0f',
      isAlgebra: false,
    },
    [SupportedDex.Quickswap]: {
      factoryAddress: '0x1721cB3ff3cAF70a79bDE9d771B27646ed8115b1',
      depositGuard: {
        address: '0xC030BEf30EDE8ebd7Fd319361ceBa54c81754AD3',
        version: 2,
      },
      vaultDeployerAddress: '0xCAE2d9760B852861e1A552b35e48c263047Fbc0f',
      isAlgebra: true,
    },
  },
  [SupportedChainId.real]: {
    [SupportedDex.Pearl]: {
      factoryAddress: '0x860F3881aCBbF05D48a324C5b8ca9004D31A146C',
      depositGuard: {
        address: '0x89FFdaa18b296d9F0CF02fBD88e5c633FEFA5f34',
        version: 2,
      },
      vaultDeployerAddress: '0xBAd0700365De39C932b905002604B0A22aA4Bb77',
      isAlgebra: false,
    },
  },
  [SupportedChainId.rootstock]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x74C85FF93D0ff3B5E48c119390EF75A43D78d549',
        version: 2,
      },
      vaultDeployerAddress: '0x9708b4a2BDd23C8c432F04972AaDE12e4a346447',
      isAlgebra: false,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0x596643Ce4fe8b2e72F340584cec02Ab99dA866c1',
      isAlgebra: false,
    },
    [SupportedDex.Metavault]: {
      factoryAddress: '0xb42D5956cDe4386B65C087CfCD16910aB6114F15',
      depositGuard: {
        address: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D',
        version: 2,
      },
      vaultDeployerAddress: '0x596643Ce4fe8b2e72F340584cec02Ab99dA866c1',
      isAlgebra: false,
    },
  },
  [SupportedChainId.skale_europa]: {
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0x1B0ef045830466171D617dD0F1142aD699A4Cd63',
      depositGuard: {
        address: '0x860F3881aCBbF05D48a324C5b8ca9004D31A146C',
        version: 2,
      },
      vaultDeployerAddress: '0xED0A10A7db58d9dB23DDfB7EEbFE1Fe863ef67aA',
      isAlgebra: false,
    },
  },
  [SupportedChainId.sonic]: {
    [SupportedDex.Equalizer]: {
      factoryAddress: '0x7D18F2D60E4fd6F485419727515807d09A542eb9',
      depositGuard: {
        address: '0x4c8c0D2Ca19a97896AA9135449e6d6471a53FC5f',
        version: 2,
      },
      vaultDeployerAddress: '0x0b2a31D95B1a4c8b1e772599ffcB8875FB4e2d33',
      isAlgebra: false,
      is2Thick: true,
    },
    [SupportedDex.SwapX]: {
      factoryAddress: '0x34513e8A327987Bb44acF5A925a7f3b4092d8b5F',
      depositGuard: {
        address: '0x65CD1f0ac298519BE4891B5812053e00BD2074AC',
        version: 2,
      },
      vaultDeployerAddress: '0x0b2a31D95B1a4c8b1e772599ffcB8875FB4e2d33',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.tac]: {
    [SupportedDex.Snap]: {
      factoryAddress: '0x3Aa31b2E925d0E872f9A68Fe057Ed677e735F38d',
      depositGuard: {
        address: '0x38e6706860dE0b96CD12Eff815DEDF01E5fe0722',
        version: 2,
      },
      vaultDeployerAddress: '0xDed64030c1b0A63DE0CAd8165f681c7Ef36E4ae3',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.taiko]: {
    [SupportedDex.Henjin]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x2E76A8D053f839A04235341dF1f25235437fEDd6',
        version: 2,
      },
      vaultDeployerAddress: '0xD639392f0fD8686E1739CE3E3174115e33E95a26',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.taiko_hekla]: {
    [SupportedDex.Henjin]: {
      factoryAddress: '0x7C6389714719C68cAAc8Ae06baE6E878B3605f6D',
      depositGuard: {
        address: '0xF8b3f6727e44abb211C0049FC849FbB091Ff765E',
        version: 2,
      },
      vaultDeployerAddress: '0x92403A045a2C908920D6A7FD5A5591a01dB7EE6E',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.unichain]: {
    [SupportedDex.Catex]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0xEb6EA277d7b0a876444dab30eEF0f154F406CfB4',
        version: 2,
      },
      vaultDeployerAddress: '0xf0d92E5F6Ccd4E095C4097c1635c7A75D7226114',
      isAlgebra: false,
    },
  },
  [SupportedChainId.unreal]: {
    [SupportedDex.Pearl]: {
      factoryAddress: '0x1294EC9615C91077ebdC57CfC7DDB65140750992',
      depositGuard: {
        address: '0x6DC9b390130c96b788eBEB389cb3cba992289532',
        version: 2,
      },
      vaultDeployerAddress: '0xBAd0700365De39C932b905002604B0A22aA4Bb77',
      isAlgebra: false,
    },
  },
  [SupportedChainId.x_layer_testnet]: {
    [SupportedDex.XSwap]: {
      factoryAddress: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
      depositGuard: {
        address: '0xe573920139a208989d83C57ea48837C6285F2cd3',
        version: 2,
      },
      vaultDeployerAddress: '0x412840Fd29A78428d3dbAeca811414c08b554599',
      isAlgebra: true,
      ammVersion: AMM_VERSIONS.ALGEBRA_INTEGRAL,
    },
  },
  [SupportedChainId.zircuit]: {
    [SupportedDex.Ocelex]: {
      factoryAddress: '0x1A58D4CFF22C7E2e0c4cCf4a0010b87822d024A1',
      depositGuard: {
        address: '0x259743Ff627313D55b6a15735bD40Aa9aC4D6aDE',
        version: 2,
      },
      vaultDeployerAddress: '0x8fC4aFAA9B4C3cbE97F08e040e945411EFb18993',
      isAlgebra: true,
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x8a76c26E0089111989C14EF56b9733aa38B94148',
      depositGuard: {
        address: '0x5997487384CDae95E1AED6eAab1bb827180E1154',
        version: 1,
      },
      isAlgebra: false,
      vaultDeployerAddress: '0x12C1F03a443A5B893870ea6cBDb2362f666275Da',
    },
    [SupportedDex.Velocore]: {
      factoryAddress: '0x1Cd7f4a2E9e7EFb23E27CFB9eF3a2F3CFAf27675',
      depositGuard: {
        address: '0x01292A32a0b8F8f56fBb8DB90d3756a0EF06C666',
        version: 2,
      },
      vaultDeployerAddress: '0x12C1F03a443A5B893870ea6cBDb2362f666275Da',
      isAlgebra: true,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      factoryAddress: '0x0227f2b783b610107349da9b9DF516b8d476aB4F',
      depositGuard: {
        address: '0x7570c7b58c68d95F0663f89C228B7b13d05c15e6',
        version: 1,
      },
      vaultDeployerAddress: '0x451Efff92a3a1471b7af9DDc1369D9D157E6475A',
      isAlgebra: true,
    },
  },
};

export const MULTICALL_ADDRESSES: Partial<Record<SupportedChainId, string>> = {
  [SupportedChainId.mainnet]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.flare]: '0x921aCCA39e8D3519A503EE4A11b56d6eEACbb2Aa',
  [SupportedChainId.rootstock]: '0x8CF119F15575CAb4beb427Fb485087e71a96Fbaa',
  [SupportedChainId.arbitrum]: '0xd9e7c0932a7D3e40Db3Fe78d95A3ED375a37Ab1a',
  [SupportedChainId.base_sepolia]: '0xd867e273eAbD6c853fCd0Ca0bFB6a3aE6491d2C1',
  [SupportedChainId.berachain]: '0x89ff70257bc747F310bB538eeFC46aDD763e75d8',
  [SupportedChainId.botanix]: "0xE89F840427D043ED96d70D3b63916776216f55D6",
  [SupportedChainId.citrea]: '0xa730caa84b6e72bb51ed5b2a1b08bc6031a95294',
  [SupportedChainId.citrea_testnet]: '0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1',
  [SupportedChainId.cronos]: "0x088ee1FB556Cbd24383AFE3ED9812235Ee931e13",
  [SupportedChainId.haven1_devnet]: '0xe573920139a208989d83C57ea48837C6285F2cd3',
  [SupportedChainId.fantom]: '0xd9e7c0932a7D3e40Db3Fe78d95A3ED375a37Ab1a',
  [SupportedChainId.flow]: '0xA41Fef85d7a7DebAD0CC265Ad514716C52919559',
  [SupportedChainId.hedera_testnet]: '0x0B10E483AAC4340256772754d23131B6E0Dc31EA',
  [SupportedChainId.hedera]: '0x0B10E483AAC4340256772754d23131B6E0Dc31EA',
  [SupportedChainId.hemi]: '0x352A86168e6988A1aDF9A15Cb00017AAd3B67155',
  [SupportedChainId.hyperevm]: '0xE8571fd6629DA6E488f7BbD83e729c20Fa9B97B4',
  [SupportedChainId.ink]: '0xcfEA11557Bc9cB71bc6916e09fC8493D668b8d53',
  [SupportedChainId.ink_sepolia]: '0x27404A54D594Aa6307C3f9Be102646363d6279a1',
  [SupportedChainId.katana]: '0xA730CAa84B6E72bb51eD5b2A1B08bc6031a95294',
  [SupportedChainId.mantle]: '0xf5bb4e61ccAC9080fb520e5F69224eE85a4D588F',
  [SupportedChainId.megaeth]: '0x63703A4DdFA51B6CffC1Bb40cc73912dF62535FA',
  [SupportedChainId.mode]: '0x481BE66De423B6a0Df368b526713bA632EF23ADd',
  [SupportedChainId.monad]: '0xD1b797D92d87B688193A2B976eFc8D577D204343',
  [SupportedChainId.monad_testnet]: '0xcfEA11557Bc9cB71bc6916e09fC8493D668b8d53',
  [SupportedChainId.moonbeam]: '0x4F15CED4dD9B8eF545809431c177a3ae46A29c37',
  [SupportedChainId.nibiru]: '0x5d6b0f5335ec95cD2aB7E52f2A0750dd86502435',
  [SupportedChainId.sonic]: '0x9B500c0a544B870D9C4c441147dCaEf599e542E7',
  [SupportedChainId.tac]: '0xD360846137c2be74c6B7624A06A809Ca3aD4e014',
  [SupportedChainId.unichain]: '0xb7610f9b733e7d45184be3a1bc966960ccc54f0b',
  [SupportedChainId.zircuit]: '0x89EC5589c030FcEf8c29E7EeC491D2E73b53A623',
  [SupportedChainId.zksync_era_testnet]: '0x8A23CB45E5F4d5a1b2DB673663Ea2aAedc48acff',
  [SupportedChainId.zksync_era]: '0x95071cBD09184083E7F732a710c2e30c9882Fd5f',
  [SupportedChainId.polygon_zkevm]: '0xe05b539447B17630Cb087473F6b50E5c5f73FDeb',
  [SupportedChainId.polygon]: '0xFb6021617c03dcEF189C3f783C56e3D9ff284919',
  [SupportedChainId.fuse]: '0x607F5841eFf0505d3c7A868558aD4562fD176C8F',
  [SupportedChainId.bsc]: '0x74d8b6407b8f33b40d7a1e34375176394f59afe6',
  [SupportedChainId.evmos]: '0x8a4A5eEC59899F2d23B08f0188d6eB540cF4EccC',
  [SupportedChainId.arthera]: '0x15fCbF9bC0797567053A8265b7E6f4eC43EA7327',
  [SupportedChainId.arthera_testnet]: '0xEC250E6856e14A494cb1f0abC61d72348c79F418',
  [SupportedChainId.unreal]: '0xe573920139a208989d83C57ea48837C6285F2cd3',
  [SupportedChainId.real]: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3',
  [SupportedChainId.base]: '0x091e99cb1C49331a94dD62755D168E941AbD0693',
  [SupportedChainId.linea]: '0xe573920139a208989d83C57ea48837C6285F2cd3',
  [SupportedChainId.berachain_bartio]: '0x932E1908461De58b0891E5022431dc995Cb95C5E',
  [SupportedChainId.blast]: '0xdC7f370de7631cE9e2c2e1DCDA6B3B5744Cf4705',
  [SupportedChainId.taiko]: '0xaF0C5CBbCEfB685BF3200684d2aE19B8eA6186ca',
  [SupportedChainId.scroll]: '0xC1D2e074C38FdD5CA965000668420C80316F0915',
  [SupportedChainId.blast_sepolia_testnet]: '0xEc27362204a1D02e9803d0eB4904e8df470b2B39',
  [SupportedChainId.x_layer_testnet]: '0x7B4553a35D3020064cB464a8D75a4735FfdA15Bd',
  [SupportedChainId.celo]: '0x633987602DE5C4F337e3DbF265303A1080324204',
  [SupportedChainId.kava]: '0x481BE66De423B6a0Df368b526713bA632EF23ADd',
  [SupportedChainId.skale_europa]: '0x15bA62A09E6e295A696D02f8E4B80a8a13bF3785',
};
