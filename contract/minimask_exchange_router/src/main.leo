import credits.aleo;
import token_registry.aleo;

// This contract handles token swaps with platform fee collection
// It takes a fee and forwards the remaining amount to a merchant (DEX or Bridge)

program minimask_exchange_router.aleo {
    // Treasury address where platform fees are collected
    const TREASURY: address = aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw;
    
    // Minimum fee in basis points (1 = 0.01%)
    const MIN_FEE_BPS: u64 = 10u64;
    
    // Maximum fee in basis points (100 = 1%)
    const MAX_FEE_BPS: u64 = 100u64;

    // Mapping to track merchant registration
    mapping registered_merchants: address => bool;
    
    // Mapping to track total volume routed
    mapping total_volume: address => u64;
    
    // Mapping to track fees collected
    mapping fees_collected: address => u64;

    // --- Configuration ---
    const NATIVE_ALEO_ID: field = 0field;
 
    // --- State ---
    struct Pool {
        token_id: field,
        aleo_reserve: u128,
        token_reserve: u128,
        lp_fee_bps: u16,      // Fee that stays in the pool (e.g., 30 = 0.3%)
        platform_fee_bps: u16 // Your profit (e.g., 20 = 0.2%)
    }

    mapping pools: field => Pool;

    struct SwapCredit {
        token_id: field,
        token_out: u128,
        platform_fee: u128,
    }
    mapping pending_swaps: address => SwapCredit;

@admin(address="aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw")
async constructor() {}
    /**
     * @notice Step 1 of 2: User deposits native ALEO to swap for a Token.
     */
    async transition deposit_aleo_for_swap(
        public token_id: field,
        public aleo_in: u128,
        public min_token_out: u128
    ) -> Future {
        // 1. Transfer ALEO from user to this program
        let f1: Future = credits.aleo/transfer_public_as_signer(self.address, aleo_in as u64);
        
        // 2. Finalize math and record the user's credit
        return finalize_deposit(self.signer, token_id, aleo_in, min_token_out, f1);
    }

    async function finalize_deposit(
        user: address, 
        token_id: field, 
        aleo_in: u128, 
        min_out: u128, 
        f1: Future
    ) {
        f1.await();

        let pool: Pool = Mapping::get(pools, token_id);
        
        // Calculate Platform Fee (Your Profit)
        let platform_fee: u128 = (aleo_in * pool.platform_fee_bps as u128) / 10000u128;
        let amount_for_swap: u128 = aleo_in - platform_fee;

        // Constant Product Formula: amount_out = (reserve_out * amount_in) / (reserve_in + amount_in)
        let numerator: u128 = pool.token_reserve * amount_for_swap;
        let denominator: u128 = pool.aleo_reserve + amount_for_swap;
        let token_out: u128 = numerator / denominator;

        assert(token_out >= min_out);

        // Update Pool Reserves
        Mapping::set(pools, token_id, Pool {
            token_id: pool.token_id,
            aleo_reserve: pool.aleo_reserve + amount_for_swap,
            token_reserve: pool.token_reserve - token_out,
            lp_fee_bps: pool.lp_fee_bps,
            platform_fee_bps: pool.platform_fee_bps
        });

        // Record the credit for the user to redeem
        let credit: SwapCredit = SwapCredit {
            token_id: token_id,
            token_out: token_out,
            platform_fee: platform_fee
        };
        Mapping::set(pending_swaps, user, credit);
    }

    /**
     * @notice Step 2 of 2: User redeems their tokens after depositing ALEO.
     */
    async transition redeem_swap(
        public token_id: field,
        public token_out: u128,
        public platform_fee: u128
    ) -> Future {
        // Transfer the tokens to the user from the program's balance
        let f1: Future = token_registry.aleo/transfer_public(token_id, self.signer, token_out);
        
        // Pay Treasury (Your Fee)
        let f2: Future = credits.aleo/transfer_public(TREASURY, platform_fee as u64);

        return finalize_redeem_swap(self.signer, token_id, token_out, platform_fee, f1, f2);
    }

    async function finalize_redeem_swap(
        user: address,
        token_id: field,
        token_out: u128,
        platform_fee: u128,
        f1: Future,
        f2: Future
    ) {
        f1.await();
        f2.await();

        // Get the credit for the caller and verify it matches the transition inputs
        let credit: SwapCredit = Mapping::get(pending_swaps, user);
        assert(credit.token_id == token_id);
        assert(credit.token_out == token_out);
        assert(credit.platform_fee == platform_fee);

        // Clear the credit to prevent re-use
        Mapping::remove(pending_swaps, user);
    }

/**
     * @notice Admin only: Initialize a new liquidity pool
     */
    async transition initialize_pool(
        public token_id: field,
        public aleo_amount: u128,
        public token_amount: u128,
        public lp_fee: u16,
        public platform_fee: u16
    ) -> Future {
        // Authenticate: Only the treasury/admin address can create pools
        assert(self.signer == TREASURY);

        // Transfer initial liquidity from admin to the contract
        let f1: Future = credits.aleo/transfer_public_as_signer(self.address, aleo_amount as u64);
        let f2: Future = token_registry.aleo/transfer_public_as_signer(token_id, self.address, token_amount);

        return finalize_initialize_pool(token_id, aleo_amount, token_amount, lp_fee, platform_fee, f1, f2);
    }

    async function finalize_initialize_pool(
        token_id: field,
        aleo_amount: u128,
        token_amount: u128,
        lp_fee: u16,
        platform_fee: u16,
        f1: Future,
        f2: Future
    ) {
        f1.await();
        f2.await();

        // Ensure the pool doesn't already exist
        let exists: bool = Mapping::contains(pools, token_id);
        assert(!exists);

        let new_pool: Pool = Pool {
            token_id: token_id,
            aleo_reserve: aleo_amount,
            token_reserve: token_amount,
            lp_fee_bps: lp_fee,
            platform_fee_bps: platform_fee
        };

        Mapping::set(pools, token_id, new_pool);
    }






// // Only the owner can withdraw the accumulated platform fees
//     async transition withdraw_treasury(public amount: u64) -> Future {
//         // Add an assert here for your admin address
//         assert(self.signer == TREASURY);
//         return credits.aleo/transfer_public(self.signer, amount);
//     }

    /**
     * @notice Swaps tokens and collects a platform fee before forwarding to a merchant
     * @param amount The total amount of tokens sent by the user (in microcredits)
     * @param merchant_address The address of the DEX or Bridge contract
     * @param fee_bps The fee in basis points (e.g., 50 = 0.5%)
     */
    // async transition swap_with_fee(
    //     public amount: u64,
    //     public merchant_address: address,
    //     public fee_bps: u64
    // ) -> Future {
    //     // Validate fee is within acceptable range
    //     assert(fee_bps >= MIN_FEE_BPS);
    //     assert(fee_bps <= MAX_FEE_BPS);
        
    //     // Calculate the fee: (Amount * BPS) / 10,000
    //     let fee_amount: u64 = (amount * fee_bps) / 10000u64;
    //     let net_amount: u64 = amount - fee_amount;
        
    //     // Ensure we're not sending zero amounts
    //     assert(net_amount > 0u64);
    //     assert(fee_amount > 0u64);

    //     // Transfer fee to treasury and net amount to merchant
    //     // Using credits.aleo for native ALEO transfers
    //     // Note: In a real app, you'd call 'token.aleo/transfer_public'
    //     let f1: Future = credits.aleo/transfer_public(TREASURY, fee_amount);
    //     let f2: Future = credits.aleo/transfer_public(merchant_address, net_amount);

    //     return finalize_swap(f1, f2, self.signer, amount, fee_amount);
    // }

    // async function finalize_swap(
    //     f1: Future, 
    //     f2: Future,
    //     user: address,
    //     amount: u64,
    //     fee: u64
    // ) {
    //     // Execute both transfers
    //     f1.await();
    //     f2.await();
        
    //     // Update volume tracking
    //     let current_volume: u64 = Mapping::get_or_use(total_volume, user, 0u64);
    //     Mapping::set(total_volume, user, current_volume + amount);
        
    //     // Update fee tracking
    //     let current_fees: u64 = Mapping::get_or_use(fees_collected, TREASURY, 0u64);
    //     Mapping::set(fees_collected, TREASURY, current_fees + fee);
    // }

    /**
     * @notice Register a new merchant (DEX, Bridge, or LP)
     * @param merchant_address The address to register as a merchant
     */
    // async transition register_merchant(
    //     public merchant_address: address
    // ) -> Future {
    //     return finalize_register_merchant(merchant_address);
    // }

    // async function finalize_register_merchant(merchant: address) {
    //     Mapping::set(registered_merchants, merchant, true);
    // }

    /**
     * @notice Check if an address is a registered merchant
     * @param merchant_address The address to check
     */
    // async transition is_merchant(
    //     public merchant_address: address
    // ) -> Future {
    //     return finalize_is_merchant(merchant_address);
    // }

    // async function finalize_is_merchant(merchant: address) {
    //     let is_registered: bool = Mapping::get_or_use(registered_merchants, merchant, false);
    //     assert(is_registered);
    // }

    /**
     * @notice Multi-hop swap through multiple merchants
     * @param amount Initial amount
     * @param hop1_merchant First hop merchant
     * @param hop2_merchant Second hop merchant (can be same as hop1)
     * @param fee_bps Platform fee
     */
    // async transition multi_hop_swap(
    //     public amount: u64,
    //     public hop1_merchant: address,
    //     public hop2_merchant: address,
    //     public fee_bps: u64
    // ) -> Future {
    //     assert(fee_bps >= MIN_FEE_BPS);
    //     assert(fee_bps <= MAX_FEE_BPS);
        
    //     // Take fee upfront
    //     let fee_amount: u64 = (amount * fee_bps) / 10000u64;
    //     let swap_amount: u64 = amount - fee_amount;
        
    //     // For multi-hop, we split the swap amount
    //     let hop1_amount: u64 = swap_amount;
        
    //     let f1: Future = credits.aleo/transfer_public(TREASURY, fee_amount);
    //     let f2: Future = credits.aleo/transfer_public(hop1_merchant, hop1_amount);

    //     return finalize_multi_hop(f1, f2, self.signer, amount, fee_amount);
    // }

    // async function finalize_multi_hop(
    //     f1: Future, 
    //     f2: Future,
    //     user: address,
    //     amount: u64,
    //     fee: u64
    // ) {
    //     f1.await();
    //     f2.await();
        
    //     // Update tracking
    //     let current_volume: u64 = Mapping::get_or_use(total_volume, user, 0u64);
    //     Mapping::set(total_volume, user, current_volume + amount);
        
    //     let current_fees: u64 = Mapping::get_or_use(fees_collected, TREASURY, 0u64);
    //     Mapping::set(fees_collected, TREASURY, current_fees + fee);
    // }
}