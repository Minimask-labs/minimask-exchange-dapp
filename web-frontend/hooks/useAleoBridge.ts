import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AleoBridgeQuote {
  id: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  toAmountUsd: string;
  fees: {
    platformFee: string;
    platformFeeBps: number;
    bridgeFee: string;
    gasFee: string;
    totalFee: string;
  };
  estimatedTime: string;
  route: {
    steps: Array<{
      type: string;
      provider: string;
      action?: string;
      fromChain?: string;
      toChain?: string;
    }>;
  };
  validUntil: number;
}

export interface AleoTransactionStatus {
  status: "pending" | "confirmed" | "failed" | "unknown";
  blockHeight?: number;
  timestamp?: string;
  fee?: string;
  error?: string;
}

export interface RelayerJob {
  status: string;
  aleoTxId: string;
  destinationChain: string;
  destinationAddress: string;
  amount: string;
  estimatedGasCost: string;
  estimatedCompletion: string;
  relayerJobId: string;
}

export const useAleoBridge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<AleoBridgeQuote | null>(null);

  // Get a bridge quote
  const getQuote = useCallback(async (params: {
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    amount: string;
    fromAddress?: string;
    toAddress?: string;
  }): Promise<AleoBridgeQuote | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('aleo-bridge/quote', {
        body: params,
      });

      if (fnError) throw fnError;
      
      setQuote(data);
      return data;
    } catch (err: any) {
      console.error("Bridge quote error:", err);
      setError(err.message || "Failed to get bridge quote");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check transaction status
  const getTransactionStatus = useCallback(async (txId: string): Promise<AleoTransactionStatus | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('aleo-bridge/transaction', {
        body: { txId, action: 'status' },
      });

      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      console.error("Transaction status error:", err);
      return { status: 'unknown', error: err.message };
    }
  }, []);

  // Request relayer to auto-claim on destination chain
  const requestRelay = useCallback(async (params: {
    aleoTxId: string;
    destinationChain: string;
    destinationAddress: string;
    amount: string;
  }): Promise<RelayerJob | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('aleo-bridge/relayer', {
        body: params,
      });

      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      console.error("Relayer request error:", err);
      setError(err.message || "Failed to request relay");
      return null;
    }
  }, []);

  // Get registered merchants
  const getMerchants = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('aleo-bridge/merchants', {
        body: {},
      });

      if (fnError) throw fnError;
      return data.merchants;
    } catch (err: any) {
      console.error("Merchants fetch error:", err);
      return [];
    }
  }, []);

  // Poll for transaction confirmation
  const waitForConfirmation = useCallback(async (
    txId: string, 
    maxAttempts = 30, 
    intervalMs = 10000
  ): Promise<AleoTransactionStatus> => {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await getTransactionStatus(txId);
      
      if (status?.status === 'confirmed' || status?.status === 'failed') {
        return status;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return { status: 'unknown', error: 'Timeout waiting for confirmation' };
  }, [getTransactionStatus]);

  return {
    // State
    isLoading,
    error,
    quote,
    
    // Actions
    getQuote,
    getTransactionStatus,
    requestRelay,
    getMerchants,
    waitForConfirmation,
    
    // Helpers
    clearError: () => setError(null),
    clearQuote: () => setQuote(null),
  };
};
