import { useState, useEffect, useCallback, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { IconButton } from '@/components/ui/IconButton';
import { TokenIcon } from '@/components/ui/TokenIcon';
import {
  Settings,
  History,
  ChevronDown,
  ArrowDown,
  Wallet
} from 'lucide-react';
// import { mockChains } from '@/data/mockData';
import { SwapSettings } from '@/types';
import { TokenSelectorModalTwo, SettingsPanel } from '@/components/exchange';
import { SwapReviewModal } from '@/components/exchange/SwapReviewModal';
import { useWallets } from '@/hooks/useWallets';
import { useDebounce } from '@/hooks/useDebounce';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { toast } from 'sonner';
import { AleoNetworkClient } from '@provablehq/sdk';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

const networkClient = new AleoNetworkClient(
  'https://api.explorer.provable.com/v2'
);

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

  return <span className="text-xs text-muted-foreground">Balance: {balance}</span>;
};

const SwapCard = () => {
  const [amount, setAmount] = useState('0');
  const [toAmount, setToAmount] = useState('0');
  const { connect, wallet, network } = useWallet();

  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { aleoAddress, isAnyWalletConnected, aleoTokenList } = useWallets();
  const { openConnectModal } = useConnectModal();
  const debouncedAmount = useDebounce(amount, 500);

  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [settings, setSettings] = useState<SwapSettings>({} as SwapSettings);

    const handleConnect = async () => {
      if (wallet) {
        await connect(network);
      }
    };

  useEffect(() => {
    if (aleoTokenList?.data && fromToken === null && toToken === null) {
      const tokens = aleoTokenList.data.map((t: any) => ({
        symbol: t?.symbol,
        name: t?.display,
        icon: t.token_icon_url,
        chainId: 'aleo',
        address: t?.program_name,
        decimals: t?.decimals,
        usdValue: t?.price
      }));
      setFromToken(tokens[0] || null);
      setToToken(tokens[2] || null);
    }
  }, [aleoTokenList, fromToken, toToken]);

  const getPublicTokenBalance = useCallback(
    async (programId: string, address: string) => {
      if (address == null) return '0';
      try {
        const result =
          (
            await networkClient.getProgramMappingValue(
              programId,
              'balances',
              address
            )
          )?.replace(/u\d+(?:\.public)?/g, '') ?? '0';
        const publicBalance = BigInt(result);
        const balance = (Number(publicBalance) / 1_000_000).toFixed(6);
        return balance;
      } catch (e) {
        console.error(e);
        return '0';
      }
    },
    []
  );

  useEffect(() => {
    if (debouncedAmount) {
      // Placeholder: 1:1 ratio. Replace with actual price/route logic
      const fromPrice = fromToken?.usdValue || 0;
      const toPrice = toToken?.usdValue || 0;
      if (fromPrice > 0 && toPrice > 0) {
        const calculatedToAmount = (
          (parseFloat(debouncedAmount) * fromPrice) /
          toPrice
        ).toFixed(6);
        setToAmount(calculatedToAmount);
      } else {
        setToAmount(debouncedAmount);
      }
    } else {
      setToAmount('');
    }
  }, [debouncedAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleExecuteSwap = async () => {
    if (!fromToken || !toToken || !aleoAddress) {
      toast.error('Please connect wallet and select tokens');
      return;
    }
    toast.info('Executing swap on Aleo network...');
    console.log('Executing swap on Aleo network...', fromToken, toToken);
    // TODO: Implement actual Aleo swap transaction logic here
    // This will likely involve using the Aleo wallet adapter to request a transaction
  };

    const aleoChain =
                    'https://assets.coingecko.com/coins/images/27916/standard/secondary-icon-dark.png?1726770428"';
  // const fromChainName =
  //   mockChains.find((c) => c.id === fromToken?.chainId)?.name || 'Select Chain';
  // const toChainName =
  //   mockChains.find((c) => c.id === toToken?.chainId)?.name || 'Select Chain';

  return (
    <>
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Exchange</h2>
          <div className="flex items-center gap-1">
            <IconButton variant="ghost" size="sm">
              <History className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* FROM */}
        <div className="p-4 rounded-xl bg-secondary mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red">Send</span>
            {fromToken && aleoAddress && (
              <TokenBalance
                programId={fromToken?.address}
                address={aleoAddress}
                getPublicTokenBalance={getPublicTokenBalance}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold outline-none w-full"
              placeholder="0"
            />
            <button
              onClick={() => setIsFromTokenModalOpen(true)}
              className="p-2 rounded-xl bg-background/50 hover:bg-background/80 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {fromToken ? (
                <TokenIcon
                  src={fromToken?.icon}
                  symbol={fromToken?.symbol}
                  size="md"
                  networkIcon={aleoChain}
                  networkName={'aleo'}
                />
              ) : null}
              <span className="font-medium">
                {fromToken?.symbol || 'Select'}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-black mt-1">
            ≈ $
            {(parseFloat(amount || '0') * (fromToken?.usdValue || 0)).toFixed(
              2
            )}
          </p>
        </div>

        <div className="flex justify-center my-2">
          <button
            onClick={handleSwapTokens}
            className="w-8 h-8 rounded-full bg-card border border-minimask-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* TO */}
        <div className="p-4 rounded-xl bg-secondary mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black">Receive</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={toAmount}
              readOnly
              className="flex-1 bg-transparent text-2xl font-semibold outline-none w-full"
              placeholder="0"
            />
            <button
              onClick={() => setIsToTokenModalOpen(true)}
              className="p-2 rounded-xl bg-background/50 hover:bg-background/80 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {toToken ? (
                <TokenIcon
                  src={toToken?.icon}
                  symbol={toToken?.symbol}
                  size="md"
                  networkIcon={aleoChain}
                  networkName={'aleo'}
                />
              ) : null}
              <span className="font-medium">{toToken?.symbol || 'Select'}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ≈ $
            {(parseFloat(toAmount || '0') * (toToken?.usdValue || 0)).toFixed(
              2
            )}
          </p>
        </div>

        {!isAnyWalletConnected ? (
          <GradientButton
            fullWidth
            size="lg"
            onClick={() => handleConnect?.()}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </GradientButton>
        ) : (
          <GradientButton
            fullWidth
            size="lg"
            disabled={
              !fromToken || !toToken || !amount || parseFloat(amount) <= 0
            }
            onClick={() => setIsReviewOpen(true)}
          >
            Review Exchange
          </GradientButton>
        )}
      </GlassCard>

      {/* Modals */}
      <TokenSelectorModalTwo
        isOpen={isFromTokenModalOpen}
        onClose={() => setIsFromTokenModalOpen(false)}
        onSelect={setFromToken}
        selectedToken={fromToken}
        title="Exchange from"
        aleoNetwork="mainnet"
      />

      <TokenSelectorModalTwo
        isOpen={isToTokenModalOpen}
        onClose={() => setIsToTokenModalOpen(false)}
        onSelect={setToToken}
        selectedToken={toToken}
        title="Exchange to"
        aleoNetwork="mainnet"
      />

      {/* <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      /> */}

      <SwapReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        route={{
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: amount,
          toAmount: toAmount
        }}
        onConfirm={handleExecuteSwap}
      />
    </>
  );
};

export { SwapCard };
