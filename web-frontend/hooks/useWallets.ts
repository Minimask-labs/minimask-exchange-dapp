'use client';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';
import { ConnectedWallet } from '@/types';
import { formatUnits } from 'viem';
import { useWallet as useAleoWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { AleoNetworkClient } from '@provablehq/sdk';
export const useWallets = () => {
  // Access all aleo wallets state and methods

  const {
    connected: aleoConnected, // boolean - whether wallet is connected
    address: aleoAddress, // string | null - connected wallet address
    wallet: aleoWallet, // Wallet | null - connected wallet adapter
    disconnect: aleoDisconnect, // () => Promise<void>
    network: aleoNetwork

    // ... other methods
  } = useAleoWallet();

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
  const [aleoBalance, setAleoBalance] = useState<string | null>(null);
  const [aleoTokenList, setAleoTokenList] = useState<{ data: any[] } | null>(
    null
  );
 
     const networkClient = new AleoNetworkClient(
      'https://api.explorer.provable.com/v2'
    );
  const getPublicTokenBalance = useCallback(
    async (programId: string, address: string) => {
      if (address == null) return '0';
      try {
        const result =
          (
            await networkClient.getProgramMappingValue(
              programId,
              'account',
              address
            )
          )?.replace(/u\d+(?:\.public)?/g, '') ?? '0';
        const publicBalance = BigInt(result);
        console.log('publicBalance', publicBalance);
        const balance = (Number(publicBalance) / 1_000_000).toFixed(6);
        console.log('balance', balance);
        return balance;
      } catch (e) {
        console.error(e);
        return '0';
      }
    },
    []
  );
  
  // const isLoadingAleoTokenList = useRef(false);
  // Fetch Aleo token list
  const fetchAleoTokenList = useCallback(async () => {
    // if (!aleoAddress) return;
    const network = aleoNetwork === null ? 'testnet' : aleoNetwork;
    try {
      const response = await fetch(
        `https://api.explorer.provable.com/v2/${network}/tokens`
      );
      const data = await response.json();
      setAleoTokenList(data);
    } catch (error) {
      console.error('Failed to fetch Aleo token list:', error);
      setAleoTokenList(null);
    }
  }, [aleoNetwork]);
  // https://api.provable.com/v2/mainnet/transactions/address/:address

  // Fetch Aleo balance
  useEffect(() => {
    const fetchAleoBalance = async () => {
      if (aleoAddress) {
        try {
          // Implement Aleo balance fetching logic here
          // For example:
          const networkClient = new AleoNetworkClient(
            'https://api.provable.com/v2'
          );

          // Get public balance
          const publicBalanceString =
            (
              await networkClient.getProgramMappingValue(
                'credits.aleo',
                'account',
                aleoAddress
              )
            )?.replace(/u\d+(?:\.public)?/g, '') ?? '0';
          const publicBalance = BigInt(publicBalanceString);
          // console.log('Aleo Public Balance:', publicBalance);
          // Convert to readable format (Aleo has 6 decimals)
          const balanceInAleo = (Number(publicBalance) / 1_000_000).toFixed(6);
          setAleoBalance(balanceInAleo);

          // console.log('Aleo Public Balance:', balanceInAleo, 'ALEO');
        } catch (error) {
          console.error('Failed to fetch Aleo balance:', error);
          setAleoBalance(null);
        }
      } else {
        setAleoBalance(null);
      }
    };
    fetchAleoBalance();
  }, [aleoAddress]);
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
      balance: aleoBalance ? `${aleoBalance} ALEO` : undefined, // Uncomment and set aleoBalance if fetched
      name: aleoWallet?.adapter.name || 'Aleo',
      icon: aleoWallet?.adapter?.icon
    });
  }
  // console.log('Aleo Connected:', aleoConnected, aleoWallets, aleoAddress, 'Aleo Address:', aleoWallet);

  const isAnyWalletConnected =
    isEvmConnected || isSolanaConnected || aleoConnected;

  const disconnectWallet = useCallback(
    (address: string) => {
      if (evmAddress === address) {
        disconnectEvm();
      } else if (solanaPublicKey?.toBase58() === address) {
        disconnectSolana();
      } else if (aleoAddress === address) {
        aleoDisconnect();
      } else {
        console.warn('No connected wallet found with address:', address);
      }
    },
    [
      evmAddress,
      solanaPublicKey,
      disconnectEvm,
      disconnectSolana,
      aleoDisconnect,
      aleoAddress
    ]
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
    disconnectSolana,
    aleoTokenList,
    getPublicTokenBalance,
    fetchAleoTokenList,
    aleoAddress
  };
};
