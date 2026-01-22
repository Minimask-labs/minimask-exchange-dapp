import { cn } from "@/lib/utils";

interface ChainIconProps {
  chainId?: number | string;
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

// Chain icon URLs (using popular chain logos)
const chainIcons: Record<string | number, string> = {
  1: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
  10: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg",
  56: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg",
  137: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg",
  42161: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg",
  43114: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/avalanche.svg",
  8453: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg",
  solana: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg",
};

const chainNames: Record<string | number, string> = {
  1: "Ethereum",
  10: "Optimism",
  56: "BNB Chain",
  137: "Polygon",
  42161: "Arbitrum",
  43114: "Avalanche",
  8453: "Base",
  solana: "Solana",
};

const ChainIcon = ({ chainId, src, name, size = "md", className }: ChainIconProps) => {
  const iconUrl = src || (chainId ? chainIcons[chainId] : undefined);
  const chainName = name || (chainId ? chainNames[chainId] : undefined) || String(chainId || "");

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full overflow-hidden bg-muted flex items-center justify-center",
        className
      )}
      title={chainName}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={chainName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-muted-foreground">
          {chainName.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export { ChainIcon, chainIcons, chainNames };
