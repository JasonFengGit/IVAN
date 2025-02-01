import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import './overlaystyles.css';
import { Button } from './ui/button'
import { usePathname, useRouter } from 'next/navigation'

const Overlay = () => {
    const router = useRouter();

    return (
    <AlertDialog.Root open={true}>
        <AlertDialog.Portal>
        <AlertDialog.Overlay className="AlertDialogOverlay"/>
        <AlertDialog.Content className="AlertDialogContent" style={{backgroundColor:"#dfdfdd", padding:"20px"}}>
            <AlertDialog.Title className="" style={{color:"black", fontFamily:"DM Sans", fontWeight:"900",  fontSize:"18px"}}>You have fallen unconscious due to lack of health...</AlertDialog.Title>
            <AlertDialog.Description className="" style={{marginTop:"20px", color:"#222222", fontFamily:"DM Sans", fontWeight:"700",  fontSize:"14px", fontStyle:"italic"}}>
            Please come back tomorrow. Health refreshes everyday at 00:00 AM Pacific Time.
            </AlertDialog.Description>
            <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            
            <AlertDialog.Action asChild>
            <button
                style={{
                    display: 'inline-block',
                    cursor: "pointer",
                    fontSize: "20px",
                    borderRadius: "3px",
                    transition: "background-color 0.2s ease 0s, color 0.2s ease 0s",
                    marginTop:"10px",
                    fontFamily:"DM Sans",
                    fontWeight:"700",
                }}
                className={`py-2 px-4 text-center font-bold bg-[#013359] text-white`}
                onClick={() => router.push('/leaderboard')}>
                Leaderboard
                </button>
            </AlertDialog.Action>
            </div>
        </AlertDialog.Content>
        </AlertDialog.Portal>
    </AlertDialog.Root>
    );
};

export default Overlay;