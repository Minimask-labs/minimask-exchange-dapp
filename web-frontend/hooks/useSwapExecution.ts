import { useCallback } from "react";
import { useAccount, useWalletClient, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";

interface ExecuteSwapParams {
  transactionRequest?: {
    to: string;
    data: string;
    value?: string;
    gasLimit?: string;
  };
}

export const useSwapExecution = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync } = useSendTransaction();

  const executeSwap = useCallback(
    async (params: ExecuteSwapParams) => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet");
      }

      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      const { transactionRequest } = params;

      if (!transactionRequest) {
        // Demo mode - simulate transaction
        toast.info("Demo mode: Simulating transaction...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return "0x" + Math.random().toString(16).slice(2);
      }

      try {
        const hash = await sendTransactionAsync({
          to: transactionRequest.to as `0x${string}`,
          data: transactionRequest.data as `0x${string}`,
          value: transactionRequest.value ? BigInt(transactionRequest.value) : undefined,
        });

        toast.success("Transaction submitted!");
        return hash;
      } catch (error) {
        console.error("Transaction failed:", error);
        if (error instanceof Error) {
          if (error.message.includes("rejected")) {
            throw new Error("Transaction rejected by user");
          }
          throw error;
        }
        throw new Error("Transaction failed");
      }
    },
    [isConnected, address, walletClient, sendTransactionAsync]
  );

  return {
    executeSwap,
    isConnected,
    address,
  };
};
