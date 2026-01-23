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

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletPanel = ({ isOpen, onClose }: WalletPanelProps) => {
  const { connectedWallets, disconnectWallet } = useWallets();
  const { openConnectModal } = useConnectModal();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { select: selectAleoWallet, wallets: aleoWallets } = useAleoWallet();

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const openExplorer = (address: string, type: "evm" | "solana" | "aleo", chainId?: number | string) => {
    let url: string;
    if (type === "solana") {
      url = `https://solscan.io/account/${address}`;
    } else if (type === "aleo") {
      url = `https://explorer.aleo.org/address/${address}`;
    } else {
      const explorerBase = chainId === 42161 ? "arbiscan.io" :
                           chainId === 10 ? "optimistic.etherscan.io" :
                           chainId === 137 ? "polygonscan.com" :
                           chainId === 8453 ? "basescan.org" :
                           chainId === 56 ? "bscscan.com" :
                           "etherscan.io";
      url = `https://${explorerBase}/address/${address}`;
    }
    window.open(url, "_blank");
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
      <SheetContent className="bg-card border-l border-jumper-border w-[360px] sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Wallets</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <GradientButton
              fullWidth
              onClick={() => openConnectModal?.()}
              className="flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect EVM Wallet
            </GradientButton>
            
            <button
              onClick={() => setSolanaModalVisible(true)}
              className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium flex items-center justify-center gap-2"
            >
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
          </div>

          {connectedWallets.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Connected Wallets</p>
              {connectedWallets.map((wallet) => (
                <div key={wallet.address} className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-center gap-3 mb-3">
                    <ChainIcon chainId={wallet.chainId || 1} size="lg" />
                    <div className="flex-1">
                      <p className="font-medium">{wallet.name}</p>
                      <WalletAddress address={wallet.address} />
                    </div>
                  </div>
                  {wallet.balance && (
                    <p className="text-sm text-muted-foreground mb-3">Balance: {wallet.balance}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <IconButton variant="ghost" size="sm" onClick={() => openExplorer(wallet.address, wallet.type, wallet.chainId)} title="View on Explorer">
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
