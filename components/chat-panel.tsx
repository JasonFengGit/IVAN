import * as React from 'react'
import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconShare, IconStop } from '@/components/ui/icons'
import { useAllReserveData, useGetIncentiveApy, useGetWalletBalance, useMarketInfo } from './navi/hooks/useContract'
import { useMemo } from 'react'
import { fromRateWei, getIncentiveApyInfo } from '@/utils'
import { OptionType } from '@/utils/constants'
import { useGlobalData } from './navi/hooks/useGlobaldata'
import BigNumber from 'bignumber.js'
import { useDashboardContext } from './navi/contexts/dashboardContext'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string
  title?: string
}

const renderHealth = (health) => {
  if (!health) {
    return '--'
  }
  if (health && fromRateWei(health).gt(1000)) {
    return '∞'
  }
  return fromRateWei(health).decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
}

export const Rate_Decimals = 27;
export function fromRate(rate: bigint | number | string | BigNumber, decimal = 3) {
  if (!rate) return "0.00";
  return new BigNumber(rate.toString())
    .shiftedBy(-1 * Rate_Decimals)
    .multipliedBy(100)
    .decimalPlaces(decimal, BigNumber.ROUND_DOWN)
    .toFixed(decimal);
}

function formatPrice(price: bigint | number | string | BigNumber, decimals = 2) {
  if (!price) return 0
  return new BigNumber(price.toString()).decimalPlaces(decimals, BigNumber.ROUND_DOWN).toFormat()
}

