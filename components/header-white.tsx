'use client'
import * as React from 'react'
import { ConnectButton, useAutoConnectWallet } from '@mysten/dapp-kit';

export function HeaderWhite() {


  return (
    <header style={{backgroundColor:"#000000"}} className="sticky top-0 z-50 flex items-center justify-between w-full h-20 px-4">
      <div className="flex items-center">
          {/*<a style={{cursor:"pointer"}} onClick={()=>{router.push("/")}}><img width={"55px"} style={{borderRadius:"4px"}} src='/logo.png'></img></a>*/}
          <h1 style={{color:"#0DC3A4", fontWeight:"700", fontSize:"24px", marginLeft:"10px"}}>IVAN AI</h1>
      </div>
      <div className="flex items-center justify-end space-x-2">

         <a
          onClick={()=>{window.open("https://naviprotocol.io")}}
          className="hidden md:block hover:bg-tfr hover:text-white text-white font-bold py-0 px-3"
          rel="noopener noreferrer"
          style={{cursor:"pointer", fontSize:"16px",marginRight:"5px", fontWeight:700, borderRadius:"3px", transition: "background-color 0.2s ease, color 0.2s ease"}}  
        >
        powered by <span style={{color:"#0DC3A4"}}>NAVI Protocol</span>
        </a>
        <ConnectButton/>
        
      </div>
    </header>
  )
}
