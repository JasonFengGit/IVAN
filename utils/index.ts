import { BigNumber } from 'bignumber.js'
import { Rate_Decimals } from '@/utils/constants'
import { CoinMetaDatas, Coins } from '@/sui/config'
import { formatSuiAddress } from '@/sui/action'
export const ZeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * small to Account
 * @returns 0xffff...xxxx
 */
export function toSmallAddr(str: string | undefined, start = 6, end = 4) {
  if (!str || str.length <= 10) return str || ''
  return `${str?.substr(0, start)}...${str?.substr(str?.length - end, end)}`
}

export function toThousands(num: number | string, options?: any): string {
  return Number(num)?.toLocaleString('en', options)
}

export function parseAmount(amount: string, coinDecimals: number) {
  try {
    return BigInt(new BigNumber(amount).shiftedBy(coinDecimals).integerValue().toString())
  } catch (e) {
    return BigInt(0)
  }
}

export function toHEX(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

export function formatAmountParts(amount?: BigNumber | bigint | number | string | null, decimals?: number) {
  if (typeof amount === 'undefined' || amount === null) {
    return ['--']
  }

  let postfix = ''
  let bn = new BigNumber(amount.toString())

  if (decimals) {
    bn = bn.shiftedBy(-1 * decimals)
  }

  if (bn.gte(1_000_000_000)) {
    bn = bn.shiftedBy(-9)
    postfix = 'B'
  } else if (bn.gte(1_000_000)) {
    bn = bn.shiftedBy(-6)
    postfix = 'M'
  } else if (bn.gte(10_000)) {
    bn = bn.shiftedBy(-3)
    postfix = 'K'
  }

  if (bn.gte(1)) {
    bn = bn.decimalPlaces(2, BigNumber.ROUND_DOWN)
  }

  if (bn.gt(0) && bn.lt(1)) {
    return [bn.decimalPlaces(7, BigNumber.ROUND_DOWN).toFormat(), postfix]
  }

  return [bn.toFormat(), postfix]
}

export function formatAmount(...args: Parameters<typeof formatAmountParts>) {
  return formatAmountParts(...args)
    .filter(Boolean)
    .join('')
}

export function formatBalance(balance: bigint | number | string | BigNumber, name: string, decimals: number) {
  if (balance === undefined || name === undefined || decimals === undefined) return 0
  const bn = new BigNumber(balance.toString()).shiftedBy(-1 * decimals)
  if (['BTC', 'ETH', 'WBTC', 'WETH', 'stBTC'].includes(name)) {
    return bn.decimalPlaces(7, BigNumber.ROUND_DOWN).toFormat()
  }
  return bn.decimalPlaces(2, BigNumber.ROUND_DOWN).toFormat()
}

export function formatCoin(balance: bigint | number | string | BigNumber, name: string, decimals: number) {
  if (balance === undefined || name === undefined || decimals === undefined) return new BigNumber(0)
  const bn = new BigNumber(balance.toString()).shiftedBy(-1 * decimals)
  if (['BTC', 'ETH', 'WBTC', 'WETH', 'stBTC'].includes(name)) {
    return bn.decimalPlaces(7, BigNumber.ROUND_DOWN)
  }
  return bn.decimalPlaces(2, BigNumber.ROUND_DOWN)
}

export function formatDecimalPlaces(
  balance: bigint | number | string | BigNumber,
  decimalPlaces: number,
  decimals = 0,
) {
  if (balance && decimalPlaces) {
    return new BigNumber(balance.toString()).shiftedBy(decimals).decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN)
  }
  return new BigNumber(0)
}

export function isBalanceGtZero(balance: bigint | number | string | BigNumber, name: string, decimals: number) {
  if (balance === undefined || balance === null || name === undefined || decimals === undefined) {
    return false
  }
  const bn = new BigNumber(balance.toString()).shiftedBy(-1 * decimals)
  if (['BTC', 'ETH', 'WBTC', 'WETH', 'stBTC'].includes(name)) {
    return bn.decimalPlaces(7, BigNumber.ROUND_DOWN).gt(0)
  }
  return bn.decimalPlaces(2, BigNumber.ROUND_DOWN).gt(0)
}

