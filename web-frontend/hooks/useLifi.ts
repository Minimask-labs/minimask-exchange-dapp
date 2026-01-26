import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Token, SwapRoute, SwapStep, Chain } from "@/types";

interface LifiToken {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name: string;
  logoURI?: string;
  priceUSD?: string;
}

interface LifiChain {
  id: number;
  key: string;
  name: string;
  logoURI: string;
  mainnet: boolean;
}

interface LifiRoute {
  id: string;
  fromAmountUSD: string;
  toAmountUSD: string;
  toAmountMin: string;
  toAmount: string;
  gasCostUSD?: string;
  steps: LifiStep[];
  tags?: string[];
}

interface LifiStep {
  id: string;
  type: string;
  tool: string;
  toolDetails: {
    key: string;
    name: string;
    logoURI: string;
  };
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: LifiToken;
    toToken: LifiToken;
    fromAmount: string;
  };
  estimate: {
    toAmount: string;
    toAmountMin: string;
    executionDuration: number;
    gasCosts?: Array<{ amountUSD?: string }>;
  };
}

interface QuoteParams {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  fromAddress?: string;
  slippage?: number;
}

interface RoutesResponse {
  routes: SwapRoute[];
  isLoading: boolean;
  error: string | null;
}

export const useLifi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert amount to wei/base units
  const toBaseUnits = (amount: string, decimals: number): string => {
    const [whole, fraction = ""] = amount.split(".");
    const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
    return whole + paddedFraction;
  };

  // Format amount from base units
  const fromBaseUnits = (amount: string, decimals: number): string => {
    const padded = amount.padStart(decimals + 1, "0");
    const whole = padded.slice(0, -decimals) || "0";
    const fraction = padded.slice(-decimals);
    return `${whole}.${fraction.slice(0, 6)}`;
  };

  // Estimate time from seconds
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // Fetch available chains
  const fetchChains = useCallback(async (): Promise<Chain[]> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("lifi-quote", {
        body: { action: "chains", params: {} },
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      return (data.chains || []).map((c: LifiChain) => ({
        id: c.id,
        name: c.name,
        icon: c.logoURI,
      }));
    } catch (err) {
      console.error("Failed to fetch chains:", err);
      return [];
    }
  }, []);

  // Fetch tokens for a chain
  const fetchTokens = useCallback(async (chainId?: number | string): Promise<Token[]> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("lifi-quote", {
        body: { action: "tokens", params: { chainId } },
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      const tokens: Token[] = [];
      const tokensByChain = data.tokens || {};
      
      Object.entries(tokensByChain).forEach(([chainIdStr, chainTokens]) => {
        (chainTokens as LifiToken[]).forEach((t) => {
          tokens.push({
            symbol: t.symbol,
            name: t.name,
            icon: t.logoURI || "",
            chainId: parseInt(chainIdStr),
            address: t.address,
            decimals: t.decimals,
            usdValue: t.priceUSD,
          });
        });
      });

      return tokens;
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      return [];
    }
  }, []);

  // Get swap routes
  const getRoutes = useCallback(
    async ({
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      slippage = 0.03,
    }: QuoteParams): Promise<RoutesResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const fromAmountBase = toBaseUnits(fromAmount, fromToken.decimals);
        
        if (fromAmountBase === "0" || !fromAmount || parseFloat(fromAmount) <= 0) {
          setIsLoading(false);
          return { routes: [], isLoading: false, error: null };
        }

        const { data, error: fnError } = await supabase.functions.invoke("lifi-quote", {
          body: {
            action: "routes",
            params: {
              fromChainId: fromToken.chainId,
              toChainId: toToken.chainId,
              fromToken: fromToken.address,
              toToken: toToken.address,
              fromAmount: fromAmountBase,
              fromAddress: fromAddress || "0x0000000000000000000000000000000000000000",
              slippage,
              order: "RECOMMENDED",
            },
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (data.error) throw new Error(data.error);

        const routes: SwapRoute[] = (data.routes || []).map((route: LifiRoute, index: number) => {
          // Calculate total gas cost
          let totalGasCostUsd = 0;
          route.steps.forEach((step) => {
            step.estimate.gasCosts?.forEach((gc) => {
              totalGasCostUsd += parseFloat(gc.amountUSD || "0");
            });
          });

          // Calculate total execution time
          let totalDuration = 0;
          route.steps.forEach((step) => {
            totalDuration += step.estimate.executionDuration || 0;
          });

          // Convert steps
          const steps: SwapStep[] = route.steps.map((step) => ({
            type: step.type === "cross" ? "bridge" : "swap",
            provider: step.toolDetails.name,
            fromToken: step.action.fromToken.symbol,
            toToken: step.action.toToken.symbol,
            fromChain: step.action.fromChainId.toString(),
            toChain: step.action.toChainId.toString(),
          }));

          // Determine tags
          const tags: string[] = [];
          if (index === 0) tags.push("Best Return");
          if (route.tags?.includes("FASTEST")) tags.push("Fastest");
          if (route.tags?.includes("CHEAPEST")) tags.push("Cheapest");

          // Calculate percentage difference from best route
          const toAmountNum = parseFloat(route.toAmountUSD || "0");
          const fromAmountNum = parseFloat(route.fromAmountUSD || "0");
          const diff = fromAmountNum > 0 ? ((toAmountNum - fromAmountNum) / fromAmountNum) * 100 : 0;

          return {
            id: route.id || `route-${index}`,
            fromToken,
            toToken,
            fromAmount,
            toAmount: fromBaseUnits(route.toAmount, toToken.decimals),
            toAmountUsd: parseFloat(route.toAmountUSD || "0").toFixed(2),
            gasCost: "0",
            gasCostUsd: totalGasCostUsd.toFixed(2),
            estimatedTime: formatDuration(totalDuration),
            steps,
            tags: tags.length > 0 ? tags : undefined,
            percentageDiff: diff >= 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`,
          };
        });

        setIsLoading(false);
        return { routes, isLoading: false, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch routes";
        console.error("Failed to get routes:", err);
        setError(errorMessage);
        setIsLoading(false);
        return { routes: [], isLoading: false, error: errorMessage };
      }
    },
    []
  );

  // Get single quote (simpler, faster)
  const getQuote = useCallback(
    async ({
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      slippage = 0.03,
    }: QuoteParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const fromAmountBase = toBaseUnits(fromAmount, fromToken.decimals);

        const { data, error: fnError } = await supabase.functions.invoke("lifi-quote", {
          body: {
            action: "quote",
            params: {
              fromChain: fromToken.chainId,
              toChain: toToken.chainId,
              fromToken: fromToken.address,
              toToken: toToken.address,
              fromAmount: fromAmountBase,
              fromAddress,
              slippage: slippage.toString(),
            },
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (data.error) throw new Error(data.error);

        setIsLoading(false);
        return { quote: data, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch quote";
        console.error("Failed to get quote:", err);
        setError(errorMessage);
        setIsLoading(false);
        return { quote: null, error: errorMessage };
      }
    },
    []
  );

  return {
    getRoutes,
    getQuote,
    fetchChains,
    fetchTokens,
    isLoading,
    error,
  };
};
