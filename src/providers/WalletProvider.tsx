import { ReactNode, useMemo } from "react";
import { WagmiProvider, http } from "wagmi";
import { mainnet, arbitrum, optimism, polygon, base, bsc, avalanche } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Solana imports
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

// Aleo imports
import { AleoWalletProviderWrapper } from "./AleoWalletProvider";

const queryClient = new QueryClient();

// Wagmi config for EVM chains
const wagmiConfig = getDefaultConfig({
  appName: "Jumper Exchange Clone",
  projectId: "demo-project-id", // Replace with your WalletConnect project ID
  chains: [mainnet, arbitrum, optimism, polygon, base, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
});

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProviderWrapper = ({ children }: WalletProviderProps) => {
  // Solana wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Solana RPC endpoint
  const endpoint = useMemo(
    () => "https://api.mainnet-beta.solana.com",
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "hsl(271 70% 60%)",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <AleoWalletProviderWrapper>
                  {children}
                </AleoWalletProviderWrapper>
              </WalletModalProvider>
            </SolanaWalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export { WalletProviderWrapper as WalletProvider };
