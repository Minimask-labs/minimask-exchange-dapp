import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconButton } from "@/components/ui/IconButton";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { Badge as CustomBadge } from "@/components/ui/custom-badge";
import { Settings, History, ChevronDown, ArrowDown, Fuel, RefreshCw, Loader2, AlertCircle, Wallet } from "lucide-react";
import { mockTokens, mockChains, mockBridges, mockExchanges } from "@/data/mockData";
import { Token, SwapSettings, SwapRoute } from "@/types";
import { TokenSelectorModal, SettingsPanel } from "@/components/exchange";
import { SwapReviewModal } from "@/components/exchange/SwapReviewModal";
import { useLifi } from "@/hooks/useLifi";
import { useWallets } from "@/hooks/useWallets";
import { useDebounce } from "@/hooks/useDebounce";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

const defaultSettings: SwapSettings = {
  routePriority: "best",
  gasPrice: "normal",
  slippage: "auto",
  enabledBridges: mockBridges.filter(b => b.enabled).map(b => b.id),
  enabledExchanges: mockExchanges.filter(e => e.enabled).map(e => e.id),
};

const SwapCard = () => {
  const [fromToken, setFromToken] = useState<Token>(mockTokens[1]); // USDT
  const [toToken, setToToken] = useState<Token>(mockTokens[4]); // ETH on Arbitrum
  const [amount, setAmount] = useState("100");
  const [settings, setSettings] = useState<SwapSettings>(defaultSettings);
  const [routes, setRoutes] = useState<SwapRoute[]>([]);
  
  // Modal states
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  const { getRoutes, isLoading, error } = useLifi();
  const { evmAddress, isEvmConnected } = useWallets();
  const { executeSwap } = useSwapExecution();
  const { openConnectModal } = useConnectModal();
  const debouncedAmount = useDebounce(amount, 500);

  const fromChain = mockChains.find(c => c.id === fromToken.chainId);
  const toChain = mockChains.find(c => c.id === toToken.chainId);

  // Fetch routes when inputs change
  const fetchRoutes = useCallback(async () => {
    if (!debouncedAmount || parseFloat(debouncedAmount) <= 0) {
      setRoutes([]);
      return;
    }

    const slippage = settings.slippage === "auto" ? 0.03 : settings.slippage / 100;
    
    const result = await getRoutes({
      fromToken,
      toToken,
      fromAmount: debouncedAmount,
      fromAddress: evmAddress || undefined,
      slippage,
    });

    if (result.routes.length > 0) {
      setRoutes(result.routes);
    }
  }, [debouncedAmount, fromToken, toToken, evmAddress, settings.slippage, getRoutes]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleRefresh = () => {
    fetchRoutes();
  };

  const getBestRoute = (): SwapRoute | null => {
    return routes.length > 0 ? routes[0] : null;
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

  const bestRoute = getBestRoute();
  const hasValidAmount = debouncedAmount && parseFloat(debouncedAmount) > 0;

  return (
    <>
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
              <IconButton variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              </IconButton>
              {bestRoute && <CustomBadge variant="success">Best Return</CustomBadge>}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && hasValidAmount && (
            <div className="p-6 rounded-xl bg-secondary/50 border border-jumper-border flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Finding best routes...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* No Routes */}
          {!isLoading && !error && hasValidAmount && routes.length === 0 && (
            <div className="p-6 rounded-xl bg-secondary/50 border border-jumper-border text-center">
              <p className="text-sm text-muted-foreground">No routes available for this swap</p>
            </div>
          )}

          {/* Empty State */}
          {!hasValidAmount && !isLoading && (
            <div className="p-6 rounded-xl bg-secondary/50 border border-jumper-border text-center">
              <p className="text-sm text-muted-foreground">Enter an amount to see available routes</p>
            </div>
          )}

          {/* Best Route */}
          {bestRoute && !isLoading && (
            <>
              <div className="p-3 rounded-xl bg-secondary/50 border border-primary/30 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TokenIcon src={toToken.icon} symbol={toToken.symbol} size="md" />
                    <span className="text-lg font-semibold">{bestRoute.toAmount}</span>
                    <span className="text-success text-sm">{bestRoute.percentageDiff}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">≈ ${bestRoute.toAmountUsd}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    ${bestRoute.gasCostUsd}
                  </span>
                  <span>~{bestRoute.estimatedTime}</span>
                  <span>via {bestRoute.steps[0]?.provider || "Unknown"}</span>
                </div>
              </div>

              {/* More Routes Toggle */}
              {routes.length > 1 && (
                <button
                  onClick={() => setShowAllRoutes(!showAllRoutes)}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 py-2"
                >
                  {showAllRoutes ? "Hide" : "Show"} {routes.length - 1} more routes
                </button>
              )}

              {/* Additional Routes */}
              {showAllRoutes && (
                <div className="space-y-2 mt-2">
                  {routes.slice(1).map((route) => (
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
                        <span>via {route.steps[0]?.provider || "Unknown"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Exchange Button */}
        {!isEvmConnected ? (
          <GradientButton 
            fullWidth 
            size="lg"
            onClick={() => openConnectModal?.()}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </GradientButton>
        ) : (
          <GradientButton 
            fullWidth 
            size="lg" 
            disabled={!bestRoute || isLoading}
            onClick={() => {
              if (bestRoute) {
                setSelectedRoute(bestRoute);
                setIsReviewOpen(true);
              }
            }}
          >
            {isLoading ? "Finding Routes..." : bestRoute ? "Review Exchange" : "Enter Amount"}
          </GradientButton>
        )}
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

      {/* Swap Review Modal */}
      <SwapReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        route={selectedRoute}
        onConfirm={async () => {
          try {
            await executeSwap({});
            toast.success("Swap executed successfully!");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Swap failed");
            throw err;
          }
        }}
      />
    </>
  );
};

export { SwapCard };