export function isValueGtZero(value: bigint | number | string | BigNumber, decimals: number) {
  if (value && decimals) {
    return new BigNumber(value.toString()).shiftedBy(-1 * decimals).gt(0)
  }
}

export function formatPrice(price: bigint | number | string | BigNumber, decimals = 2) {
  if (!price) return 0
  return new BigNumber(price.toString()).decimalPlaces(decimals, BigNumber.ROUND_DOWN).toFormat()
}

export function calculatePrice(balance: bigint | number | string | BigNumber, price: number, decimals: number) {
  return balance && price && decimals
    ? new BigNumber(balance.toString()).shiftedBy(-1 * decimals).multipliedBy(new BigNumber(price))
    : new BigNumber(0)
}

export function formWei(balance: bigint | number | string | BigNumber, decimals: number) {
  if (!balance || !decimals) return 0
  return new BigNumber(balance.toString()).shiftedBy(-1 * decimals).toNumber()
}

export function toWei(balance: bigint | number | string | BigNumber, decimals: number) {
  if (!balance || !decimals) return 0
  try {
    return new BigNumber(balance.toString()).shiftedBy(decimals).toNumber()
  } catch (e) {
    return 0
  }
}

export function calcPercent(
  amount1: bigint | number | string | BigNumber,
  amount2: bigint | number | string | BigNumber,
) {
  if (!amount1 || !amount2) {
    return 0
  }

  return new BigNumber(new BigNumber(amount1.toString()).dividedBy(new BigNumber(amount2.toString())))
    .multipliedBy(100)
    .toFixed(2)
}

export function fromRateWei(rate: bigint | number | string | BigNumber) {
  return rate ? new BigNumber(rate.toString()).shiftedBy(-1 * Rate_Decimals) : new BigNumber(0)
}

export function fromRate(rate: bigint | number | string | BigNumber, decimal = 2) {
  if (!rate) return '0.00'
  return new BigNumber(rate.toString())
    .shiftedBy(-1 * Rate_Decimals)
    .multipliedBy(100)
    .decimalPlaces(decimal, BigNumber.ROUND_DOWN)
    .toFixed(decimal)
}

export const renderHealthFactorColor = (healthFactor) => {
  if (Number(healthFactor) <= 1.2) {
    return '#FF7070'
  }
  if (Number(healthFactor) >= 2) {
    return '#0DC3A4'
  }
  return '#F4B731'
}

export function calculateRatePrice(balance: bigint | number | string | BigNumber, price: number) {
  return balance && price
    ? new BigNumber(balance.toString()).shiftedBy(-1 * Rate_Decimals).multipliedBy(new BigNumber(price))
    : new BigNumber(0)
}

// a * b =>  (a * b + ray / 2) / ray
export const rayMathMulIndex = (amount1, index) => {
  if (!Number(amount1) || !Number(index)) return new BigNumber(0)
  const ray = new BigNumber(1).shiftedBy(1 * Rate_Decimals)
  const halfRay = ray.multipliedBy(new BigNumber(0.5))
  return new BigNumber(amount1)
    .multipliedBy(new BigNumber(index))
    .plus(halfRay)
    .dividedBy(ray)
    .integerValue(BigNumber.ROUND_DOWN)
}

export const getEarnedInfo = (coinInfo, earnedsInfoData) => {
  const earnedsInfo = earnedsInfoData?.[coinInfo?.id]
  const vaultApr = new BigNumber(earnedsInfo?.supply_rate).decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
  const boostedApr = new BigNumber(earnedsInfo?.boosted).decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
  const rewardCoin = earnedsInfo?.rewardTokens
    ?.map((coinType) => CoinMetaDatas[formatSuiAddress(coinType)]['symbol'])
    .join(' ')
  const apy = new BigNumber(vaultApr).plus(boostedApr).decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
  return {
    vaultApr,
    boostedApr,
    rewardCoin,
    apy,
  }
}

