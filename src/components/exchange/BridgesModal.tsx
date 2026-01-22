import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Bridge } from "@/types";
import { cn } from "@/lib/utils";

interface BridgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bridges: Bridge[];
  onBridgesChange: (bridges: Bridge[]) => void;
}

const BridgesModal = ({
  isOpen,
  onClose,
  bridges,
  onBridgesChange,
}: BridgesModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBridges = bridges.filter(bridge =>
    bridge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allEnabled = bridges.every(b => b.enabled);
  const someEnabled = bridges.some(b => b.enabled) && !allEnabled;

  const handleToggleAll = () => {
    const newEnabled = !allEnabled;
    onBridgesChange(bridges.map(b => ({ ...b, enabled: newEnabled })));
  };

  const handleToggleBridge = (bridgeId: string) => {
    onBridgesChange(bridges.map(b => 
      b.id === bridgeId ? { ...b, enabled: !b.enabled } : b
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card border-jumper-border p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">Bridges</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <SearchInput
            placeholder="Search bridges"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>

        {/* Select All */}
        <div className="px-4 pb-2">
          <button
            onClick={handleToggleAll}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Checkbox 
              checked={allEnabled} 
              className={cn(someEnabled && "opacity-50")}
            />
            <span className="font-medium">Select All</span>
          </button>
        </div>

        <ScrollArea className="h-[350px] px-4 pb-4">
          <div className="space-y-1">
            {filteredBridges.map((bridge) => (
              <button
                key={bridge.id}
                onClick={() => handleToggleBridge(bridge.id)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <Checkbox checked={bridge.enabled} />
                <img
                  src={bridge.icon}
                  alt={bridge.name}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <span className="font-medium">{bridge.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { BridgesModal };
