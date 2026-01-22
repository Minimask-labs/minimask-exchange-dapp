import { Layout, PromoBanner } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconButton } from "@/components/ui/IconButton";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { Badge as CustomBadge } from "@/components/ui/custom-badge";
import { Settings, History, ChevronDown, ArrowDown, Fuel, RefreshCw } from "lucide-react";
import { useState } from "react";
import { mockTokens, mockRoutes, mockChains, mockBridges, mockExchanges } from "@/data/mockData";
import { Token, SwapSettings, SwapRoute } from "@/types";
import { TokenSelectorModal, SettingsPanel } from "@/components/exchange";

const defaultSettings: SwapSettings = {
  routePriority: "best",
  gasPrice: "normal",
  slippage: "auto",
  enabledBridges: mockBridges.filter(b => b.enabled).map(b => b.id),
  enabledExchanges: mockExchanges.filter(e => e.enabled).map(e => e.id),
};

const Index = () => {
  const [fromToken, setFromToken] = useState<Token>(mockTokens[1]); // USDT
  const [toToken, setToToken] = useState<Token>(mockTokens[9]); // SOL
  const [amount, setAmount] = useState("100");
  const [settings, setSettings] = useState<SwapSettings>(defaultSettings);
  
  // Modal states
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  const fromChain = mockChains.find(c => c.id === fromToken.chainId);
  const toChain = mockChains.find(c => c.id === toToken.chainId);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const getBestRoute = (): SwapRoute => {
    return mockRoutes[0];
  };

  const getTagVariant = (tag: string) => {
    switch (tag) {
      case "Best Return":
        return "success";
      case "Fastest":
        return "warning";
      case "Cheapest":
        return "secondary";
      default:
        return "default";
    }
  };

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
            <IconButton variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Token Selection */}
        <div className="space-y-2 mb-4">
          {/* From Token */}
          <button 
            onClick={() => setIsFromTokenModalOpen(true)}
            className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between"
          >
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

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button 
              onClick={handleSwapTokens}
              className="w-8 h-8 rounded-full bg-card border border-jumper-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* To Token */}
          <button 
            onClick={() => setIsToTokenModalOpen(true)}
            className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between"
          >
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
            <button 
              onClick={() => setAmount(fromToken.balance || "0")}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              MAX
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">≈ ${parseFloat(amount || "0").toFixed(2)}</p>
        </div>

        {/* Routes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Receive</span>
            <div className="flex items-center gap-2">
              <IconButton variant="ghost" size="sm">
                <RefreshCw className="w-3 h-3" />
              </IconButton>
              <CustomBadge variant="success">Best Return</CustomBadge>
            </div>
          </div>

          {/* Best Route */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-primary/30 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TokenIcon src={toToken.icon} symbol={toToken.symbol} size="md" />
                <span className="text-lg font-semibold">{getBestRoute().toAmount}</span>
                <span className="text-success text-sm">{getBestRoute().percentageDiff}</span>
              </div>
              <span className="text-sm text-muted-foreground">≈ ${getBestRoute().toAmountUsd}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Fuel className="w-3 h-3" />
                ${getBestRoute().gasCostUsd}
              </span>
              <span>~{getBestRoute().estimatedTime}</span>
              <span>via {getBestRoute().steps[0].provider}</span>
            </div>
          </div>

          {/* More Routes Toggle */}
          {mockRoutes.length > 1 && (
            <button
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className="w-full text-center text-sm text-primary hover:text-primary/80 py-2"
            >
              {showAllRoutes ? "Hide" : "Show"} {mockRoutes.length - 1} more routes
            </button>
          )}

          {/* Additional Routes */}
          {showAllRoutes && (
            <div className="space-y-2 mt-2">
              {mockRoutes.slice(1).map((route) => (
                <div
                  key={route.id}
                  className="p-3 rounded-xl bg-secondary/30 border border-jumper-border hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TokenIcon src={toToken.icon} symbol={toToken.symbol} size="sm" />
                      <span className="font-medium">{route.toAmount}</span>
                      <span className={route.percentageDiff?.startsWith("+") ? "text-success text-sm" : "text-destructive text-sm"}>
                        {route.percentageDiff}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {route.tags?.map((tag) => (
                        <CustomBadge key={tag} variant={getTagVariant(tag) as any} className="text-xs">
                          {tag}
                        </CustomBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      ${route.gasCostUsd}
                    </span>
                    <span>~{route.estimatedTime}</span>
                    <span>via {route.steps[0].provider}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exchange Button */}
        <GradientButton fullWidth size="lg">
          Review Exchange
        </GradientButton>
      </GlassCard>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        isOpen={isFromTokenModalOpen}
        onClose={() => setIsFromTokenModalOpen(false)}
        onSelect={setFromToken}
        selectedToken={fromToken}
        title="Exchange from"
      />

      <TokenSelectorModal
        isOpen={isToTokenModalOpen}
        onClose={() => setIsToTokenModalOpen(false)}
        onSelect={setToToken}
        selectedToken={toToken}
        title="Exchange to"
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </Layout>
  );
};

export default Index;
