'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import useChecksumAccount from '@/lib/useChecksumAccount'
import { useAllReserveData, useGetInitHealthFactor, useGetReserveData, useGetWalletBalance, useMarketInfo } from './navi/hooks/useContract'
import { SwapCoins } from './SwapCoins'
import { Supply } from './Supply'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
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
  
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
      //console.log(health)
  }, 5000); // Runs every 5 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const { address } = useChecksumAccount()

  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const [messageHistory, setMessageHistory] = useState<Message[]>([])

  const systemPrompt: Message = {
    id: "",
    content: 
    `DO NOT THINK, GIVE RESPONSE DIRECTLY. USE THE TOOLS DIRECTLY WITHOUT THINKING. THINK LESS. DO NOT THINK.
    DO NOT ASK THE USER IF THEY WANT TO PROCEED OR NOT, JUST LET THEM USE THE TOOL.
    You are IVAN, an AI for the SUI Ecosystem, powered by NAVI Protocol. NAVI Protocol introduction: NAVI is the ultimate liquidity protocol on SUI. NAVI offers lending, liquid staking, and DEX aggregator product.
    When the user say hello, introduce yourself and NAVI Protocol briefly, and provide the user options to Swap, Supply, and Borrow assets (explain each one).
    You can help users do actions including [Swap], [Supply], [Borrow], and check information including [SingleAsset], [AssetList], [Portfolio], which are all given as tools you can call:
    DO NOT ASK THE USER IF THEY WANT TO PROCEED OR NOT, JUST LET THEM USE THE TOOL.
    <SwapCoins
      from={fromName} 
      to={toName} 
      amount={amount}/> 
    <Supply coin={name} amount={amount}/>
    <Borrow coin={name} amount={amount}/>
    <SingleAsset coin={name}/> // display information for a single coin, including Price, Total Supply, Supply APY, Available to borrow, Borrow APY
    <Market/> // displays list of supported assets, can be seen as current market, show this for general information, including Price, Total Supply, Supply APY, Available to borrow, Borrow APY
    <Portfolio/> // user current portfolio on NAVI protocol

    When you want to use any of the above tools, explicitly write the component with proper parameters (if any) to show it to the user, parameters are all strings, use them with single quotes, example use:
    <Supply coin='SUI' amount='1'/>
    
    Even when using the tools, you should say something to explain or just give instructions.
    Your list of supported coins is: SUI, vSUI, haSUI, USDT, NAVX, anything beyond this list of supported assets is not supported and you should just provide a polite response, list the current supported assets, and say might be supported later.
    When users request is vague, like not specifying which tokens or token amount, you should ask a follow up to specify the question before providing the actions/information component. You can remind the amount of tokens the user currently has. Make sure the user has the amount they requested, if the amount they requested exceeds their balance, remind them and help them use the max amount they have.
    Use only one component at a time, if the user requested a complext actions chain, break it down one by one, and ask if the user want to continue for next action. make sure the actions is doable using only [Swap], [Supply], [Borrow].
    If the user requested something not possible, just simply reply with a polite response and say not supported at this moment.
    Note that the action need to be completed by the user themselves with the component, so do not say the action is complete or success.
    Always show <Portfolio/> when user ask for current portfolio, do not list all the information in SYSTEM MESSAGE, only write important information out if needed.
    Always show <SingleAsset coin={name}/> when user ask for any information of a specific coin, even if you have the information in SYSTEM MESSAGE already, provide the information alongside <SingleAsset coin={name}/>.
    When user ask for general market information, show <Market/> .
    If the user suggests an action that is not supported, such as repay or withdraw, guide them to NAVI's official website https://app.naviprotocol.io to continue the action.
    Only answer questions that is related to NAVI Protocol, SUI Ecosystem, Blockchain, and DeFi. Do NOT answer to questions that are irrelevant.
    `,
    role: 'system'
  }
  const testMessage: Message = {
    
      id: "",
      content: 
      `Supply my SUI
      `,
      role: 'user'
  }

  const testMessage2: Message = {
    
    id: "",
    content: 
    `Sure!
 <Supply coin='SUI' amount='100' show={false}/>

    `,
    role: 'assistant'
}
const testMessage3: Message = {
    
  id: "",
  content: 
  `Supply my SUI
  `,
  role: 'user'
}

const testMessage4: Message = {

id: "",
content: 
`Sure!
 <Supply coin='NAVX' amount='100'/>

`,
role: 'assistant'
}
const prevAddressRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevAddressRef.current !== null && address === null && messages.length > 1) {
      window.location.reload(); // Reload only if address changes from something to null
    }
    else{
      // get and load user data
      setMessageHistory([systemPrompt])
    }
    prevAddressRef.current = address;
  }, [address]);

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages:messageHistory,
      id,
      body: {
        id,
        previewToken
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      }
    })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length>1 ? (
          <>
            <ChatList messages={messages.slice(1,messages.length)} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <SwapCoins from='SUI' to='NAVX' amount='1' show={false}/>
      {/*<Supply coin="NAVX" amount="100"/> */}

      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
   
  )
}