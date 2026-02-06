import credits.aleo;
import token_registry.aleo;
import test_usdcx_stablecoin.aleo;

program minimask_exchange_router_v1.aleo {
    const TREASURY: address = aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw;
    @admin(address="aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw")
    async constructor() {}


    const USDCX_TOKEN_ID: field = 10field; 
    const ALEO_TOKEN_ID: field = 0field;

    struct Pool {
        token_id: field,
        aleo_reserve: u128,
        token_reserve: u128,
        lp_fee_bps: u16,
        platform_fee_bps: u16
    }

    struct SwapCredit {
        token_id: field,
        token_out: u128,
        platform_fee: u128,
    }

    mapping pools: field => Pool;
    mapping pending_swaps: address => SwapCredit;

 // --- DEPOSIT FLOWS ---

    // 1. For USDCx
    async transition deposit_usdcx(
        public amount: u128, 
        public min_spillage: u128, 
        exchange: address
    ) -> Future {
        let f: Future = test_usdcx_stablecoin.aleo/transfer_public_as_signer(exchange, amount);
        return finalize_deposit_token(self.signer, USDCX_TOKEN_ID, amount, min_spillage, f);
    }

    // 2. For ALEO (Credits)
    async transition deposit_aleo(
        public amount: u128, 
        public min_spillage: u128, 
        exchange: address
    ) -> Future {
        let f: Future = credits.aleo/transfer_public_as_signer(exchange, amount as u64);
        return finalize_deposit_token(self.signer, ALEO_TOKEN_ID, amount, min_spillage, f);
    }

    // 3. For any other Token Registry token
    async transition deposit_registry_token(
        public t_id: field, 
        public amount: u128, 
        public min_spillage: u128, 
        exchange: address
    ) -> Future {
        // Ensure user isn't trying to use this for ALEO/USDCx if you want strictness
        assert(t_id != ALEO_TOKEN_ID && t_id != USDCX_TOKEN_ID);
        
        let f: Future = token_registry.aleo/transfer_public_as_signer(t_id, exchange, amount);
        return finalize_deposit_token(self.signer, t_id, amount, min_spillage, f);
    }



    async function finalize_deposit_token(
        user: address, 
        token_id: field, 
        token_in: u128, 
        min_aleo_spillage: u128, 
        f: Future
    ) {
        // Await all of them. The placeholders will just execute a 0-transfer.
        f.await();

        let pool: Pool = Mapping::get(pools, token_id);
        
        let platform_fee: u128 = (token_in * pool.platform_fee_bps as u128) / 10000u128;
        let amount_for_swap: u128 = token_in - platform_fee;

        let numerator: u128 = pool.aleo_reserve * amount_for_swap;
        let denominator: u128 = pool.token_reserve + amount_for_swap;
        let aleo_out: u128 = numerator / denominator;

        assert(aleo_out >= min_aleo_spillage);

        Mapping::set(pools, token_id, Pool {
            token_id: pool.token_id,
            aleo_reserve: pool.aleo_reserve - aleo_out,
            token_reserve: pool.token_reserve + amount_for_swap,
            lp_fee_bps: pool.lp_fee_bps,
            platform_fee_bps: pool.platform_fee_bps
        });

        Mapping::set(pending_swaps, user, SwapCredit {
            token_id: ALEO_TOKEN_ID,
            token_out: aleo_out,
            platform_fee: platform_fee
        });
    }
    
        /**
     * @notice Redeem logic with fixed type casting and branch routing
     */
// --- REDEEM FLOWS ---

    // 1. Redeem to USDCx
    async transition redeem_usdcx(
        public token_out: u64,
        public platform_fee: u128,
    ) -> Future {
        let f_fee: Future = credits.aleo/transfer_public(TREASURY, platform_fee as u64);
        let f_payout: Future = test_usdcx_stablecoin.aleo/transfer_public(self.signer, token_out as u128);
        
        return finalize_redeem_swap(self.signer, USDCX_TOKEN_ID, token_out as u128, platform_fee, f_fee, f_payout);
    }

    // 2. Redeem to ALEO
    async transition redeem_aleo(
        public token_out: u64,
        public platform_fee: u128,
    ) -> Future {
        let f_fee: Future = credits.aleo/transfer_public(TREASURY, platform_fee as u64);
        let f_payout: Future = credits.aleo/transfer_public(self.signer, token_out);
        
        return finalize_redeem_swap(self.signer, ALEO_TOKEN_ID, token_out as u128, platform_fee, f_fee, f_payout);
    }

    // 3. Redeem to Registry Token
    async transition redeem_registry_token(
        public token_id: field,
        public token_out: u64,
        public platform_fee: u128,
    ) -> Future {
        assert(token_id != ALEO_TOKEN_ID && token_id != USDCX_TOKEN_ID);
        
        let f_fee: Future = credits.aleo/transfer_public(TREASURY, platform_fee as u64);
        let f_payout: Future = token_registry.aleo/transfer_public(token_id, self.signer, token_out as u128);
        
        return finalize_redeem_swap(self.signer, token_id, token_out as u128, platform_fee, f_fee, f_payout);
    }

    // --- SHARED FINALIZE --- 

async function finalize_redeem_swap(
       user: address, 
        token_id: field, 
        token_out: u128, 
        p_fee: u128,
        f_fee: Future, 
        f_payout: Future
    ) {
        // Await the specific transfers triggered in the transition
        f_fee.await(); 
        f_payout.await();        

        let credit: SwapCredit = Mapping::get(pending_swaps, user);
        assert(credit.token_id == token_id);
        assert(credit.token_out == token_out);
        Mapping::remove(pending_swaps, user);
    }
    
    // --- ADD LIQUIDITY TRANSITION ---

  // Add Liquidity for USDCx/ALEO pair
    async transition add_liquidity_usdcx(
        public aleo_amount: u64,
        public usdcx_amount: u128,
        public lp_fee: u16,
        public platform_fee: u16
    ) -> Future {
        assert(self.signer == TREASURY);
        let f1: Future = credits.aleo/transfer_public_as_signer(self.address, aleo_amount);
        let f2: Future = test_usdcx_stablecoin.aleo/transfer_public_as_signer(self.address, usdcx_amount);
        return finalize_add_liquidity(USDCX_TOKEN_ID, aleo_amount as u128, usdcx_amount, lp_fee, platform_fee, f1, f2);
    }

    // Add Liquidity for RegistryToken/ALEO pair
    async transition add_liquidity_registry(
        public t_id: field,
        public aleo_amount: u64,
        public token_amount: u128,
        public lp_fee: u16,
        public platform_fee: u16
    ) -> Future {
        assert(self.signer == TREASURY);
        assert(t_id != USDCX_TOKEN_ID && t_id != ALEO_TOKEN_ID);
        let f1: Future = credits.aleo/transfer_public_as_signer(self.address, aleo_amount);
        let f2: Future = token_registry.aleo/transfer_public_as_signer(t_id, self.address, token_amount);
        return finalize_add_liquidity(t_id, aleo_amount as u128, token_amount, lp_fee, platform_fee, f1, f2);
    }


    async function finalize_add_liquidity(
        token_id: field, aleo_amt: u128, token_amt: u128, lp: u16, p: u16,
        f1: Future, f2: Future
    ) {
        f1.await(); f2.await();

        let current_pool: Pool = Mapping::get_or_use(pools, token_id, Pool {
            token_id: token_id, aleo_reserve: 0u128, token_reserve: 0u128, lp_fee_bps: lp, platform_fee_bps: p
        });

        Mapping::set(pools, token_id, Pool {
            token_id: token_id,
            aleo_reserve: current_pool.aleo_reserve + aleo_amt,
            token_reserve: current_pool.token_reserve + token_amt,
            lp_fee_bps: lp,
            platform_fee_bps: p
        });
    }

    }