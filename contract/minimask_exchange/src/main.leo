import credits.aleo;

// The 'minimask_exchange' program.
program minimask_exchange.aleo {
    // This is the constructor for the program.
    // The constructor allows you to manage program upgrades.
    // It is called when the program is deployed or upgraded.
    // It is currently configured to all admin upgrades.
    // Other configurations include:
    //  - @admin(address="aleo1...")
    //  - @checksum(mapping="credits.aleo/fixme", key="0field")
    //  - @custom
    // For more information, please refer to the documentation: `https://docs.leo-lang.org/guides/upgradability`
    @admin(address="aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8")
    async constructor() {}


    // Treasury address where platform fees are collected
    const TREASURY: address = aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8;
    
    // Bridge provider addresses (to be updated with real bridge addresses)
    const VERULINK_BRIDGE: address = aleo1verulink00000000000000000000000000000000000000000000000000;
    
    // Fee constants 
    // Minimum fee in basis points (1 = 0.01%)
    const MIN_FEE_BPS: u64 = 10u64;  
    // Higher max for bridge operations and Maximum fee in basis points (200 = 2%)
    const MAX_FEE_BPS: u64 = 200u64; // 
    
    // Bridge status constants
    const STATUS_PENDING: u8 = 0u8;
    const STATUS_CONFIRMED: u8 = 1u8;
    const STATUS_COMPLETED: u8 = 2u8;
    const STATUS_FAILED: u8 = 3u8;

    // Record for tracking bridge requests
    record BridgeRequest {
        owner: address,
        amount: u64,
        destination_chain: field,
        destination_address: field,
        timestamp: u64,
        status: u8,
    }

    // Mapping for bridge request tracking
    mapping bridge_requests: field => u8;
    
    // Mapping for total bridged volume per user
    mapping user_bridge_volume: address => u64;
    
    // Mapping for bridge fees collected
    mapping bridge_fees: address => u64;

    // Mapping to track merchant registration
    mapping registered_merchants: address => bool;
    
    // Mapping to track total volume routed
    mapping total_volume: address => u64;
    
    // Mapping to track fees collected
    mapping fees_collected: address => u64;
    // Unstaking period in blocks (72 hours ~ 25920 blocks at 10s/block)
    const UNSTAKING_PERIOD: u32 = 25920u32;
    // const UNSTAKING_PERIOD: u32 = 360u32; // ~1 hour speed bump
    
    // Minimum liquidity to register as merchant
    const MIN_LIQUIDITY: u64 = 1000000000u64; // 1000 ALEO

    // Record for merchant vault position
    record MerchantPosition {
        owner: address,
        locked_amount: u64,
        unlock_height: u32,
        fee_markup_bps: u64, // Merchant's additional fee (e.g., 20 = 0.2%)
    }

    // Mapping of merchant address to their locked balance
    mapping merchant_vault: address => u64;
    
    // Mapping of merchant to their fee markup
    mapping merchant_fees: address => u64;
    
    // Mapping of merchant to active status
    mapping merchant_active: address => bool;
    
    // Mapping to track pending withdrawals
    mapping pending_withdrawals: address => u64;
    
    // Mapping to track withdrawal unlock height
    mapping withdrawal_unlock: address => u32;


    // Stores: merchant_address => block_height_when_claimable
    mapping release_times: address => u32;

    



// routes functions 
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
        // Note: In a real app, you'd call 'token.aleo/transfer_public'
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



// route functions

// Merchants



    /**
     * @notice Register as a merchant and deposit initial liquidity
     * @param amount Amount to deposit (in microcredits)
     * @param fee_markup_bps Merchant's fee markup in basis points
     */
    async transition deposit_liquidity(
        public amount: u64,
        public fee_markup_bps: u64
    ) -> (MerchantPosition, Future) {
        // Validate minimum liquidity
        assert(amount >= MIN_LIQUIDITY);
        
        // Validate fee markup (max 1%)
        assert(fee_markup_bps <= 100u64);
        
        // Create merchant position record
        let position: MerchantPosition = MerchantPosition {
            owner: self.signer,
            locked_amount: amount,
            unlock_height: 0u32, // Locked indefinitely until withdrawal request
            fee_markup_bps: fee_markup_bps,
        };
        
        // Transfer tokens to this program
        let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        
        return (position, finalize_deposit(self.signer, amount, fee_markup_bps, f));
    }

    async function finalize_deposit(
        merchant: address, 
        amount: u64, 
        fee_bps: u64,
        f: Future
    ) {
        f.await();
        
        // Update vault balance
        let current: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        Mapping::set(merchant_vault, merchant, current + amount);
        
        // Set fee markup
        Mapping::set(merchant_fees, merchant, fee_bps);
        
        // Activate merchant
        Mapping::set(merchant_active, merchant, true);
    }

    /**
     * @notice Request withdrawal (starts 72-hour unstaking period)
     * @param amount Amount to withdraw
     */
    async transition request_withdrawal(
        public amount: u64
    ) -> Future {
        return finalize_request_withdrawal(self.signer, amount);
    }

    async function finalize_request_withdrawal(merchant: address, amount: u64) {
        // Get current vault balance
        let vault_balance: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        assert(amount <= vault_balance);
        
        // Set pending withdrawal
        Mapping::set(pending_withdrawals, merchant, amount);
        
        // Set unlock height (current + unstaking period)
        // In production, would use actual block.height
        let unlock: u32 = UNSTAKING_PERIOD;
        Mapping::set(withdrawal_unlock, merchant, unlock);
    }

    /**
     * @notice Complete withdrawal after unstaking period
     */
    async transition complete_withdrawal() -> Future {
        let f: Future = credits.aleo/transfer_public(self.signer, 0u64); // Placeholder
        return finalize_complete_withdrawal(self.signer, f);
    }

    async function finalize_complete_withdrawal(merchant: address, f: Future) {
        // Check unlock height (would compare to block.height in production)
        let unlock_height: u32 = Mapping::get_or_use(withdrawal_unlock, merchant, 0u32);
        // assert(block.height >= unlock_height);
        
        // Get pending amount
        let pending: u64 = Mapping::get_or_use(pending_withdrawals, merchant, 0u64);
        assert(pending > 0u64);
        
        // Update vault
        let vault_balance: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        Mapping::set(merchant_vault, merchant, vault_balance - pending);
        
        // Clear pending
        Mapping::set(pending_withdrawals, merchant, 0u64);
        
        // Check if merchant should be deactivated
        let remaining: u64 = vault_balance - pending;
        if (remaining < MIN_LIQUIDITY) {
            Mapping::set(merchant_active, merchant, false);
        }
        
        f.await();
    }

    /**
     * @notice Execute instant swap using merchant liquidity
     * Called by the router contract
     * @param merchant The merchant providing liquidity
     * @param user The user receiving tokens
     * @param amount Amount to swap
     * @param platform_fee Platform fee amount
     */
    async transition execute_instant_swap(
        public merchant: address,
        public user: address,
        public amount: u64,
        public platform_fee: u64
    ) -> Future {
        // Transfer from merchant vault to user
        let f1: Future = credits.aleo/transfer_public(user, amount);
        // Transfer platform fee to treasury
        let f2: Future = credits.aleo/transfer_public(TREASURY, platform_fee);
        
        return finalize_instant_swap(merchant, amount, platform_fee, f1, f2);
    }

    async function finalize_instant_swap(
        merchant: address,
        amount: u64,
        fee: u64,
        f1: Future,
        f2: Future
    ) {
        // Verify merchant is active
        let is_active: bool = Mapping::get_or_use(merchant_active, merchant, false);
        assert(is_active);
        
        // Verify merchant has enough liquidity
        let vault_balance: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        assert(vault_balance >= amount);
        
        // Execute transfers
        f1.await();
        f2.await();
        
        // Update vault balance
        Mapping::set(merchant_vault, merchant, vault_balance - amount);
    }

    /**
     * @notice Add more liquidity to existing position
     */
    async transition add_liquidity(public amount: u64) -> Future {
        let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        return finalize_add_liquidity(self.signer, amount, f);
    }

    async function finalize_add_liquidity(merchant: address, amount: u64, f: Future) {
        f.await();
        
        let current: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        Mapping::set(merchant_vault, merchant, current + amount);
        
        // Reactivate if needed
        let new_balance: u64 = current + amount;
        if (new_balance >= MIN_LIQUIDITY) {
            Mapping::set(merchant_active, merchant, true);
        }
    }

    /**
     * @notice Update merchant fee markup
     */
    async transition update_fee_markup(public new_fee_bps: u64) -> Future {
        assert(new_fee_bps <= 100u64);
        return finalize_update_fee(self.signer, new_fee_bps);
    }

    async function finalize_update_fee(merchant: address, fee_bps: u64) {
        Mapping::set(merchant_fees, merchant, fee_bps);
    }


// Merchants


// bridge

    /**
     * @notice Bridge tokens to another chain with fee collection
     * @param amount Amount to bridge (in microcredits)
     * @param fee_bps Platform fee in basis points
     * @param destination_chain Hash of destination chain name
     * @param destination_address Hash of destination address
     */
    async transition bridge_with_fee(
        public amount: u64,
        public fee_bps: u64,
        public destination_chain: field,
        public destination_address: field
    ) -> (BridgeRequest, Future) {
        // Validate fee
        assert(fee_bps >= MIN_FEE_BPS);
        assert(fee_bps <= MAX_FEE_BPS);
        
        // Calculate fees
        let platform_fee: u64 = (amount * fee_bps) / 10000u64;
        let bridge_amount: u64 = amount - platform_fee;
        
        assert(bridge_amount > 0u64);
        
        // Create bridge request record
        let request: BridgeRequest = BridgeRequest {
            owner: self.signer,
            amount: bridge_amount,
            destination_chain: destination_chain,
            destination_address: destination_address,
            timestamp: 0u64, // Would use block height in production
            status: STATUS_PENDING,
        };
        
        // Transfer fee to treasury and amount to bridge
        let f1: Future = credits.aleo/transfer_public(TREASURY, platform_fee);
        let f2: Future = credits.aleo/transfer_public(VERULINK_BRIDGE, bridge_amount);
        
        // Generate unique request ID
        let request_id: field = BHP256::hash_to_field(self.signer);
        
        return (request, finalize_bridge(f1, f2, request_id, self.signer, amount, platform_fee));
    }

    async function finalize_bridge(
        f1: Future,
        f2: Future,
        request_id: field,
        user: address,
        amount: u64,
        fee: u64
    ) {
        f1.await();
        f2.await();
        
        // Track the bridge request
        Mapping::set(bridge_requests, request_id, STATUS_PENDING);
        
        // Update user volume
        let current_volume: u64 = Mapping::get_or_use(user_bridge_volume, user, 0u64);
        Mapping::set(user_bridge_volume, user, current_volume + amount);
        
        // Update fees collected
        let current_fees: u64 = Mapping::get_or_use(bridge_fees, TREASURY, 0u64);
        Mapping::set(bridge_fees, TREASURY, current_fees + fee);
    }

    /**
     * @notice Update bridge request status (called by relayer)
     * @param request_id The unique request identifier
     * @param new_status The new status code
     */
    async transition update_bridge_status(
        public request_id: field,
        public new_status: u8
    ) -> Future {
        // Only valid status transitions
        assert(new_status <= STATUS_FAILED);
        
        return finalize_update_status(request_id, new_status);
    }

    async function finalize_update_status(request_id: field, status: u8) {
        // Get current status
        let current_status: u8 = Mapping::get_or_use(bridge_requests, request_id, STATUS_PENDING);
        
        // Validate status transition (can only move forward)
        assert(status > current_status);
        
        Mapping::set(bridge_requests, request_id, status);
    }

    /**
     * @notice Private bridge for enhanced privacy (shielded swap)
     * Uses Aleo's ZK capabilities to obscure the link between source and destination
     */
    transition private_bridge(
        private amount: u64,
        private destination_chain: field,
        private destination_address: field,
        public fee_bps: u64
    ) -> BridgeRequest {
        assert(fee_bps >= MIN_FEE_BPS);
        assert(fee_bps <= MAX_FEE_BPS);
        
        let platform_fee: u64 = (amount * fee_bps) / 10000u64;
        let bridge_amount: u64 = amount - platform_fee;
        
        // Create private bridge request
        // The request details are private, only the owner can see them
        let request: BridgeRequest = BridgeRequest {
            owner: self.signer,
            amount: bridge_amount,
            destination_chain: destination_chain,
            destination_address: destination_address,
            timestamp: 0u64,
            status: STATUS_PENDING,
        };
        
        return request;
    }



}
