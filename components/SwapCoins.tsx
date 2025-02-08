import React, { useEffect, useRef, useState } from 'react';
import { SwapPanelClient } from '@/components/swap'
import { SwapPanel } from './swap/widgets/swap-panel/component'
import { useInitAggregator } from './navi/hooks/useInitAggregator'
import { Coins } from './navi/sui/config';
import { show } from '@ebay/nice-modal-react';
import ConnectWalletDialog from './navi/components/common/ConnectWalletDialog';
import { useNetWork } from './navi/sui/hook';
import { useSignTransaction } from '@mysten/dapp-kit';
import useSUIWallet from '@/lib/useSUIWallet';
import './swap.css'
interface SwapPanelProps {
    from: string;
    to: string;
    amount: string;
    show?: boolean;
}


export const SwapCoins: React.FC<SwapPanelProps> = ({from, to, amount, show = true}) => {
    const [swapPanelClient, setSwapPanelClient] = useState<SwapPanelClient | undefined>();
    const { address } = useNetWork()
    const { mutateAsync: signTransaction } = useSignTransaction()
    

    useEffect(() => {
        if(signTransaction){
        const tempSign = async (tx) => {
            const resp = await signTransaction({
              transaction: tx,
            })
            return {
              signature: resp.signature,
              bytes: resp.bytes,
            }
          }
         const newSwapCli = SwapPanelClient.getNewInstance(tempSign)
         setSwapPanelClient(newSwapCli)
        }
      }, [signTransaction])
      
    
    useEffect(() => {
        if (address && swapPanelClient) {
        swapPanelClient.setTokenFrom(Coins.SUI)
        swapPanelClient.setTokenTo(Coins.NAVX)
        swapPanelClient.events.on('clickConnect', () => {
            
        })
        swapPanelClient.setUserAddress(address)
        
        }

    }, [address, swapPanelClient])

    
    
    useEffect(() => {
        const swapPanel = document.querySelector('navi-swap-panel') as HTMLElement;
        if(swapPanel){
            document.getElementById('swap-panel-container')?.appendChild(swapPanel);
        }
        //swapPanelClient.show()
        if(address && swapPanelClient){swapPanelClient.setUserAddress(address)}
        //swapPanelClient.show()
        
    }, [address, swapPanelClient]);

    useEffect(()=>{
        if (amount&& swapPanelClient)
        swapPanelClient.setTokenFromAmount(amount)
        //swapPanelClient.show()
    },[amount, swapPanelClient])

    useEffect(()=>{
        if (from && swapPanelClient){
            swapPanelClient.setTokenFrom(Coins[from])
        }
    },[from, swapPanelClient])

    useEffect(()=>{
        if (to && swapPanelClient){
            swapPanelClient.setTokenTo(Coins[to])
        }
    },[to, swapPanelClient])


    return <div style={{display: show? "block": "none", height:"700px"}} id="swap-panel-container"></div>
};