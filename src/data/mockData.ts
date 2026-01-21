import { Token, Chain, SwapRoute, Bridge, Exchange } from "@/types";

// Mock Chains
export const mockChains: Chain[] = [
  { id: 1, name: "Ethereum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg" },
  { id: 10, name: "Optimism", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg" },
  { id: 56, name: "BNB Chain", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg" },
  { id: 137, name: "Polygon", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg" },
  { id: 42161, name: "Arbitrum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg" },
  { id: 43114, name: "Avalanche", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/avalanche.svg" },
  { id: 8453, name: "Base", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg" },
  { id: "solana", name: "Solana", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg" },
];

// Mock Tokens
export const mockTokens: Token[] = [
  // Ethereum tokens
  { symbol: "ETH", name: "Ethereum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg", chainId: 1, address: "0x0000000000000000000000000000000000000000", decimals: 18, balance: "1.5432", usdValue: "5234.12" },
  { symbol: "USDT", name: "Tether USD", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdt.svg", chainId: 1, address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, balance: "2500.00", usdValue: "2500.00" },
  { symbol: "USDC", name: "USD Coin", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg", chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, balance: "1200.00", usdValue: "1200.00" },
  { symbol: "WETH", name: "Wrapped ETH", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/weth.svg", chainId: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, balance: "0.8521", usdValue: "2890.34" },
  
  // Arbitrum tokens
  { symbol: "ETH", name: "Ethereum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg", chainId: 42161, address: "0x0000000000000000000000000000000000000000", decimals: 18, balance: "0.2145", usdValue: "727.45" },
  { symbol: "ARB", name: "Arbitrum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/arb.svg", chainId: 42161, address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, balance: "500.00", usdValue: "425.00" },
  { symbol: "USDC", name: "USD Coin", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg", chainId: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, balance: "340.00", usdValue: "340.00" },
  
  // Base tokens
  { symbol: "ETH", name: "Ethereum", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg", chainId: 8453, address: "0x0000000000000000000000000000000000000000", decimals: 18, balance: "0.1234", usdValue: "418.56" },
  { symbol: "USDC", name: "USD Coin", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg", chainId: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, balance: "180.50", usdValue: "180.50" },
  
  // Solana tokens
  { symbol: "SOL", name: "Solana", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/sol.svg", chainId: "solana", address: "So11111111111111111111111111111111111111112", decimals: 9, balance: "12.5432", usdValue: "2345.67" },
  { symbol: "USDT", name: "Tether USD", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdt.svg", chainId: "solana", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, balance: "850.00", usdValue: "850.00" },
  { symbol: "USDC", name: "USD Coin", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg", chainId: "solana", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, balance: "420.00", usdValue: "420.00" },
  
  // Polygon tokens
  { symbol: "MATIC", name: "Polygon", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/matic.svg", chainId: 137, address: "0x0000000000000000000000000000000000001010", decimals: 18, balance: "1250.00", usdValue: "687.50" },
  { symbol: "USDC", name: "USD Coin", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg", chainId: 137, address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, balance: "290.00", usdValue: "290.00" },
];

// Mock Swap Routes
export const mockRoutes: SwapRoute[] = [
  {
    id: "route-1",
    fromToken: mockTokens[1], // USDT on ETH
    toToken: mockTokens[9], // SOL
    fromAmount: "100",
    toAmount: "0.5342",
    toAmountUsd: "100.12",
    gasCost: "0.002",
    gasCostUsd: "6.78",
    estimatedTime: "2 min",
    steps: [
      { type: "swap", provider: "Uniswap", fromToken: "USDT", toToken: "USDC", chain: "Ethereum" },
      { type: "bridge", provider: "Wormhole", fromChain: "Ethereum", toChain: "Solana" },
      { type: "swap", provider: "Jupiter", fromToken: "USDC", toToken: "SOL", chain: "Solana" },
    ],
    tags: ["Best Return"],
    percentageDiff: "+0.12%",
  },
  {
    id: "route-2",
    fromToken: mockTokens[1],
    toToken: mockTokens[9],
    fromAmount: "100",
    toAmount: "0.5298",
    toAmountUsd: "99.32",
    gasCost: "0.0015",
    gasCostUsd: "5.09",
    estimatedTime: "5 min",
    steps: [
      { type: "bridge", provider: "Allbridge", fromChain: "Ethereum", toChain: "Solana" },
      { type: "swap", provider: "Raydium", fromToken: "USDT", toToken: "SOL", chain: "Solana" },
    ],
    tags: ["Cheapest"],
    percentageDiff: "-0.68%",
  },
  {
    id: "route-3",
    fromToken: mockTokens[1],
    toToken: mockTokens[9],
    fromAmount: "100",
    toAmount: "0.5315",
    toAmountUsd: "99.65",
    gasCost: "0.003",
    gasCostUsd: "10.17",
    estimatedTime: "1 min",
    steps: [
      { type: "swap", provider: "1inch", fromToken: "USDT", toToken: "ETH", chain: "Ethereum" },
      { type: "bridge", provider: "deBridge", fromChain: "Ethereum", toChain: "Solana" },
      { type: "swap", provider: "Orca", fromToken: "ETH", toToken: "SOL", chain: "Solana" },
    ],
    tags: ["Fastest"],
    percentageDiff: "-0.35%",
  },
];

// Mock Bridges
export const mockBridges: Bridge[] = [
  { id: "across", name: "Across", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/across.png", enabled: true },
  { id: "allbridge", name: "Allbridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/allbridge.png", enabled: true },
  { id: "arbitrum", name: "Arbitrum Bridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg", enabled: true },
  { id: "cbridge", name: "Celer cBridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/cbridge.png", enabled: true },
  { id: "connext", name: "Connext", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/connext.png", enabled: true },
  { id: "debridge", name: "deBridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/debridge.png", enabled: true },
  { id: "hop", name: "Hop", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/hop.png", enabled: true },
  { id: "hyphen", name: "Hyphen", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/hyphen.png", enabled: true },
  { id: "lifi", name: "LI.FI", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/lifi.png", enabled: true },
  { id: "multichain", name: "Multichain", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/multichain.png", enabled: false },
  { id: "optimism", name: "Optimism Bridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg", enabled: true },
  { id: "polygon", name: "Polygon Bridge", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg", enabled: true },
  { id: "stargate", name: "Stargate", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/stargate.png", enabled: true },
  { id: "synapse", name: "Synapse", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/synapse.png", enabled: true },
  { id: "wormhole", name: "Wormhole", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/wormhole.png", enabled: true },
];

// Mock Exchanges
export const mockExchanges: Exchange[] = [
  { id: "1inch", name: "1inch", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/oneinch.png", enabled: true },
  { id: "uniswap", name: "Uniswap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/uniswap.png", enabled: true },
  { id: "sushiswap", name: "SushiSwap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/sushi.png", enabled: true },
  { id: "pancakeswap", name: "PancakeSwap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/pancake.png", enabled: true },
  { id: "curve", name: "Curve", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/curve.png", enabled: true },
  { id: "balancer", name: "Balancer", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/balancer.png", enabled: true },
  { id: "kyberswap", name: "KyberSwap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/kyber.png", enabled: true },
  { id: "dodo", name: "DODO", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/dodo.png", enabled: true },
  { id: "paraswap", name: "ParaSwap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/paraswap.png", enabled: true },
  { id: "openocean", name: "OpenOcean", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/openocean.png", enabled: true },
  { id: "jupiter", name: "Jupiter", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/jupiter.png", enabled: true },
  { id: "orca", name: "Orca", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/orca.png", enabled: true },
  { id: "raydium", name: "Raydium", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/raydium.png", enabled: true },
  { id: "traderjoe", name: "Trader Joe", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/traderjoe.png", enabled: true },
  { id: "quickswap", name: "QuickSwap", icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/quickswap.png", enabled: true },
];
