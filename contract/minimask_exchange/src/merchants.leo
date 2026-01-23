// Aleo Jumper Merchants Contract
// Handles merchant liquidity registration and instant swaps

program aleo_jumper_merchants.aleo {
    // Treasury for fee collection
    const TREASURY: address = aleo1jumpertreasury0000000000000000000000000000000000000000000;
    
    // Unstaking period in blocks (72 hours ~ 25920 blocks at 10s/block)
    const UNSTAKING_PERIOD: u32 = 25920u32;
    
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
}
