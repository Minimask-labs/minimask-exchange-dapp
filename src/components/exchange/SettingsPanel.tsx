import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronRight, Check } from "lucide-react";
import { SwapSettings, Bridge, Exchange } from "@/types";
import { mockBridges, mockExchanges } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { BridgesModal } from "./BridgesModal";
import { ExchangesModal } from "./ExchangesModal";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SwapSettings;
  onSettingsChange: (settings: SwapSettings) => void;
}

const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsPanelProps) => {
  const [showBridgesModal, setShowBridgesModal] = useState(false);
  const [showExchangesModal, setShowExchangesModal] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("0.5");

  const routePriorityOptions = [
    { value: "best", label: "Best Return" },
    { value: "fastest", label: "Fastest" },
    { value: "cheapest", label: "Cheapest" },
  ] as const;

  const gasPriceOptions = [
    { value: "normal", label: "Normal" },
    { value: "fast", label: "Fast" },
    { value: "instant", label: "Instant" },
  ] as const;

  const enabledBridgesCount = mockBridges.filter(b => 
    settings.enabledBridges.includes(b.id)
  ).length;

  const enabledExchangesCount = mockExchanges.filter(e => 
    settings.enabledExchanges.includes(e.id)
  ).length;

  const handleBridgesChange = (bridges: Bridge[]) => {
    onSettingsChange({
      ...settings,
      enabledBridges: bridges.filter(b => b.enabled).map(b => b.id),
    });
  };

  const handleExchangesChange = (exchanges: Exchange[]) => {
    onSettingsChange({
      ...settings,
      enabledExchanges: exchanges.filter(e => e.enabled).map(e => e.id),
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[400px] bg-card border-jumper-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Route Priority */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Route Priority
              </label>
              <div className="flex gap-2">
                {routePriorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSettingsChange({ ...settings, routePriority: option.value })}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      settings.routePriority === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gas Price */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Gas Price
              </label>
              <div className="flex gap-2">
                {gasPriceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSettingsChange({ ...settings, gasPrice: option.value })}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      settings.gasPrice === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slippage */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Max Slippage
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange({ ...settings, slippage: "auto" })}
                  className={cn(
                    "py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                    settings.slippage === "auto"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                  )}
                >
                  Auto
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={settings.slippage === "auto" ? customSlippage : settings.slippage}
                    onChange={(e) => {
                      setCustomSlippage(e.target.value);
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        onSettingsChange({ ...settings, slippage: value });
                      }
                    }}
                    onFocus={() => {
                      if (settings.slippage === "auto") {
                        onSettingsChange({ ...settings, slippage: parseFloat(customSlippage) });
                      }
                    }}
                    className={cn(
                      "w-full py-2 px-3 rounded-lg text-sm font-medium bg-secondary text-right pr-8 outline-none",
                      settings.slippage !== "auto" && "ring-2 ring-primary"
                    )}
                    placeholder="0.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Bridges */}
            <button
              onClick={() => setShowBridgesModal(true)}
              className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-medium">Bridges</p>
                <p className="text-xs text-muted-foreground">
                  {enabledBridgesCount}/{mockBridges.length} enabled
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Exchanges */}
            <button
              onClick={() => setShowExchangesModal(true)}
              className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-medium">Exchanges</p>
                <p className="text-xs text-muted-foreground">
                  {enabledExchangesCount}/{mockExchanges.length} enabled
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BridgesModal
        isOpen={showBridgesModal}
        onClose={() => setShowBridgesModal(false)}
        bridges={mockBridges.map(b => ({
          ...b,
          enabled: settings.enabledBridges.includes(b.id),
        }))}
        onBridgesChange={handleBridgesChange}
      />

      <ExchangesModal
        isOpen={showExchangesModal}
        onClose={() => setShowExchangesModal(false)}
        exchanges={mockExchanges.map(e => ({
          ...e,
          enabled: settings.enabledExchanges.includes(e.id),
        }))}
        onExchangesChange={handleExchangesChange}
      />
    </>
  );
};

export { SettingsPanel };
