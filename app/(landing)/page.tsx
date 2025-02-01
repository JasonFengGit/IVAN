'use client'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { HeaderWhite } from '@/components/header-white'
import { useAllReserveData, useGetInitHealthFactor, useGetReserveData, useGetWalletBalance, useMarketInfo } from '@/components/navi/hooks/useContract'
import { DashboardProvider } from '@/components/navi/contexts/dashboardContext'


const Index = () => {
  const id = nanoid()
  
  
  return <><HeaderWhite/><Chat id={id} /></>
}



export default function IndexPagePage() {
  return (
    <DashboardProvider>
      <Index />
    </DashboardProvider>
  )
}
