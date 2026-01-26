// import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useWallet  } from '@provablehq/aleo-wallet-adaptor-react';

import { useCallback, useState } from "react";
// import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";

// Platform fee in basis points (50 = 0.5%)
const PLATFORM_FEE_BPS = 50;
const TREASURY_ADDRESS = "aleo1jumpertreasury0000000000000000000000000000000000000000000";

export interface AleoSwapParams {
  amount: string;
  merchantAddress: string;
  programId?: string;
}

export interface AleoBridgeParams {
  amount: string;
  destinationChain: string;
  destinationAddress: string;
  bridgeProvider: string;
}

export const useAleoWalletHook = () => {
  const {
    wallet,
    connected,
    connecting,
    connect,
    disconnect,
    transactionStatus,
    address,
    network
  } = useWallet();

  const [isExecuting, setIsExecuting] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  // Execute a swap through the Jumper router contract
  const executeSwap = useCallback(async (params: AleoSwapParams) => {
    // if (!requestTransaction || !publicKey) {
    //   throw new Error("Aleo wallet not connected");
    // }

    setIsExecuting(true);
    try {
      // Convert amount to u64 (microcredits)
      const amountMicrocredits = Math.floor(parseFloat(params.amount) * 1_000_000);
      
      const transaction = {
        address: address,
        chainId: network,
        transitions: [
          {
            program: params.programId || 'aleo_jumper_router.aleo',
            functionName: 'swap_with_fee',
            inputs: [
              `${amountMicrocredits}u64`,
              params.merchantAddress,
              `${PLATFORM_FEE_BPS}u64`
            ]
          }
        ],
        fee: 100000, // 0.1 ALEO for network gas
        feePrivate: false
      };

      // const result = await requestTransaction(transaction);
      // setLastTxId(result);
      // return result;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  // Execute a bridge operation through the router
  const executeBridge = useCallback(async (params: AleoBridgeParams) => {
    // if (!requestTransaction || !publicKey) {
    //   throw new Error("Aleo wallet not connected");
    // }

    setIsExecuting(true);
    try {
      const amountMicrocredits = Math.floor(parseFloat(params.amount) * 1_000_000);
      
      // Bridge transaction with destination memo
      const transaction = {
        address: address,
        chainId: network,
        transitions: [
          {
            program: 'aleo_jumper_bridge.aleo',
            functionName: 'bridge_with_fee',
            inputs: [
              `${amountMicrocredits}u64`,
              `${PLATFORM_FEE_BPS}u64`,
              // Destination chain encoded as field
              `${hashString(params.destinationChain)}field`,
              // Destination address encoded (first 32 chars for demo)
              `${hashString(params.destinationAddress.slice(0, 32))}field`
            ]
          }
        ],
        fee: 150000, // Higher fee for bridge operations
        feePrivate: false
      };

      // const result = await requestTransaction(transaction);
      // setLastTxId(result);
      // return result;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  // Get transaction status
  const getTransactionStatus = useCallback(async (txId: string) => {
    if (!transactionStatus) {
      return null;
    }
    return await transactionStatus(txId);
  }, [transactionStatus]);

  // Get wallet records (for viewing balances)
  const getRecords = useCallback(async (programId: string) => {
    // if (!requestRecordPlaintexts) {
    //   throw new Error("Wallet does not support record requests");
    // }
    // const records = await requestRecordPlaintexts(programId);
    // return records.filter(record => !record.spent);
  }, []);

  return {
    // Connection state
     wallet,
    connected,
    connecting,
    connect,
    disconnect,
    
    // Transaction state
    isExecuting,
    lastTxId,
    
    // Actions
    executeSwap,
    executeBridge,
    getTransactionStatus,
    getRecords,
    
    // Constants
    PLATFORM_FEE_BPS,
    TREASURY_ADDRESS,
  };
};

// Helper to hash a string to a numeric field for Aleo
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}
