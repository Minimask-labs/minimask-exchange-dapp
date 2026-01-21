import { cn } from "@/lib/utils";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface WalletAddressProps {
  address: string;
  truncate?: boolean;
  showCopy?: boolean;
  showExplorer?: boolean;
  explorerUrl?: string;
  className?: string;
}

const truncateAddress = (address: string, startChars = 6, endChars = 4) => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

const WalletAddress = ({
  address,
  truncate = true,
  showCopy = true,
  showExplorer = false,
  explorerUrl,
  className,
}: WalletAddressProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = truncate ? truncateAddress(address) : address;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-sm text-muted-foreground">
        {displayAddress}
      </span>
      
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-secondary transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      )}
      
      {showExplorer && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-secondary transition-colors"
          title="View on explorer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </a>
      )}
    </div>
  );
};

export { WalletAddress, truncateAddress };
