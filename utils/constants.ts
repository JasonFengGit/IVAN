import { Coins } from '@/sui/config'
import { NodeType } from './CheckNodeSpeed'

export const CoinPoolType = {
  [Coins.SUI]: process.env.NEXT_PUBLIC_SUI_POOL,
  [Coins.WBTC]: process.env.NEXT_PUBLIC_WBTC_POOL,
  [Coins.WETH]: process.env.NEXT_PUBLIC_WETH_POOL,
  [Coins.USDT]: process.env.NEXT_PUBLIC_USDT_POOL,
  [Coins.wUSDC]: process.env.NEXT_PUBLIC_wUSDC_POOL,
  [Coins.voloSUI]: process.env.NEXT_PUBLIC_vSUI_POOL,
  [Coins.vSUI]: process.env.NEXT_PUBLIC_vSUI_POOL,
  [Coins.AFSUI]: process.env.NEXT_PUBLIC_AFSUI_POOL,
  [Coins.haSUI]: process.env.NEXT_PUBLIC_haSUI_POOL,
  [Coins.CETUS]: process.env.NEXT_PUBLIC_CETUS_POOL,
  [Coins.NAVX]: process.env.NEXT_PUBLIC_NAVX_POOL,
  [Coins.USDYs]: process.env.NEXT_PUBLIC_USDYs_POOL,
  [Coins.USDY]: process.env.NEXT_PUBLIC_USDY_POOL,
  [Coins.BUCK]: process.env.NEXT_PUBLIC_BUCK_POOL,
  [Coins.FDUSD]: process.env.NEXT_PUBLIC_FDUSD_POOL,
  [Coins.TDAI]: process.env.NEXT_PUBLIC_TDAI_POOL,
  [Coins.AUSDs]: process.env.NEXT_PUBLIC_AUSDs_POOL,
  [Coins.AUSD]: process.env.NEXT_PUBLIC_AUSD_POOL,
  [Coins.USDC]: process.env.NEXT_PUBLIC_USDC_POOL,
  [Coins.ETH]: process.env.NEXT_PUBLIC_ETH_POOL,
  [Coins.NS]: process.env.NEXT_PUBLIC_NS_POOL,
  [Coins.stBTC]: process.env.NEXT_PUBLIC_stBTC_POOL,
  [Coins.DEEP]: process.env.NEXT_PUBLIC_DEEP_POOL,
  [Coins.stSUI]: process.env.NEXT_PUBLIC_stSUI_POOL,
  [Coins.BLUE]: process.env.NEXT_PUBLIC_BLUE_POOL,
  [Coins.suiUSDT]: process.env.NEXT_PUBLIC_suiUSDT_POOL,
}

export enum PanelTabType {
  All = 'index:panel.tab.all',
  Stablecoins = 'index:panel.tab.stable-coins',
  MainAssets = 'index:panel.tab.main-assets',
  DeFi = 'index:panel.tab.defi',
  LST = 'index:panel.tab.lst',
}

export enum RewardPoolStatus {
  PoolStatusAll = 0,
  PoolStatusEnabled = 1,
  PoolStatusClosed = 2,
  PoolStatusNotStarted = 3,
}

export enum OptionType {
  Supply = 1,
  Withdraw = 2,
  Borrow = 3,
  Repay = 4,
}

export enum ActionType {
  Supply,
  Withdraw,
  Borrow,
  Repay,
}

export enum DynamicHealthDisableType {
  Disable,
  Enable,
  Error,
}

export const Rate_Decimals = 27
export const Default_Decimals = 9

export const TESTNET_EXPLORER_URL = 'https://testnet.suivision.xyz'
export const MAINNET_EXPLORER_URL = 'https://suivision.xyz'
export const GET_TOKENS_URL = 'https://naviprotocol.gitbook.io/navi-protocol-docs/getting-started/get-tokens-on-sui'
export const VOLO_URL = 'https://volosui.com'

