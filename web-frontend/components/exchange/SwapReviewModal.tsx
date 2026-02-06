import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { TokenIcon } from "@/components/ui/TokenIcon";
// import { Badge as CustomBadge } from "@/components/ui/custom-badge";
// import { SwapRoute, Chain } from "@/types";
// import { mockChains } from "@/data/mockData";
import { ArrowRight, Fuel, Clock, ChevronDown, ChevronUp, CheckCircle2, Loader2, XCircle, ExternalLink } from "lucide-react";
// import { cn } from "@/lib/utils";

interface SwapReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: any | null;
  onConfirm: () => Promise<void>;
}

type SwapStatus = "review" | "signing" | "pending" | "success" | "error";

const SwapReviewModal = ({
  isOpen,
  onClose,
  route,
  onConfirm,
}: SwapReviewModalProps) => {
  const [status, setStatus] = useState<SwapStatus>("review");
  const [showSteps, setShowSteps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  if (!route) return null;

  // const fromChain = mockChains.find(c => c.id === route?.fromToken?.chainId);
  // const toChain = mockChains.find(c => c.id === route?.toToken?.chainId);

  const handleConfirm = async () => {
    try {
      setStatus("signing");
      await onConfirm();
      setStatus("pending");
      console.log('Transaction submitted', route);
      // Simulate transaction completion (in real app, would track tx)
      setTimeout(() => {
        setTxHash("0x1234...5678");
        setStatus("success");
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Transaction failed");
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status !== "signing" && status !== "pending") {
      setStatus("review");
      setErrorMessage("");
      setTxHash("");
      onClose();
    }
  };

  const getStepIcon = (type: string) => {
    if (type === "bridge") {
      return "🌉";
    }
    return "🔄";
  };
                  const aleoChain =
                    'https://assets.coingecko.com/coins/images/27916/standard/secondary-icon-dark.png?1726770428"';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px] bg-card border-jumper-border p-0 gap-0">
        <DialogHeader className="p-4 border-b border-jumper-border">
          <DialogTitle className="text-lg font-semibold">
            {status === 'review' && 'Review Exchange'}
            {status === 'signing' && 'Confirm in Wallet'}
            {status === 'pending' && 'Transaction Pending'}
            {status === 'success' && 'Exchange Complete!'}
            {status === 'error' && 'Transaction Failed'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-semibold mb-2">Exchange Successful!</p>
              <p className="text-sm text-muted-foreground mb-4">
                You received {route?.toAmount} {route?.toToken?.symbol}
              </p>
              {txHash && (
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-lg font-semibold mb-2">Transaction Failed</p>
              <p className="text-sm text-muted-foreground mb-4">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Signing State */}
          {status === 'signing' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-lg font-semibold mb-2">
                Waiting for Confirmation
              </p>
              <p className="text-sm text-muted-foreground">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {/* Pending State */}
          {status === 'pending' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-warning animate-spin" />
              </div>
              <p className="text-lg font-semibold mb-2">Transaction Pending</p>
              <p className="text-sm text-muted-foreground">
                Your exchange is being processed...
              </p>
            </div>
          )}

          {/* Review State */}
          {status === 'review' && (
            <>
              {/* Token Exchange Preview */}
              <div className="p-4 rounded-xl bg-secondary mb-4">
                <div className="flex items-center justify-between">
                  {/* From */}
                  <div className="text-center">
                    <TokenIcon
                      src={route?.fromToken?.icon}
                      symbol={route?.fromToken?.symbol}
                      size="lg"
                      networkIcon={aleoChain}
                      networkName={'aleo'}
                      className="mx-auto mb-2"
                    />
                    <p className="font-semibold">{route?.fromAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      {route?.fromToken?.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">{'aleo'}</p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />

                  {/* To */}
                  <div className="text-center">
                    <TokenIcon
                      src={route?.toToken?.icon}
                      symbol={route?.toToken?.symbol}
                      size="lg"
                      networkIcon={aleoChain}
                      networkName={'aleo'}
                      className="mx-auto mb-2"
                    />
                    <p className="font-semibold">{route?.toAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      {route?.toToken?.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                     Aleo
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span>
                    1 {route?.fromToken?.symbol} ≈{' '}
                    {(
                      parseFloat(route?.toAmount) / parseFloat(route?.fromAmount)
                    ).toFixed(6)}{' '}
                    {route?.toToken?.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Gas Cost
                  </span>
                  <span>${route?.gasCostUsd}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Estimated Time
                  </span>
                  <span>{route?.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You Receive</span>
                  <span className="text-success font-medium">
                    ≈ ${route?.toAmountUsd}
                  </span>
                </div>
              </div>

              {/* Route Steps */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 mb-4 text-sm"
              >
                <span>Route ({route?.steps?.length} steps)</span>
                {showSteps ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* {showSteps && (
                <div className="space-y-2 mb-4">
                  {route?.steps?.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                    >
                      <span className="text-lg">{getStepIcon(step?.type)}</span>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">
                          {step?.type === 'bridge' ? 'Bridge' : 'Swap'} via{' '}
                          {step?.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step?.fromToken} → {step?.toToken}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
            </>
          )}

          {/* Action Button */}
          {status === 'review' && (
            <GradientButton fullWidth size="lg" onClick={handleConfirm}>
              Confirm Exchange
            </GradientButton>
          )}

          {status === 'error' && (
            <GradientButton
              fullWidth
              size="lg"
              onClick={() => setStatus('review')}
            >
              Try Again
            </GradientButton>
          )}

          {status === 'success' && (
            <GradientButton fullWidth size="lg" onClick={handleClose}>
              Done
            </GradientButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { SwapReviewModal };
