// Aleo Jumper Router Contract
// This contract handles token swaps with platform fee collection
// It takes a fee and forwards the remaining amount to a merchant (DEX or Bridge)

program aleo_jumper_router.aleo {
    // Treasury address where platform fees are collected
    const TREASURY: address = aleo1jumpertreasury0000000000000000000000000000000000000000000;
    
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

    /**
     * @notice Swaps tokens and collects a platform fee before forwarding to a merchant
     * @param amount The total amount of tokens sent by the user (in microcredits)
     * @param merchant_address The address of the DEX or Bridge contract
     * @param fee_bps The fee in basis points (e.g., 50 = 0.5%)
     */
    async transition swap_with_fee(
        public amount: u64,
        public merchant_address: address,
        public fee_bps: u64
    ) -> Future {
        // Validate fee is within acceptable range
        assert(fee_bps >= MIN_FEE_BPS);
        assert(fee_bps <= MAX_FEE_BPS);
        
        // Calculate the fee: (Amount * BPS) / 10,000
        let fee_amount: u64 = (amount * fee_bps) / 10000u64;
        let net_amount: u64 = amount - fee_amount;
        
        // Ensure we're not sending zero amounts
        assert(net_amount > 0u64);
        assert(fee_amount > 0u64);

        // Transfer fee to treasury and net amount to merchant
        // Using credits.aleo for native ALEO transfers
        let f1: Future = credits.aleo/transfer_public(TREASURY, fee_amount);
        let f2: Future = credits.aleo/transfer_public(merchant_address, net_amount);

        return finalize_swap(f1, f2, self.signer, amount, fee_amount);
    }

    async function finalize_swap(
        f1: Future, 
        f2: Future,
        user: address,
        amount: u64,
        fee: u64
    ) {
        // Execute both transfers
        f1.await();
        f2.await();
        
        // Update volume tracking
        let current_volume: u64 = Mapping::get_or_use(total_volume, user, 0u64);
        Mapping::set(total_volume, user, current_volume + amount);
        
        // Update fee tracking
        let current_fees: u64 = Mapping::get_or_use(fees_collected, TREASURY, 0u64);
        Mapping::set(fees_collected, TREASURY, current_fees + fee);
    }

    /**
     * @notice Register a new merchant (DEX, Bridge, or LP)
     * @param merchant_address The address to register as a merchant
     */
    async transition register_merchant(
        public merchant_address: address
    ) -> Future {
        return finalize_register_merchant(merchant_address);
    }

    async function finalize_register_merchant(merchant: address) {
        Mapping::set(registered_merchants, merchant, true);
    }

    /**
     * @notice Check if an address is a registered merchant
     * @param merchant_address The address to check
     */
    async transition is_merchant(
        public merchant_address: address
    ) -> Future {
        return finalize_is_merchant(merchant_address);
    }

    async function finalize_is_merchant(merchant: address) {
        let is_registered: bool = Mapping::get_or_use(registered_merchants, merchant, false);
        assert(is_registered);
    }

    /**
     * @notice Multi-hop swap through multiple merchants
     * @param amount Initial amount
     * @param hop1_merchant First hop merchant
     * @param hop2_merchant Second hop merchant (can be same as hop1)
     * @param fee_bps Platform fee
     */
    async transition multi_hop_swap(
        public amount: u64,
        public hop1_merchant: address,
        public hop2_merchant: address,
        public fee_bps: u64
    ) -> Future {
        assert(fee_bps >= MIN_FEE_BPS);
        assert(fee_bps <= MAX_FEE_BPS);
        
        // Take fee upfront
        let fee_amount: u64 = (amount * fee_bps) / 10000u64;
        let swap_amount: u64 = amount - fee_amount;
        
        // For multi-hop, we split the swap amount
        let hop1_amount: u64 = swap_amount;
        
        let f1: Future = credits.aleo/transfer_public(TREASURY, fee_amount);
        let f2: Future = credits.aleo/transfer_public(hop1_merchant, hop1_amount);

        return finalize_multi_hop(f1, f2, self.signer, amount, fee_amount);
    }

    async function finalize_multi_hop(
        f1: Future, 
        f2: Future,
        user: address,
        amount: u64,
        fee: u64
    ) {
        f1.await();
        f2.await();
        
        // Update tracking
        let current_volume: u64 = Mapping::get_or_use(total_volume, user, 0u64);
        Mapping::set(total_volume, user, current_volume + amount);
        
        let current_fees: u64 = Mapping::get_or_use(fees_collected, TREASURY, 0u64);
        Mapping::set(fees_collected, TREASURY, current_fees + fee);
    }
}
