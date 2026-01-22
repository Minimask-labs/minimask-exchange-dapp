import credits.aleo;

// The 'minimask_exchange' program.
program minimask_exchange.aleo {

    // This is the constructor for the program.
    // The constructor allows you to manage program upgrades.
    // It is called when the program is deployed or upgraded.
    // It is currently configured to **prevent** upgrades.
    // Other configurations include:
    //  - @admin(address="aleo1...")
    //  - @checksum(mapping="credits.aleo/fixme", key="0field")
    //  - @custom
    // For more information, please refer to the documentation: `https://docs.leo-lang.org/guides/upgradability`
    @admin(address="aleo1...")
    async constructor() {}


        // Define the address where your platform fees will be sent
    const TREASURY: address = aleo1your_treasury_address_here...;
 // Mapping of merchant address to their locked balance
    mapping merchant_vault: address => u64;
    // Stores: merchant_address => amount_pending_withdrawal
    mapping pending_withdrawals: address => u64;
    // Stores: merchant_address => block_height_when_claimable
    mapping release_times: address => u32;

    const UNBONDING_PERIOD: u32 = 360u32; // ~1 hour speed bump

    /**
     * @notice Swaps tokens and collects a fee before forwarding to a merchant
     * @param amount The total amount of tokens sent by the user
     * @param merchant_address The address of the DEX or Bridge contract
     * @param fee_bps The fee in basis points (e.g., 50 = 0.5%)
     */
    async transition swap_with_fee(
        public amount: u64,
        public merchant_address: address,
        public fee_bps: u64
    ) -> Future {
        // 1. Calculate the fee: (Amount * BPS) / 10,000
        let fee_amount: u64 = (amount * fee_bps) / 10000u64;
        let net_amount: u64 = amount - fee_amount;

        // 2. Perform the transfers
        // Note: In a real app, you'd call 'token.aleo/transfer_public'
        let f1: Future = credits.aleo/transfer_public(TREASURY, fee_amount);
        let f2: Future = credits.aleo/transfer_public(merchant_address, net_amount);

        // 3. Chain the futures to ensure they both execute
        return finalize_swap(f1, f2);
    }

    async function finalize_swap(f1: Future, f2: Future) {
        f1.await();
        f2.await();
    }

    // Merchants call this to register and deposit liquidity
    async transition deposit_liquidity(public amount: u64) -> Future {
        // Transfer from Merchant to this Program
        let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        return finalize_deposit(self.signer, amount, f);
    }

    async function finalize_deposit(merchant: address, amount: u64, f: Future) {
        f.await();
        let current: u64 = Mapping::get_or_use(merchant_vault, merchant, 0u64);
        Mapping::set(merchant_vault, merchant, current + amount);
    }

    // This is called by your Router when a user swaps
    // It instantly swaps User's tokens for Merchant's locked tokens
    async transition execute_instant_swap(
        public merchant: address, 
        public user: address, 
        public amount: u64
    ) -> Future {
        // ... (Logic to verify merchant has enough locked balance)
        // 1. Give User the Merchant's locked tokens
        // 2. Give Merchant the User's provided tokens + fee
    }

    /**
     * Step 1: Merchant announces they want to leave.
     * Their funds are moved from 'active' to 'pending'.
     */
    async transition request_withdrawal(public amount: u64) -> Future {
        return finalize_request(self.signer, amount, block.height);
    }

    async function finalize_request(merchant: address, amount: u64, current_height: u32) {
        // 1. Check current liquidity and subtract requested amount
        let current_liq: u64 = Mapping::get(merchant_vault, merchant);
        assert(current_liq >= amount);
        Mapping::set(merchant_vault, merchant, current_liq - amount);

        // 2. Set the 'unbonding' record
        Mapping::set(pending_withdrawals, merchant, amount);
        Mapping::set(release_times, merchant, current_height + UNBONDING_PERIOD);
    }

    /**
     * Step 2: Merchant actually takes the money after the wait.
     */
    async transition claim_withdrawal() -> Future {
        return finalize_claim(self.signer, block.height);
    }

    async function finalize_claim(merchant: address, current_height: u32) {
        let release_at: u32 = Mapping::get(release_times, merchant);
        
        // ENSURE the time has passed
        assert(current_height >= release_at);

        let amount: u64 = Mapping::get(pending_withdrawals, merchant);
        
        // Clear records and trigger the physical transfer
        Mapping::remove(pending_withdrawals, merchant);
        Mapping::remove(release_times, merchant);
        
        // Finalize transfer to merchant's wallet (Logic handled in snarkVM)
    }

}
