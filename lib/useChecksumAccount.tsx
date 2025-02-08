import { useCurrentAccount } from '@mysten/dapp-kit';

const useSUIWallet = () => {
    const account = useCurrentAccount();

    // Convert the address to checksum format if it exists
    const checksumAddress = account ? account.address : null;
    
    const accPublicKey = account ? account.publicKey : null;
    const byteArray = accPublicKey ? new Uint8Array(Object.values(accPublicKey)):null;
    const publicKey = byteArray ? btoa(String.fromCharCode(...byteArray)): null;
    const isDisconnected = account ? false : true;
    const isConnecting = false;

    return {
        address: checksumAddress,
        publicKey: publicKey,
        isConnecting: isConnecting,
        isDisconnected: isDisconnected
    };
};

export default useSUIWallet;
