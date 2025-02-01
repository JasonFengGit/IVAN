'use client';

import * as React from 'react';


import { SessionProvider } from "next-auth/react";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux'
import store from '@/components/navi/store'
import { MuiThemeProvider } from '@/components/navi/themes';
import { Provider as NiceModalProvider, show } from '@ebay/nice-modal-react'

import { useEffect } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import 'reactflow/dist/style.css'
import '@notifi-network/notifi-react/dist/index.css'
import './notifi.css'
import './katex.css'

import { useGetInitHealthFactor, useGetOracleInfo } from '@/hooks/useContract'
import useConnectMSafe from '@/hooks/msafe/useConnectMSafe'
import { useCheckRpcNodes } from '@/services/rpc'

import { useNetWork } from '@/sui/hook'
import '@/services/i18n'
import { usePrepareGlobalData } from '@/hooks/useGlobaldata'
import { useActivities } from '@/hooks/useActivities'
import store2 from 'store2'
import { useInitAggregator } from '@/hooks/useInitAggregator'
import { ToastContainer } from 'react-toastify';
import { DashboardProvider } from '@/components/navi/contexts/dashboardContext';
import { useMixpanel } from '@/components/navi/hooks/useMixpanel';

const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});
const queryClient = new QueryClient();


const GlobalHooks = () => {
  useCheckRpcNodes()
  usePrepareGlobalData()
  useActivities()
  useGetOracleInfo({ pollingInterval: 1000 * 60 * 1.5, pollingWhenHidden: false })
  useConnectMSafe()
  useMixpanel()
  const account = useNetWork()
  useEffect(() => {
    store.dispatch({
      type: 'user/setAddress',
      payload: {
        address: account?.address,
      },
    })
  }, [account?.address])
  useEffect(() => {
    const migrateSlippage = store2.get('migrate-slippage')
    if (migrateSlippage) {
      store.dispatch({
        type: 'appModule/setMigrateSlippage',
        payload: migrateSlippage,
      })
    }
  }, [])
  useInitAggregator()
  return null
}

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <>
      <Provider store={store}>
        <MuiThemeProvider>
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
              <WalletProvider autoConnect={true} stashedWallet={{
                name: 'IVAN AI',
              }}>
                <GlobalHooks />
                <DashboardProvider>
                <ToastContainer />
                <NiceModalProvider>
                  {mounted && children}
                </NiceModalProvider>
                </DashboardProvider>
              </WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </MuiThemeProvider>
      </Provider>
    </>

  );
}

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};