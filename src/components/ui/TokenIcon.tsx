import { cn } from "@/lib/utils";

interface TokenIconProps {
  src?: string;
  symbol: string;
  size?: "sm" | "md" | "lg" | "xl";
  networkIcon?: string;
  networkName?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-12 h-12",
};

const networkSizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
};

const TokenIcon = ({
  src,
  symbol,
  size = "md",
  networkIcon,
  networkName,
  className,
}: TokenIconProps) => {
  const getInitials = (s: string) => s.slice(0, 2).toUpperCase();

  return (
    <div className={cn("relative inline-flex", className)}>
      {src ? (
        <img
          src={src}
          alt={symbol}
          className={cn(sizeClasses[size], "rounded-full object-cover")}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground",
          src && "hidden"
        )}
      >
        {getInitials(symbol)}
      </div>
      
      {networkIcon && (
        <div
          className={cn(
            networkSizeClasses[size],
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card overflow-hidden bg-card"
          )}
          title={networkName}
        >
          <img
            src={networkIcon}
            alt={networkName || "network"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export { TokenIcon };
