import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useAleoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect, useCallback } from "react";
import { ConnectedWallet } from "@/types";
import { formatUnits } from "viem";

export const useWallets = () => {
  // EVM wallet state
  const { address: evmAddress, isConnected: isEvmConnected, chain } = useAccount();
  const { data: evmBalance } = useBalance({ address: evmAddress });
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet state
  const { publicKey: solanaPublicKey, connected: isSolanaConnected, disconnect: disconnectSolana, wallet: solanaWallet } = useWallet();
  const { connection } = useConnection();
  const [solanaBalance, setSolanaBalance] = useState<string | null>(null);

  // Aleo wallet state
  const { publicKey: aleoPublicKey, connected: isAleoConnected, disconnect: disconnectAleo, wallet: aleoWallet } = useAleoWalletAdapter();
  const [aleoBalance, setAleoBalance] = useState<string | null>(null);

  // Fetch Solana balance
  useEffect(() => {
    const fetchSolanaBalance = async () => {
      if (solanaPublicKey && connection) {
        try {
          const balance = await connection.getBalance(solanaPublicKey);
          setSolanaBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
        } catch (error) {
          console.error("Failed to fetch Solana balance:", error);
          setSolanaBalance(null);
        }
      } else {
        setSolanaBalance(null);
      }
    };

    fetchSolanaBalance();
  }, [solanaPublicKey, connection]);

  // Fetch Aleo balance (mock for now - would use SDK in production)
  useEffect(() => {
    const fetchAleoBalance = async () => {
      if (aleoPublicKey) {
        try {
          // In production, use the Aleo SDK to fetch actual balance
          // For now, we'll set a placeholder
          setAleoBalance("0.0000");
        } catch (error) {
          console.error("Failed to fetch Aleo balance:", error);
          setAleoBalance(null);
        }
      } else {
        setAleoBalance(null);
      }
    };

    fetchAleoBalance();
  }, [aleoPublicKey]);

  // Build connected wallets array
  const connectedWallets: ConnectedWallet[] = [];

  if (isEvmConnected && evmAddress) {
    const formattedBalance = evmBalance 
      ? parseFloat(formatUnits(evmBalance.value, evmBalance.decimals)).toFixed(4)
      : undefined;
    
    connectedWallets.push({
      address: evmAddress,
      type: "evm",
      chainId: chain?.id,
      balance: formattedBalance ? `${formattedBalance} ${evmBalance?.symbol}` : undefined,
      name: chain?.name || "Ethereum",
      icon: `https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/${chain?.name?.toLowerCase() || 'ethereum'}.svg`,
    });
  }

  if (isSolanaConnected && solanaPublicKey) {
    connectedWallets.push({
      address: solanaPublicKey.toBase58(),
      type: "solana",
      chainId: "solana",
      balance: solanaBalance ? `${solanaBalance} SOL` : undefined,
      name: solanaWallet?.adapter.name || "Solana",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg",
    });
  }

  if (isAleoConnected && aleoPublicKey) {
    connectedWallets.push({
      address: aleoPublicKey,
      type: "aleo",
      chainId: "aleo",
      balance: aleoBalance ? `${aleoBalance} ALEO` : undefined,
      name: aleoWallet?.adapter.name || "Aleo",
      icon: "https://raw.githubusercontent.com/demox-labs/aleo-wallet-adapter/main/packages/ui/public/aleo.svg",
    });
  }

  const isAnyWalletConnected = isEvmConnected || isSolanaConnected || isAleoConnected;

  const disconnectWallet = useCallback((address: string) => {
    if (evmAddress === address) {
      disconnectEvm();
    } else if (solanaPublicKey?.toBase58() === address) {
      disconnectSolana();
    } else if (aleoPublicKey === address) {
      disconnectAleo();
    }
  }, [evmAddress, solanaPublicKey, aleoPublicKey, disconnectEvm, disconnectSolana, disconnectAleo]);

  return {
    connectedWallets,
    isAnyWalletConnected,
    isEvmConnected,
    isSolanaConnected,
    isAleoConnected,
    evmAddress,
    solanaAddress: solanaPublicKey?.toBase58(),
    aleoAddress: aleoPublicKey,
    disconnectWallet,
    disconnectEvm,
    disconnectSolana,
    disconnectAleo,
  };
};