export const getIncentiveApyInfo = (pool, incentiveApyDatas, globalData, isSupply) => {
  const vSUICoinType = Coins.vSUI.slice(2)
  let incentiveApyData = incentiveApyDatas?.find((item) => {
    return item.asset_id === pool?.id
  })
  if (!incentiveApyData && globalData.supplyIncentiveApy && isSupply) {
    incentiveApyData = globalData.supplyIncentiveApy.find((item) => {
      return item.asset_id === pool?.id
    })
  } else if (!incentiveApyData && globalData.borrowIncentiveApy && !isSupply) {
    incentiveApyData = globalData.borrowIncentiveApy.find((item) => {
      return item.asset_id === pool?.id
    })
  }
  const rewardPools = isSupply ? globalData?.supplyRewardPools?.[0]?.pools : globalData?.borrowRewardPools?.[0]?.pools
  if (!incentiveApyData) return
  const vaultApr = isSupply
    ? BigNumber(fromRate(pool?.current_supply_rate, 3))
    : BigNumber(fromRate(pool?.current_borrow_rate, 3))
  const boostedApr = new BigNumber(incentiveApyData.apy)
    .shiftedBy(-1 * Rate_Decimals)
    .multipliedBy(100)
    .decimalPlaces(3, BigNumber.ROUND_DOWN)
  const rewardHasvSui = incentiveApyData.coin_types.includes(vSUICoinType)
  let voloApy = BigNumber(0)
  if (rewardHasvSui) {
    voloApy = boostedApr.multipliedBy(globalData?.volo?.apy || 0.026)
    if (incentiveApyData.coin_types.length > 1) {
      let voloValue = BigNumber(0)
      let totalValue = BigNumber(0)
      rewardPools?.forEach((item) => {
        const rewardPool = globalData?.reserveData?.find((pool) => {
          return pool.id === item.asset_id
        })
        const oracle = globalData?.oracleData?.[rewardPool?.oracle_id]
        if (rewardPool?.coin_type === vSUICoinType) {
          voloValue = voloValue.plus(BigNumber(item.total_supply).multipliedBy(oracle?.price || 0))
        }
        totalValue = totalValue.plus(BigNumber(item.total_supply).multipliedBy(oracle?.price || 0))
      })
      voloApy = boostedApr
        .multipliedBy(globalData?.volo?.apy || 0.026)
        .multipliedBy(voloValue.isEqualTo(0) ? voloValue : voloValue.div(totalValue))
    }
  }
  const rewardCoin = incentiveApyData?.coin_types
    ?.reduce((pre, cur) => {
      pre.push(formatSuiAddress(cur))
      return pre
    }, [])
    .join(' ')

  let apy = isSupply ? vaultApr.plus(boostedApr).plus(voloApy) : boostedApr.plus(voloApy)
  let stakingYieldApy = BigNumber(0)
  if (pool?.coinType === Coins.vSUI && isSupply) {
    stakingYieldApy = new BigNumber(globalData?.volo?.apy || 0).multipliedBy(100)
    apy = apy.plus(stakingYieldApy)
  }
  if (pool?.coinType === Coins.haSUI && isSupply) {
    stakingYieldApy = new BigNumber(globalData?.haedal?.apy || 0).multipliedBy(100)
    apy = apy.plus(stakingYieldApy)
  }
  if (pool?.coinType === Coins.stSUI && isSupply) {
    stakingYieldApy = new BigNumber(globalData?.stSui?.apy || 0)
    apy = apy.plus(stakingYieldApy)
  }

  return {
    vaultApr: vaultApr.toString(),
    boostedApr: boostedApr.toString(),
    rewardCoin,
    apy: apy.decimalPlaces(3, BigNumber.ROUND_DOWN).toFixed(3),
    voloApy: voloApy.decimalPlaces(3, BigNumber.ROUND_DOWN).toString(),
    stakingYieldApy: stakingYieldApy.decimalPlaces(3, BigNumber.ROUND_DOWN).toString(),
  }
}

