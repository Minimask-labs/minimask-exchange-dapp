import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  usdValue?: string;
  onMaxClick?: () => void;
  showMax?: boolean;
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, value, usdValue, onMaxClick, showMax = true, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={value}
            className={cn(
              "flex-1 bg-transparent text-2xl font-semibold",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none",
              "min-w-0"
            )}
            placeholder="0"
            {...props}
          />
          {showMax && onMaxClick && (
            <button
              type="button"
              onClick={onMaxClick}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors uppercase"
            >
              Max
            </button>
          )}
        </div>
        {usdValue && (
          <span className="text-sm text-muted-foreground">
            ≈ ${usdValue}
          </span>
        )}
      </div>
    );
  }
);

AmountInput.displayName = "AmountInput";

export { AmountInput };
