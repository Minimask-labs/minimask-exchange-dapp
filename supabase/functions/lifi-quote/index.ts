import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIFI_API_URL = "https://li.quest/v1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    
    let endpoint: string;
    let method = "GET";
    let body: string | undefined;

    switch (action) {
      case "quote":
        // Get swap quote
        const quoteParams = new URLSearchParams({
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromToken: params.fromToken,
          toToken: params.toToken,
          fromAmount: params.fromAmount,
          fromAddress: params.fromAddress || "",
          slippage: params.slippage || "0.03",
        });
        endpoint = `/quote?${quoteParams.toString()}`;
        break;

      case "routes":
        // Get multiple routes
        endpoint = "/advanced/routes";
        method = "POST";
        body = JSON.stringify({
          fromChainId: params.fromChainId,
          toChainId: params.toChainId,
          fromTokenAddress: params.fromToken,
          toTokenAddress: params.toToken,
          fromAmount: params.fromAmount,
          fromAddress: params.fromAddress,
          options: {
            slippage: params.slippage || 0.03,
            order: params.order || "RECOMMENDED",
          },
        });
        break;

      case "chains":
        endpoint = "/chains";
        break;

      case "tokens":
        const tokenParams = params.chainId ? `?chains=${params.chainId}` : "";
        endpoint = `/tokens${tokenParams}`;
        break;

      case "connections":
        const connParams = new URLSearchParams();
        if (params.fromChain) connParams.set("fromChain", params.fromChain);
        if (params.toChain) connParams.set("toChain", params.toChain);
        endpoint = `/connections?${connParams.toString()}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const fetchOptions: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) fetchOptions.body = body;

    console.log(`LI.FI API request: ${method} ${LIFI_API_URL}${endpoint}`);
    
    const response = await fetch(`${LIFI_API_URL}${endpoint}`, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error("LI.FI API error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "LI.FI API error" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
