<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { GradientButton } from '@/components/ui/GradientButton';
import { IconButton } from '@/components/ui/IconButton';
import { WalletAddress } from '@/components/ui/WalletAddress';
import { ChainIcon } from '@/components/ui/ChainIcon';
import { ExternalLink, Copy, Power, Wallet } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { WalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui';
import Image from 'next/image';
import {Button} from "@/components/ui/button";
import { useWallet as useAleoWallet } from '@provablehq/aleo-wallet-adaptor-react';
=======
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconButton } from "@/components/ui/IconButton";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { ChainIcon } from "@/components/ui/ChainIcon";
import { ExternalLink, Copy, Power, Wallet } from "lucide-react";
import { useWallets } from "@/hooks/useWallets";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet as useAleoWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { toast } from "sonner";
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletPanel = ({ isOpen, onClose }: WalletPanelProps) => {
  const { connectedWallets, disconnectWallet } = useWallets();
  const { openConnectModal } = useConnectModal();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { select: selectAleoWallet, wallets: aleoWallets } = useAleoWallet();

      const {
        connected: aleoConnected, // boolean - whether wallet is connected
       } =  useAleoWallet();
    
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx
  const openExplorer = (
    address: string,
    type: 'evm' | 'solana' | 'aleo',
    chainId?: number | string
  ) => {
=======
  const openExplorer = (address: string, type: "evm" | "solana" | "aleo", chainId?: number | string) => {
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
    let url: string;
    if (type === 'solana') {
      url = `https://solscan.io/account/${address}`;
<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx
    } else if (type === 'aleo') {
      url = `https://explorer.provable.com/address/${address}`;
    }
     else {
      // Default to Etherscan, but could be chain-specific
      const explorerBase =
        chainId === 42161
          ? 'arbiscan.io'
          : chainId === 10
            ? 'optimistic.etherscan.io'
            : chainId === 137
              ? 'polygonscan.com'
              : chainId === 8453
                ? 'basescan.org'
                : chainId === 56
                  ? 'bscscan.com'
                  : 'etherscan.io';
=======
    } else if (type === "aleo") {
      url = `https://explorer.aleo.org/address/${address}`;
    } else {
      const explorerBase = chainId === 42161 ? "arbiscan.io" :
                           chainId === 10 ? "optimistic.etherscan.io" :
                           chainId === 137 ? "polygonscan.com" :
                           chainId === 8453 ? "basescan.org" :
                           chainId === 56 ? "bscscan.com" :
                           "etherscan.io";
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
      url = `https://${explorerBase}/address/${address}`;
    }
    window.open(url, '_blank');
  };

  const connectAleoWallet = () => {
    if (aleoWallets.length > 0) {
      selectAleoWallet(aleoWallets[0].adapter.name);
    } else {
      toast.error("Please install Leo Wallet extension");
      window.open("https://www.leo.app/", "_blank");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card border-l border-minimask-border w-[360px] p-4 sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Wallets</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <GradientButton
              fullWidth
              onClick={() => openConnectModal?.()}
              className="flex items-center justify-center !cursor-pointer gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect EVM Wallet
            </GradientButton>

            <Button
              onClick={() => setSolanaModalVisible(true)}
              className="w-full !py-6 px-4 rounded-xl !cursor-pointer !text-primary bg-secondary hover:bg-secondary/80 transition-colors font-medium flex items-center justify-center gap-2"
            >
<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx
              <Image
                src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg"
                alt="Solana"
                className="w-5 h-5"
                width={20}
                height={20}
              />
              Connect Solana Wallet
            </Button>
            <div className="mt-2 w-full grid grid-cols-1">
              <WalletMultiButton className="!w-full mx-auto py-3 px-4 !rounded-xl !text-primary !bg-secondary hover:!bg-secondary/80 transition-colors font-medium flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" />
                {aleoConnected ? 'Aleo Wallet Connected' : 'Connect Aleo Wallet'}
               </WalletMultiButton>
            </div>
=======
              <img src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg" alt="Solana" className="w-5 h-5" />
              Connect Solana Wallet
            </button>

            <button
              onClick={connectAleoWallet}
              className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <img src="https://raw.githubusercontent.com/demox-labs/aleo-wallet-adapter/main/packages/ui/public/aleo.svg" alt="Aleo" className="w-5 h-5" />
              Connect Aleo Wallet
            </button>
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
          </div>

          {connectedWallets.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Connected Wallets</p>
<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx

=======
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
              {connectedWallets.map((wallet) => (
                <div key={wallet.address} className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-center gap-3 mb-3">
                    <ChainIcon chainId={wallet.chainId || 1} size="lg" />
                    <div className="flex-1">
                      <p className="font-medium">{wallet.name}</p>
                      <WalletAddress address={wallet.address} />
                    </div>
                  </div>
<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx

=======
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
                  {wallet.balance && (
                    <p className="text-sm text-muted-foreground mb-3">Balance: {wallet.balance}</p>
                  )}
<<<<<<< HEAD:web-frontend/components/wallet/WalletPanel.tsx

                  <div className="flex items-center gap-2">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openExplorer(
                          wallet.address,
                          wallet.type,
                          wallet.chainId
                        )
                      }
                      title="View on Explorer"
                    >
=======
                  <div className="flex items-center gap-2">
                    <IconButton variant="ghost" size="sm" onClick={() => openExplorer(wallet.address, wallet.type, wallet.chainId)} title="View on Explorer">
>>>>>>> 8f0b22e8b8140bf0dc3b0af1e7934cc43964e373:src/components/wallet/WalletPanel.tsx
                      <ExternalLink className="w-4 h-4" />
                    </IconButton>
                    <IconButton variant="ghost" size="sm" onClick={() => copyAddress(wallet.address)} title="Copy Address">
                      <Copy className="w-4 h-4" />
                    </IconButton>
                    <IconButton variant="ghost" size="sm" onClick={() => disconnectWallet(wallet.address)} title="Disconnect" className="text-destructive hover:text-destructive">
                      <Power className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {connectedWallets.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Connect a wallet to get started</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { WalletPanel };
