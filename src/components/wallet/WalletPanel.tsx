import { X, Plus, ExternalLink, Copy, LogOut } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { GradientButton } from "@/components/ui/GradientButton";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { cn } from "@/lib/utils";

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletPanel = ({ isOpen, onClose }: WalletPanelProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 slide-in-right">
        <GlassCard className="h-full rounded-none rounded-l-2xl p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Wallets</h2>
            <IconButton variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          {/* Connect Button */}
          <GradientButton fullWidth className="mb-6">
            <Plus className="w-4 h-4" />
            Connect Wallet
          </GradientButton>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              No wallets connected yet.
              <br />
              Connect a wallet to get started.
            </p>
          </div>
        </GlassCard>
      </div>
    </>
  );
};

export { WalletPanel };
