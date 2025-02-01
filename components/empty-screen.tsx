import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'
import { useAllReserveData, useGetInitHealthFactor, useGetReserveData, useGetWalletBalance, useMarketInfo } from './navi/hooks/useContract'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { Supply } from './Supply'
import { SwapCoins } from './SwapCoins'
import { Borrow } from './Borrow'
import { Portfolio } from './Portfolio'
import { Market } from './Market'
import { SingleAsset } from './SingleAsset'
import { ConnectModal } from '@mysten/dapp-kit'
import useChecksumAccount from '@/lib/useChecksumAccount'
//import SwapBlock from './navi/SwapBlock'

const exampleMessages = [
  {
    heading: 'Swap',
    message: `Help me swap 1 SUI to NAVX`
  },
  {
    heading: 'Supply',
    message: 'I want to supply 1 SUI and earn APY'
  },
  {
    heading: 'Portfolio',
    message: `Show my portfolio on NAVI protocol`
  }
]

function EmptyScreenC({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  const {address} = useChecksumAccount()
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{marginTop:"5%"}} className="mx-auto max-w-2xl px-4">
      <div style={{borderRadius:"15px"}} className="bg-background p-8 shadow-[0_0_20px_10px_rgba(13,195,164,0.5)]" >
        <h1 style={{color:"#DDDDDD", fontSize:"24px"}} className="mb-2 text-lg font-semibold">
          <span style={{color:"#0DC3A4", fontWeight:"700"}}>IVAN AI</span>
        </h1>
        <p style={{color:"#DDDDDD", fontSize:"20px"}}  className="mb-2 leading-normal text-muted-foreground">
        Your smart AI gateway to SUI Ecosystem
        </p>
        
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => {
                if(address){
                  setInput(message.message)
                }
                else{
                  setOpen(true)
                }
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
      <ConnectModal
			trigger={
        <button disabled={!!address}> {address ? '' : ''}</button>
      }
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
		/>

      {/*<Supply coin="SUI" amount={'1'}/>
      <Borrow coin="vSUI" amount={'1'}/>
      <Portfolio />
      <SingleAsset coin='NAVX' />
      <Supply coin='SUI' amount='1' show={false}/>
      <Portfolio/>*/}
      <Supply coin='SUI' amount='1' show={false}/>



    </div>
  )
}

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return <EmptyScreenC setInput={setInput}></EmptyScreenC>
  
}