export const TOKEN_EXPLORER_SUIVISION_URL = {
  [Coins.SUI]:
    'https://suivision.xyz/coin/0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
  [Coins.NAVX]:
    'https://suivision.xyz/coin/0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX',
  [Coins.USDT]:
    'https://suivision.xyz/coin/0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
  [Coins.wUSDC]:
    'https://suivision.xyz/coin/0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
  [Coins.USDC]:
    'https://suivision.xyz/coin/0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  [Coins.vSUI]:
    'https://suivision.xyz/coin/0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
  [Coins.CETUS]:
    'https://suivision.xyz/coin/0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
  [Coins.haSUI]:
    'https://suivision.xyz/coin/0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
  [Coins.AUSD]:
    'https://suivision.xyz/coin/0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD',
  [Coins.WETH]:
    'https://suivision.xyz/coin/0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
  [Coins.WBTC]:
    'https://suivision.xyz/coin/0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN',
  [Coins.ETH]:
    'https://suivision.xyz/coin/0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',

  //development
  [Coins.AFSUI]:
    'https://suivision.xyz/coin/0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
  [Coins.USDYs]:
    'https://suivision.xyz/coin/0xa45fa952a312a0a504fafb9bf3fc95faaccdfe613a740190c511663600d39010::usdys::USDYS',
  [Coins.USDY]:
    'https://suivision.xyz/coin/0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY',
  [Coins.BUCK]:
    'https://suivision.xyz/coin/0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
  [Coins.TDAI]:
    'https://suivision.xyz/coin/0x6775698681ebe5a3bd931f80c71eda65941d92ce1b8ee17b6fe59aacc2c489b6::tdai::TDAI',
  [Coins.AUSDs]:
    'https://suivision.xyz/coin/0x0ae6b3b3117ab4d524eaa16d74483324eb1885888ef0370803b331e1b04ee65c::ausd::AUSD',

  //
  [Coins.NS]: 'https://suivision.xyz/coin/0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS',
  [Coins.stBTC]:
    'https://suivision.xyz/coin/0x5f496ed5d9d045c5b788dc1bb85f54100f2ede11e46f6a232c29daada4c5bdb6::coin::COIN',
  [Coins.DEEP]:
    'https://suivision.xyz/coin/0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
  [Coins.FDUSD]:
    'https://suivision.xyz/coin/0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD',
  [Coins.stSUI]:
    'https://suivision.xyz/coin/0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
  [Coins.BLUE]:
    'https://suivision.xyz/coin/0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE',
  [Coins.suiUSDT]:
    'https://suivision.xyz/coin/0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
}

export enum Environment {
  Staging = 'Staging',
  Dev = 'Dev',
  Pro = 'Pro',
}

export const Env = process.env.NEXT_PUBLIC_ENV

export const Nodes: NodeType[] = [
  { host: 'rpc.ankr.com/sui/024387cf22719a40e08abd5c8ce04ea6d2e6e6e62b0c691e2e4395c91493f47e' },
  // { host: 'mainnet.suiet.app' },
]

export const DEFAULT_REWARD_APY_ADDRESS = '0x7e6ae3c0f2701585a076c98b0b9e69d86064772a7f64f0d6e9012cd74771af1c'

export const RewardCardDataConfig = {
  // supplyDayRewardAmount: 0,
  borrowDayRewardAmount: 1149.557089285714,
  vSUISupplyDayRewardAmount: 42742.30685785713,
  NAVXSupplyDayRewardAmount: 11876.190476190466,
  startAt: 1707735600000, // 2024-02-12 19:00:00
  endAt: 1708340400000, // 2024-02-19 19:00:00
}

export const ENOKI_API_KEY = 'enoki_apikey_654da380f79d94b3179873d6f804d3ce'
export const GOOGLE_CLIENT_ID = '842539309153-0qn3fg7a89es9focrftpf6qiak9vf1il.apps.googleusercontent.com'
export const BORROW_FEE = 0.003
export const BORROW_FEE_ADDRESS = '0x70b9b10704263cf53392849e33b1f5fd16005869b4198ed5524836bad1234ea2'

export const tokenTypes = [
  {
    name: PanelTabType.All,
  },
  {
    name: PanelTabType.Stablecoins,
    coinNames: new Set(['USDC', 'USDT', 'USDY', 'AUSD', 'wUSDC', 'FDUSD', 'BUCK', 'suiUSDT']),
  },
  {
    name: PanelTabType.MainAssets,
    coinNames: new Set(['SUI', 'suiETH', 'WETH', 'stBTC', 'WBTC', 'USDC', 'vSUI']),
  },
  {
    name: PanelTabType.DeFi,
    coinNames: new Set(['NAVX', 'CETUS', 'NS', 'DEEP', 'BLUE']),
  },
  {
    name: PanelTabType.LST,
    coinNames: new Set(['vSUI', 'haSUI', 'stBTC', 'stSUI']),
  },
]

export const hiddenWallets = ['Ethos Wallet', 'Backpack']
export const VOLO_UNSTAKE_FEE = 0.0005