function formatData(data, incentiveSupplyApyData, incentiveBorrowApyData, globalData, marketInfo, health) {
  const coinNames = ["SUI", "vSUI", "NAVX", "haSUI", "USDT"];

  // Function to convert Wei values to normal numbers with 2 decimal places
  function formatAmount(amount: string | number, decimals = 9): string {
    const value = parseFloat(amount.toString()) / Math.pow(10, decimals);
    return (Math.floor(value * 100) / 100).toFixed(2); // Floor to 2 decimal places
  }

  let walletBalances: string[] = [];
  let supplied: string[] = [];
  let borrowed: string[] = [];
  let prices: string[] = [];
  let supplyApys: string[] = [];
  let borrowApys: string[] = [];

  for (const coinName of coinNames) {
    // Find the corresponding object in the dataset
    const coinData = data.find((entry) => entry.coinName === coinName);

    if (coinData) {
      const decimals = coinData.coinMetaData?.decimals || 9;
      let price = coinData.coinPrice ? parseFloat(coinData.coinPrice).toFixed(3) : "0.000"; // Price formatted to 3 decimals

      if (coinName === "USDT") {
        price = "1.000"; // Ensure USDT is always 1.000
      }

      // Retrieve APY details
      const { vaultApr, boostedApr, rewardCoin, apy, voloApy, stakingYieldApy } =
        getIncentiveApyInfo(coinData, incentiveSupplyApyData, globalData, true) || {};
      const {
        vaultApr: borrowVaultApr,
        boostedApr: borrowBoostedApr,
        rewardCoin: borrowRewardCoin,
        apy: borrowApy,
        voloApy: borrowVoloApy,
      } = getIncentiveApyInfo(coinData, incentiveBorrowApyData, globalData, false) || {};
      
      // Determine Supply APY
      let supplyApy;
      if (rewardCoin) {
        supplyApy = `${apy}%`; // Use incentive APY directly with '%'
      } else {
        supplyApy = `${fromRate(coinData.current_supply_rate)}%`; // Convert using fromRate and append '%'
      }

      // Determine Borrow APY
      let borrowApyFinal;
      if (borrowBoostedApr) {
        borrowApyFinal = new BigNumber(borrowVaultApr || 0)
          .minus(borrowBoostedApr || 0)
          .minus(borrowVoloApy || 0)
          .decimalPlaces(3, BigNumber.ROUND_DOWN)
          .toFixed(3);
      } else {
        borrowApyFinal = fromRate(coinData.current_borrow_rate); // Convert using fromRate
      }

      borrowApyFinal = `${borrowApyFinal}%`; // Append '%' to Borrow APY

      // Push formatted values into arrays
      walletBalances.push(`${coinName}:${formatAmount(coinData.walletBalance, decimals)}`);
      supplied.push(`${coinName}:${formatAmount(coinData.supplyAmount, decimals)}`);
      borrowed.push(`${coinName}:${formatAmount(coinData.borrowAmount, decimals)}`);
      prices.push(`${coinName}:${price}`);
      supplyApys.push(`${coinName}:${supplyApy}`);
      borrowApys.push(`${coinName}:${borrowApyFinal}`);
    } else {
      // Handle missing data
      walletBalances.push(`${coinName}:`);
      supplied.push(`${coinName}:`);
      borrowed.push(`${coinName}:`);
      prices.push(`${coinName}:`);
      supplyApys.push(`${coinName}:`);
      borrowApys.push(`${coinName}:`);
    }
  }

  // Extract marketInfo values
  const totalSupplied = marketInfo ? formatPrice(marketInfo?.totalSuppliedPrice) : "--";
  const totalBorrowed = marketInfo ? formatPrice(marketInfo?.totalBorrowedPrice) : "--";
  const healthFactor = renderHealth(health)
  const collateralUtilization = marketInfo
    ? new BigNumber(marketInfo?.totalBorrowedPrice)
        .dividedBy(marketInfo?.collateralPrice)
        .multipliedBy(100)
        .decimalPlaces(2, BigNumber.ROUND_DOWN)
        .toFixed(2) + "%"
    : "--";
  const netApy = marketInfo ? `${marketInfo?.munisApy.multipliedBy(100).toFixed(2)}%` : "--";

  return `\n[Wallet Balance (Not including Supplied)]: ${walletBalances.join(", ")} ;\n
[Supplied]: ${supplied.join(", ")} ;\n
[Borrowed]: ${borrowed.join(", ")} ;\n
[Price]: ${prices.join(", ")} ;\n
[Supply APY]: ${supplyApys.join(", ")} ;\n
[Borrow APY]: ${borrowApys.join(", ")} ;\n
[NAVI Portfolio]: Total Supplied: $${totalSupplied}, Total Borrowed: $${totalBorrowed}, Health Factor: ${healthFactor}, Collateral Utilization: ${collateralUtilization}, Net APY: ${netApy} ;`;
}



export function ChatPanel({
  id,
  title,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages
}: ChatPanelProps) {
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const { data: marketInfo } = useMarketInfo()
  const { health } = useDashboardContext()

  //console.log(walletBalance)
  const {data: allReserveData,run: runGetAllReserveData, runAsync:runAsyncGetAllReserveData} = useAllReserveData()
  const { data: incentiveSupplyApyData } = useGetIncentiveApy(OptionType.Supply)
  const { data: incentiveBorrowApyData } = useGetIncentiveApy(OptionType.Borrow)
  const globalData = useGlobalData()

  const keyData = useMemo(() => {
    if (!allReserveData) return []

    return allReserveData
      .filter((item)=>['SUI', 'vSUI', 'NAVX', 'haSUI', 'USDT'].includes(item.coinName))
      
  }, [allReserveData])
  //console.log(formatData(keyData, incentiveSupplyApyData, incentiveBorrowApyData, globalData))

  
  return (
    <div style={{zIndex:999}} className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        
        <div className="px-4 py-2 space-y-4 bg-background md:py-4">
          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value + `@@@@@SYSTEM MESSAGE: ${formatData(keyData, incentiveSupplyApyData, incentiveBorrowApyData, globalData, marketInfo, health)}@@@@@ DO NOT THINK, GIVE RESPONSE DIRECTLY. DO NOT ASK THE USER IF THEY WANT TO PROCEED OR NOT. ONLY GIVE ONE TOOL AT A TIME.`,
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}