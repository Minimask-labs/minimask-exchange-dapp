import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Exchange } from '@/types';
import { cn } from '@/lib/utils';

interface ExchangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchanges: Exchange[];
  onExchangesChange: (exchanges: Exchange[]) => void;
}

const ExchangesModal = ({
  isOpen,
  onClose,
  exchanges,
  onExchangesChange
}: ExchangesModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExchanges = exchanges.filter((exchange) =>
    exchange.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allEnabled = exchanges.every((e) => e.enabled);
  const someEnabled = exchanges.some((e) => e.enabled) && !allEnabled;

  const handleToggleAll = () => {
    const newEnabled = !allEnabled;
    onExchangesChange(exchanges.map((e) => ({ ...e, enabled: newEnabled })));
  };

  const handleToggleExchange = (exchangeId: string) => {
    onExchangesChange(
      exchanges.map((e) =>
        e.id === exchangeId ? { ...e, enabled: !e.enabled } : e
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card border-minimask-border p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">Exchanges</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <SearchInput
            placeholder="Search exchanges"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
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
              className={cn(someEnabled && 'opacity-50')}
            />
            <span className="font-medium">Select All</span>
          </button>
        </div>

        <ScrollArea className="h-[350px] px-4 pb-4">
          <div className="space-y-1">
            {filteredExchanges.map((exchange) => (
              <button
                key={exchange.id}
                onClick={() => handleToggleExchange(exchange.id)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <Checkbox checked={exchange.enabled} />
                <img
                  src={exchange.icon}
                  alt={exchange.name}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <span className="font-medium">{exchange.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { ExchangesModal };
