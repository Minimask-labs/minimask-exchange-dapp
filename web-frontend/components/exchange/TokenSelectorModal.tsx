import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { ChainIcon } from '@/components/ui/ChainIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Token, Chain } from '@/types';
import { mockChains, mockTokens } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
  title?: string;
}

const TokenSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  title = 'Select Token'
}: TokenSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<
    number | string | null
  >(null);

  const filteredTokens = useMemo(() => {
    let tokens = mockTokens;

    // Filter by chain
    if (selectedChainId !== null) {
      tokens = tokens.filter((t) => t.chainId === selectedChainId);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query) ||
          t.address.toLowerCase().includes(query)
      );
    }

    return tokens;
  }, [searchQuery, selectedChainId]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    onClose();
    setSearchQuery('');
    setSelectedChainId(null);
  };

  const getChainForToken = (token: Token): Chain | undefined => {
    return mockChains.find((c) => c.id === token.chainId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-minimask-border p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">iiii{title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4">
          <SearchInput
            placeholder="Search by token name or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="flex flex-1 min-h-[400px]">
          {/* Chain Filter Sidebar */}
          <div className="w-16 border-r border-minimask-border flex flex-col items-center py-2 gap-1">
            <button
              onClick={() => setSelectedChainId(null)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-xs font-medium',
                selectedChainId === null
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary text-muted-foreground'
              )}
            >
              All
            </button>
            {mockChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChainId(chain.id)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  selectedChainId === chain.id
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'hover:bg-secondary'
                )}
                title={chain.name}
              >
                <ChainIcon chainId={chain.id} name={chain.name} size="md" />
              </button>
            ))}
          </div>

          {/* Token List */}
          <ScrollArea className="flex-1 h-[400px]">
            <div className="p-2">
              {filteredTokens.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No tokens found
                </div>
              ) : (
                filteredTokens.map((token, index) => {
                  const chain = getChainForToken(token);
                  const isSelected =
                    selectedToken?.address === token.address &&
                    selectedToken?.chainId === token.chainId;

                  return (
                    <button
                      key={`${token.chainId}-${token.address}-${index}`}
                      onClick={() => handleSelect(token)}
                      className={cn(
                        'w-full p-3 rounded-xl flex items-center gap-3 transition-colors',
                        isSelected
                          ? 'bg-primary/20 ring-1 ring-primary'
                          : 'hover:bg-secondary'
                      )}
                    >
                      <TokenIcon
                        src={token.icon}
                        symbol={token.symbol}
                        size="lg"
                        networkIcon={chain?.icon}
                        networkName={chain?.name}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {token.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{token.balance || '0'}</p>
                        <p className="text-xs text-muted-foreground">
                          ${token.usdValue || '0.00'}
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { TokenSelectorModal };
