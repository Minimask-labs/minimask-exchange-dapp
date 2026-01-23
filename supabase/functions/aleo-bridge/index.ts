import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Aleo network configuration
const ALEO_API_URL = "https://api.explorer.provable.com/v1";
const PLATFORM_FEE_BPS = 50; // 0.5%

interface BridgeQuoteRequest {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress?: string;
  toAddress?: string;
}

interface AleoTransactionRequest {
  txId: string;
  action: 'status' | 'submit';
  transaction?: string;
}

interface RelayerRequest {
  aleoTxId: string;
  destinationChain: string;
  destinationAddress: string;
  amount: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (path) {
      case 'quote':
        return handleQuote(req);
      case 'transaction':
        return handleTransaction(req);
      case 'relayer':
        return handleRelayer(req);
      case 'merchants':
        return handleMerchants(req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Aleo bridge error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleQuote(req: Request): Promise<Response> {
  const body: BridgeQuoteRequest = await req.json();
  console.log('Bridge quote request:', body);

  const { fromChain, toChain, fromToken, toToken, amount } = body;
  
  // Check if this is an Aleo-related route
  const isAleoSource = fromChain.toLowerCase() === 'aleo';
  const isAleoDest = toChain.toLowerCase() === 'aleo';

  if (!isAleoSource && !isAleoDest) {
    return new Response(
      JSON.stringify({ error: 'At least one chain must be Aleo' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Calculate fees
  const amountNum = parseFloat(amount);
  const platformFee = (amountNum * PLATFORM_FEE_BPS) / 10000;
  const bridgeFee = amountNum * 0.001; // 0.1% bridge fee estimate
  const gasFee = 0.1; // ~0.1 ALEO for gas
  
  const netAmount = amountNum - platformFee - bridgeFee - gasFee;

  // Fetch current exchange rate (mock for now, would integrate with oracle)
  const exchangeRate = await getExchangeRate(fromToken, toToken);
  const outputAmount = netAmount * exchangeRate;

  // Build quote response
  const quote = {
    id: `aleo-quote-${Date.now()}`,
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: outputAmount.toFixed(6),
    toAmountUsd: (outputAmount * 1.5).toFixed(2), // Mock USD conversion
    fees: {
      platformFee: platformFee.toFixed(6),
      platformFeeBps: PLATFORM_FEE_BPS,
      bridgeFee: bridgeFee.toFixed(6),
      gasFee: gasFee.toFixed(6),
      totalFee: (platformFee + bridgeFee + gasFee).toFixed(6),
    },
    estimatedTime: isAleoSource ? '15-20 minutes' : '10-15 minutes',
    route: {
      steps: [
        {
          type: isAleoSource ? 'bridge' : 'swap',
          provider: 'Jumper Router',
          action: 'Collect fee',
        },
        {
          type: 'bridge',
          provider: isAleoSource || isAleoDest ? 'Verulink' : 'Unknown',
          fromChain,
          toChain,
        },
        ...(isAleoDest ? [{
          type: 'claim',
          provider: 'Jumper Relayer',
          action: 'Auto-claim on destination',
        }] : []),
      ],
    },
    validUntil: Date.now() + 60000, // Valid for 1 minute
  };

  return new Response(
    JSON.stringify(quote),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTransaction(req: Request): Promise<Response> {
  const body: AleoTransactionRequest = await req.json();
  console.log('Transaction request:', body);

  if (body.action === 'status') {
    // Query Aleo network for transaction status
    try {
      const response = await fetch(`${ALEO_API_URL}/testnet/transaction/${body.txId}`);
      
      if (!response.ok) {
        return new Response(
          JSON.stringify({ status: 'pending', message: 'Transaction not yet indexed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const txData = await response.json();
      
      return new Response(
        JSON.stringify({
          status: txData.status || 'confirmed',
          blockHeight: txData.block_height,
          timestamp: txData.timestamp,
          fee: txData.fee,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error: unknown) {
      console.error('Error fetching tx status:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ status: 'unknown', error: message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Invalid action' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRelayer(req: Request): Promise<Response> {
  const body: RelayerRequest = await req.json();
  console.log('Relayer request:', body);

  const { aleoTxId, destinationChain, destinationAddress, amount } = body;

  // In production, this would:
  // 1. Verify the Aleo transaction is confirmed
  // 2. Calculate the gas cost on destination chain
  // 3. Submit the claim transaction on behalf of the user
  // 4. Track the relayer transaction

  // For now, return a mock response
  const relayerResponse = {
    status: 'queued',
    aleoTxId,
    destinationChain,
    destinationAddress,
    amount,
    estimatedGasCost: destinationChain === 'ethereum' ? '0.005 ETH' : '0.001 MATIC',
    estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    relayerJobId: `relay-${Date.now()}`,
  };

  return new Response(
    JSON.stringify(relayerResponse),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleMerchants(req: Request): Promise<Response> {
  // Return list of registered merchants with their liquidity
  // In production, this would query the Aleo blockchain or a cached state
  
  const merchants = [
    {
      address: 'aleo1merchant1000000000000000000000000000000000000000000000000',
      name: 'Liquidity Provider A',
      liquidity: '50000',
      feeMarkupBps: 20,
      active: true,
    },
    {
      address: 'aleo1merchant2000000000000000000000000000000000000000000000000',
      name: 'Liquidity Provider B',
      liquidity: '25000',
      feeMarkupBps: 15,
      active: true,
    },
  ];

  return new Response(
    JSON.stringify({ merchants }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper function to get exchange rates
async function getExchangeRate(fromToken: string, toToken: string): Promise<number> {
  // Mock exchange rates - in production, use Pyth or other oracle
  const rates: Record<string, Record<string, number>> = {
    'ALEO': { 'ETH': 0.0005, 'USDC': 1.5, 'MATIC': 2.0 },
    'ETH': { 'ALEO': 2000, 'USDC': 3000, 'MATIC': 1500 },
    'USDC': { 'ALEO': 0.67, 'ETH': 0.00033, 'MATIC': 1.1 },
    'MATIC': { 'ALEO': 0.5, 'ETH': 0.00066, 'USDC': 0.9 },
  };

  return rates[fromToken]?.[toToken] || 1;
}
