import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { SupplyBlock } from './navi/SupplyBlock'
import { useAllReserveData, useGetInitHealthFactor, useGetReserveData, useGetWalletBalance, useMarketInfo } from './navi/hooks/useContract'
import { BigNumber } from 'bignumber.js'
import { DashboardProvider } from '@/contexts/dashboardContext'
import { useEffect, useState } from 'react'


interface SupplyProps {
    coin: string;
    amount: string;
    show?: boolean
  }

function SupplyComp({ coin, amount, show=true }: SupplyProps) {
  const { run: runGetReserveData } = useGetReserveData({
      pollingInterval: 1000 * 60 * 1,
      pollingWhenHidden: false,
  })

  const { data: health, run: runGetInitHealthFactor } = useGetInitHealthFactor()
  const { data: walletBalance, run: runGetWalletBalance } = useGetWalletBalance()
  const {data: allReserveData,run: runGetAllReserveData, runAsync:runAsyncGetAllReserveData} = useAllReserveData()
  const [changeCount, setChangeCount] = useState(0);
  const {run: runGetMarketInfo} = useMarketInfo()

  //console.log(walletBalance)
  const handleRefresh = () => {
      //console.log("refreshing", health)
      runGetReserveData()
      runGetWalletBalance()
      runGetInitHealthFactor()
      runGetAllReserveData()
      runGetMarketInfo()
      setChangeCount(changeCount+1)
  }
    
  return (
    <div style={show?{}:{display: 'none'}}>
    <SupplyBlock onRefresh={handleRefresh} coinName={coin} amountI={amount} changeCount={changeCount}/>
    </div>
  )
}

export function Supply({ coin, amount, show=true }: SupplyProps) {
    return(
      <SupplyComp coin={coin} amount={amount} show={show}></SupplyComp>
  )
}