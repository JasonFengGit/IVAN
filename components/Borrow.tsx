import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { SupplyBlock } from './navi/SupplyBlock'
import { useAllReserveData, useAssetsBorrow, useGetInitHealthFactor, useGetReserveData, useGetWalletBalance, useMarketInfo } from './navi/hooks/useContract'
import { BigNumber } from 'bignumber.js'
import { DashboardProvider } from '@/contexts/dashboardContext'
import { useEffect, useState } from 'react'
import { BorrowBlock } from './navi/BorrowBlock'


interface BorrowProps {
    coin: string;
    amount: string;
  }

function BorrowComp({ coin, amount }: BorrowProps) {
  const { run: runGetReserveData } = useGetReserveData({
      pollingInterval: 1000 * 60 * 1,
      pollingWhenHidden: false,
  })

  const { data: health, run: runGetInitHealthFactor } = useGetInitHealthFactor()
  const { data: walletBalance, run: runGetWalletBalance } = useGetWalletBalance()
  const {data: allReserveData,run: runGetAllReserveData, runAsync:runAsyncGetAllReserveData} = useAllReserveData()
  const [changeCount, setChangeCount] = useState(0);
  const {run: runGetMarketInfo} = useMarketInfo()
  const { data: assetsBorrowData, run: runGetAssetsBorrowData } = useAssetsBorrow()  


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
    <BorrowBlock assetsBorrowData={assetsBorrowData} allReserveData={allReserveData} onRefresh={handleRefresh} coinName={coin} amountI={amount}/>
  )
}

export function Borrow({ coin, amount }: BorrowProps) {
    return(
      <BorrowComp coin={coin} amount={amount}></BorrowComp>)
}