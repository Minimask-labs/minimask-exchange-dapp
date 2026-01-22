'use client';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';
import { ConnectedWallet } from '@/types';
import { formatUnits } from 'viem';
import { useWallet as useAleoWallet } from '@provablehq/aleo-wallet-adaptor-react';

export const useWallets = () => {
    // Access all aleo wallets state and methods
  
    const {
      connected: aleoConnected, // boolean - whether wallet is connected
      connecting: aleoConnecting, // boolean - whether wallet is connecting
      disconnecting: aleoDisconnecting, // boolean - whether wallet is disconnecting
      reconnecting: aleoReconnecting, // boolean - whether wallet is reconnecting
      address: aleoAddress, // string | null - connected wallet address
      network: aleoNetwork, // Network | null - current network
      wallet: aleoWallet, // Wallet | null - connected wallet adapter
      autoConnect: aleoAutoConnect, // boolean - autoConnect setting
      switchNetwork: aleoSwitchNetwork, // (network: Network) => Promise<boolean>
      disconnect: aleoDisconnect ,// () => Promise<void>
      wallets: aleoWallets, // Wallet[] - list of available wallet adapters
      // ... other methods
    } =  useAleoWallet();
  
  // EVM wallet state
  const {
    address: evmAddress,
    isConnected: isEvmConnected,
    chain
  } = useAccount();
  const { data: evmBalance } = useBalance({ address: evmAddress });
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet state
  const {
    publicKey: solanaPublicKey,
    connected: isSolanaConnected,
    disconnect: disconnectSolana,
    wallet: solanaWallet
  } = useWallet();
  const { connection } = useConnection();
  const [solanaBalance, setSolanaBalance] = useState<string | null>(null);
  // const [aleoBalance, setAleoBalance] = useState<string | null>(null);
  // Fetch Aleo balance
  // useEffect(() => {
  //   const fetchAleoBalance = async () => {
  //     if (aleoAddress) {
  //       try {
  //         // Implement Aleo balance fetching logic here
  //         // For example:
  //         // const balance = await aleoWallet.getBalance(aleoAddress);
  //         // setAleoBalance(balance);
  //       } catch (error) {
  //         console.error('Failed to fetch Aleo balance:', error);
  //         // setAleoBalance(null);
  //       }
  //     } else {
  //       // setAleoBalance(null);
  //     }
  //   }
  // })
  // Fetch Solana balance
  useEffect(() => {
    const fetchSolanaBalance = async () => {
      if (solanaPublicKey && connection) {
        try {
          const balance = await connection.getBalance(solanaPublicKey);
          setSolanaBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
        } catch (error) {
          console.error('Failed to fetch Solana balance:', error);
          setSolanaBalance(null);
        }
      } else {
        setSolanaBalance(null);
      }
    };

    fetchSolanaBalance();
  }, [solanaPublicKey, connection]);

  // Build connected wallets array
  const connectedWallets: ConnectedWallet[] = [];

  if (isEvmConnected && evmAddress) {
    const formattedBalance = evmBalance
      ? parseFloat(formatUnits(evmBalance.value, evmBalance.decimals)).toFixed(
          4
        )
      : undefined;

    connectedWallets.push({
      address: evmAddress,
      type: 'evm',
      chainId: chain?.id,
      balance: formattedBalance
        ? `${formattedBalance} ${evmBalance?.symbol}`
        : undefined,
      name: chain?.name || 'Ethereum',
      icon: `https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/${chain?.name?.toLowerCase() || 'ethereum'}.svg`
    });
  }

  if (isSolanaConnected && solanaPublicKey) {
    connectedWallets.push({
      address: solanaPublicKey.toBase58(),
      type: 'solana',
      chainId: 'solana',
      balance: solanaBalance ? `${solanaBalance} SOL` : undefined,
      name: solanaWallet?.adapter.name || 'Solana',
      icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg'
    });
  }
if (aleoConnected && aleoAddress) {
    connectedWallets.push({
      address: aleoAddress,
      type: 'aleo',
      chainId: 'aleo',
      balance: aleoWallet ? `0 ALEO` : undefined, // Uncomment and set aleoBalance if fetched
      name: aleoWallet?.adapter.name || 'Aleo',
      icon: aleoWallet?.adapter?.icon
    });
}
console.log('Aleo Connected:', aleoConnected, aleoWallets, aleoAddress, 'Aleo Address:', aleoWallet);

  const isAnyWalletConnected = isEvmConnected || isSolanaConnected || aleoConnected;

  const disconnectWallet = useCallback(
    (address: string) => {
      if (evmAddress === address) {
        disconnectEvm();
      } else if (solanaPublicKey?.toBase58() === address) {
        disconnectSolana();
      }else if (aleoAddress === address) {
        aleoDisconnect();
      }else {
        console.warn('No connected wallet found with address:', address);
      }
    },
    [evmAddress, solanaPublicKey, disconnectEvm, disconnectSolana,aleoDisconnect,aleoAddress]
  );

  return {
    connectedWallets,
    isAnyWalletConnected,
    isEvmConnected,
    isSolanaConnected,
    aleoConnected,
    evmAddress,
    solanaAddress: solanaPublicKey?.toBase58(),
    disconnectWallet,
    disconnectEvm,
    disconnectSolana
  };
};
