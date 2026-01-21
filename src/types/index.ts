export interface Token {
  symbol: string;
  name: string;
  icon: string;
  chainId: number | string;
  address: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
}

export interface Chain {
  id: number | string;
  name: string;
  icon: string;
}

export interface SwapStep {
  type: "swap" | "bridge";
  provider: string;
  fromToken?: string;
  toToken?: string;
  fromChain?: string;
  toChain?: string;
  chain?: string;
}

export interface SwapRoute {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  toAmountUsd: string;
  gasCost: string;
  gasCostUsd: string;
  estimatedTime: string;
  steps: SwapStep[];
  tags?: string[];
  percentageDiff?: string;
}

export interface Bridge {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface Exchange {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface SwapSettings {
  routePriority: "best" | "fastest" | "cheapest";
  gasPrice: "normal" | "fast" | "instant";
  slippage: "auto" | number;
  enabledBridges: string[];
  enabledExchanges: string[];
}

export interface ConnectedWallet {
  address: string;
  type: "evm" | "solana";
  chainId?: number | string;
  balance?: string;
  name?: string;
  icon?: string;
}
