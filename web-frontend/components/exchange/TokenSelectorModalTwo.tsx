import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { TokenIcon } from '@/components/ui/TokenIcon';
// import { ChainIcon } from '@/components/ui/ChainIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Token, Chain } from '@/types';
// import { mockChains } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useWallet as useAleoWallet } from '@provablehq/aleo-wallet-adaptor-react';
// import { AleoNetworkClient } from '@provablehq/sdk';
import {useWallets} from "@/hooks/useWallets";
interface TokenSelectorModalTwoProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: any) => void;
  selectedToken?: any;
  title?: string;
  aleoNetwork?: string;
}

// const networkClient = new AleoNetworkClient(
//   'https://api.explorer.provable.com/v2'
// );

const TokenBalance = ({
  programId,
  address,
  getPublicTokenBalance
}: {
  programId: string;
  address: string;
  getPublicTokenBalance: (
    programId: string,
    address: string
  ) => Promise<string>;
}) => {
  const [balance, setBalance] = useState('...');
 
  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      if (address && programId) {
        try {
          const result = await getPublicTokenBalance(programId, address);
          if (isMounted) {
            setBalance(result || '0');
          }
        } catch (error) {
          console.error('Failed to fetch balance for', programId, error);
          if (isMounted) {
            setBalance('Error');
          }
        }
      } else {
        setBalance('0');
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
    };
  }, [programId, address, getPublicTokenBalance]);

  return <p className="font-medium">{balance}</p>;
};

const TokenSelectorModalTwo = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  title = 'Select Token',
  aleoNetwork = 'mainnet'
}: TokenSelectorModalTwoProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<
    number | string | null
  >(null);
  const { address: aleoAddress } = useAleoWallet();
  // const [aleoTokenList, setAleoTokenList] = useState<{ data: any[] } | null>(
  //   null
  // );
  const { aleoTokenList,getPublicTokenBalance, fetchAleoTokenList } = useWallets();
  // const getPublicTokenBalance = useCallback(
  //   async (programId: string, address: string) => {
  //     if (address == null) return '0';
  //     try {
  //       const result =
  //         (
  //           await networkClient.getProgramMappingValue(
  //             programId,
  //             'account',
  //             address
  //           )
  //         )?.replace(/u\d+(?:\.public)?/g, '') ?? '0';
  //       const publicBalance = BigInt(result);
  //       console.log('publicBalance', publicBalance);
  //       const balance = (Number(publicBalance) / 1_000_000).toFixed(6);
  //       console.log('balance', balance);
  //       return balance;
  //     } catch (e) {
  //       console.error(e);
  //       return '0';
  //     }
  //   },
  //   []
  // );

  const handleSelect = (token: any) => {
    onSelect(token);
    onClose();
    setSearchQuery('');
    setSelectedChainId(null);
  };

  // const fetchAleoTokenList = useCallback(async () => {
  //   if (!aleoAddress) return;
  //   try {
  //     const response = await fetch(
  //       `https://api.explorer.provable.com/v2/${aleoNetwork}/tokens`
  //     );
  //     const data = await response.json();
  //     setAleoTokenList(data);
  //   } catch (error) {
  //     console.error('Failed to fetch Aleo token list:', error);
  //     setAleoTokenList(null);
  //   }
  // }, [aleoAddress, aleoNetwork]);

  useEffect(() => {
    fetchAleoTokenList();
  }, [fetchAleoTokenList]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-minimask-border p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <SearchInput
            placeholder="Search by token name or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="flex flex-1 min-h-[400px]">
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
            {/* {mockChains.map((chain) => (
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
            ))} */}
          </div>

          <ScrollArea className="flex-1 h-[400px]">
            <div className="p-2 flex flex-col gap-2">
              {aleoTokenList?.data?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No tokens found
                </div>
              ) : (
                aleoTokenList?.data.filter((token: any) => token?.verified === true).map((token: any, index: number) => {
                  const aleoChain =
                    'https://assets.coingecko.com/coins/images/27916/standard/secondary-icon-dark.png?1726770428"';
                  const isSelected =
                    selectedToken?.address === token?.program_name;

                  const displayToken = {
                    symbol: token?.symbol,
                    name: token?.display,
                    icon: token?.token_icon_url,
                    chainId: 'aleo',
                    address: token?.program_name,
                    decimals: token?.decimals,
                    usdValue: token?.price
                  };

                  return (
                    <button
                      key={`${token?.program_name}-${index}`}
                      onClick={() => handleSelect(displayToken)}
                      className={cn(
                        'w-full p-3 rounded-xl flex items-center gap-3 transition-colors',
                        isSelected
                          ? 'bg-primary/20 ring-1 ring-primary'
                          : 'hover:bg-secondary'
                      )}
                    >
                      <TokenIcon
                        src={token?.token_icon_url}
                        symbol={token?.symbol}
                        size="lg"
                        networkIcon={aleoChain}
                        networkName={'aleo'}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{token?.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {token?.display}
                        </p>
                      </div>
                      <div className="text-right">
                        <TokenBalance
                          programId={token?.program_name}
                          address={aleoAddress as string}
                          getPublicTokenBalance={getPublicTokenBalance}
                        />
                        <p className="text-xs text-muted-foreground">
                          ${token?.price || '0.00'}
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

export { TokenSelectorModalTwo };
