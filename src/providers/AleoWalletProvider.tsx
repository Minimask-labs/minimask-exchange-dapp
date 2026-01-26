import { ReactNode, useMemo } from "react";
import { WalletProvider, useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";

interface AleoWalletProviderProps {
  children: ReactNode;
}

export const AleoWalletProviderWrapper = ({ children }: AleoWalletProviderProps) => {
  const wallets = useMemo(() => [
    new LeoWalletAdapter({
      appName: "Jumper Exchange",
    }),
  ], []);

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
};

// Re-export useWallet for convenience
export { useWallet as useAleoWallet } from "@demox-labs/aleo-wallet-adapter-react";
