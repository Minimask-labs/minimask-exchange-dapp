'use client';
import { ReactNode, useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  base,
  bsc,
  avalanche
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Solana imports
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// aleo wallet
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletModalProvider as AleoWalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { PuzzleWalletAdapter } from '@provablehq/aleo-wallet-adaptor-puzzle';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { FoxWalletAdapter } from '@provablehq/aleo-wallet-adaptor-fox';
import { Network } from '@provablehq/aleo-types';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';

import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
 

const queryClient = new QueryClient();

// Wagmi config for EVM chains
const wagmiConfig = getDefaultConfig({
  appName: 'minimask Exchange Clone',
  projectId: 'demo-project-id', // Replace with your WalletConnect project ID
  chains: [mainnet, arbitrum, optimism, polygon, base, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http()
  }
});

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProviderWrapper = ({ children }: WalletProviderProps) => {
  // Solana wallet adapters
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Solana RPC endpoint
  const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', []);
  return (
    <AleoWalletProvider
      wallets={[
        new ShieldWalletAdapter(),
        new PuzzleWalletAdapter(),
        new LeoWalletAdapter(),
        new FoxWalletAdapter()
      ]}
      autoConnect={false}
      network={Network.TESTNET}
      decryptPermission={DecryptPermission.OnChainHistory}
      programs={['credits.aleo', 'hello_world.aleo']}
      onError={(error) => console.error(error.message)}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: 'hsl(271 70% 60%)',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system'
            })}
          >
            <ConnectionProvider endpoint={endpoint}>
              <AleoWalletModalProvider>
                <SolanaWalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>{children}</WalletModalProvider>
                </SolanaWalletProvider>
              </AleoWalletModalProvider>
            </ConnectionProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AleoWalletProvider>
  );
};;

export { WalletProviderWrapper as WalletProvider };