export function amountToFormat(
  amount?: BigNumber | bigint | number | string | null,
  tokenDecimals?: number,
  decimalPlaces = 2,
) {
  if (typeof amount === 'undefined' || amount === null) {
    return '--'
  }

  let postfix = ''
  let bn = new BigNumber(amount.toString())

  if (tokenDecimals) {
    bn = bn.shiftedBy(-1 * tokenDecimals)
  }

  if (bn.gte(1_000_000_000)) {
    bn = bn.shiftedBy(-9)
    postfix = 'B'
  } else if (bn.gte(1_000_000)) {
    bn = bn.shiftedBy(-6)
    postfix = 'M'
  } else if (bn.gte(10_000)) {
    bn = bn.shiftedBy(-3)
    postfix = 'K'
  }

  bn = bn.decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN)

  return [bn.toFormat(), postfix].filter(Boolean).join('')
}

export function rankToPeople(rank, people) {
  if (typeof rank === 'undefined' || rank === null || typeof people === 'undefined' || people === null || rank === 0) {
    return '--'
  }
  const data = (rank / people) * 100

  if (data <= 0.5 && data !== 0) {
    return 'Top 0.5%'
  } else if (0.5 < data && data <= 1) {
    return '0.5%-1%'
  } else if (1 < data && data <= 1.5) {
    return '1%-1.5%'
  } else if (1.5 < data && data <= 5) {
    return '1.5%-5%'
  } else if (5 < data && data <= 10) {
    return '5%-10%'
  } else if (10 < data && data <= 15) {
    return '10%-15%'
  } else if (15 < data && data <= 20) {
    return '15%-20%'
  } else if (20 < data && data <= 25) {
    return '20%-25%'
  } else if (25 < data || data == 0) {
    return 'After 25%'
  }
}

export function parseJSON(str: string | null) {
  if (str === null) return null
  try {
    return JSON.parse(str)
  } catch (err) {
    return null
  }
}

export function numberWithCommas(value = 0) {
  let v = value.toString()
  const partIndex = v.indexOf('.')
  let part
  if (partIndex > -1) {
    part = v.slice(partIndex + 1)
    v = v.slice(0, partIndex)
  }
  return v.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (part ? `.${part}` : '')
}

export function removeNumberTailZero(value: string) {
  if (value.indexOf('.') > -1) {
    return value.replace(/(\.0+|0+)$/, '')
  }
  return value
}

export function migrateAmountRange(a: BigNumber, b: BigNumber, decimal: number) {
  let min: BigNumber, max: BigNumber
  if (a.isLessThan(b)) {
    min = a
    max = b
  } else {
    min = b
    max = a
  }
  if (max.isEqualTo(min)) {
    return numberWithCommas(BigNumber(Math.max(0, max.toNumber())).shiftedBy(-decimal).toNumber())
  }
  return `${numberWithCommas(
    BigNumber(Math.max(0, min.toNumber())).shiftedBy(-decimal).toNumber(),
  )} ~ ${numberWithCommas(BigNumber(Math.max(0, max.toNumber())).shiftedBy(-decimal).toNumber())}`
}

// export function keepSignificantDecimal(value: string | number | BigNumber) {
//   if (!value) return '0.00'
//   const val = new BigNumber(value)
//   if (val.gte(1)) {
//     return val.decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
//   } else {
//     const match = val.toString().match(/^-?0\.(0*[1-9]\d?)/)
//     return match ? match[0] : val.toString()
//   }
// }

export function keepSignificantDecimal(value: string | number | BigNumber) {
  if (!value) return '0.00'
  const val = new BigNumber(value)
  if (val.lt(0.001)) {
    return val.decimalPlaces(6).toString()
  } else if (val.lt(1)) {
    return val.decimalPlaces(3).toString()
  } else {
    return val.decimalPlaces(2).toString()
  }
}

export function clearUserLevelCache(address: string) {
  localStorage.removeItem(`${address}-useGetUserLevel`)
}
