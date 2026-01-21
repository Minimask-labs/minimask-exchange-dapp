import { Layout, PromoBanner } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconButton } from "@/components/ui/IconButton";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { ChainIcon } from "@/components/ui/ChainIcon";
import { Badge as CustomBadge } from "@/components/ui/custom-badge";
import { Settings, History, ChevronDown, ArrowDown, Fuel } from "lucide-react";
import { useState } from "react";
import { mockTokens, mockRoutes, mockChains } from "@/data/mockData";

const Index = () => {
  const [fromToken] = useState(mockTokens[1]); // USDT
  const [toToken] = useState(mockTokens[9]); // SOL
  const [amount, setAmount] = useState("100");

  const fromChain = mockChains.find(c => c.id === fromToken.chainId);
  const toChain = mockChains.find(c => c.id === toToken.chainId);

  return (
    <Layout>
      <PromoBanner onCtaClick={() => {}} />

      {/* Exchange Card */}
      <GlassCard className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Exchange</h2>
          <div className="flex items-center gap-1">
            <IconButton variant="ghost" size="sm">
              <History className="w-4 h-4" />
            </IconButton>
            <IconButton variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Token Selection */}
        <div className="space-y-2 mb-4">
          {/* From Token */}
          <button className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenIcon
                src={fromToken.icon}
                symbol={fromToken.symbol}
                size="lg"
                networkIcon={fromChain?.icon}
                networkName={fromChain?.name}
              />
              <div className="text-left">
                <p className="font-medium">{fromToken.symbol}</p>
                <p className="text-xs text-muted-foreground">{fromChain?.name}</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-card border border-jumper-border flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* To Token */}
          <button className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenIcon
                src={toToken.icon}
                symbol={toToken.symbol}
                size="lg"
                networkIcon={toChain?.icon}
                networkName={toChain?.name}
              />
              <div className="text-left">
                <p className="font-medium">{toToken.symbol}</p>
                <p className="text-xs text-muted-foreground">{toChain?.name}</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="p-4 rounded-xl bg-secondary mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Send</span>
            <span className="text-xs text-muted-foreground">
              Balance: {fromToken.balance} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              placeholder="0"
            />
            <button className="text-xs font-medium text-primary">MAX</button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">≈ $100.00</p>
        </div>

        {/* Routes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Receive</span>
            <CustomBadge variant="success">Best Return</CustomBadge>
          </div>

          {/* Best Route */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TokenIcon src={toToken.icon} symbol={toToken.symbol} size="md" />
                <span className="text-lg font-semibold">{mockRoutes[0].toAmount}</span>
                <span className="text-success text-sm">{mockRoutes[0].percentageDiff}</span>
              </div>
              <span className="text-sm text-muted-foreground">≈ ${mockRoutes[0].toAmountUsd}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Fuel className="w-3 h-3" />
                ${mockRoutes[0].gasCostUsd}
              </span>
              <span>~{mockRoutes[0].estimatedTime}</span>
              <span>via {mockRoutes[0].steps[0].provider}</span>
            </div>
          </div>
        </div>

        {/* Exchange Button */}
        <GradientButton fullWidth size="lg">
          Review Exchange
        </GradientButton>
      </GlassCard>
    </Layout>
  );
};

export default Index;
