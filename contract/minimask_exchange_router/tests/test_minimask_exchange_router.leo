// The 'test_minimask_exchange_router' test program.
import minimask_exchange_router.aleo;
import credits.aleo;
import token_registry.aleo;

program test_minimask_exchange_router.aleo {

    // Test the deposite of a pool (100 ALEO, 5 USDCx, 1% fee)
   @test
     script test_deposit_amount() {
        let usdcx_id: field = 12345field;
        let aleo_in: u128 = 100u128; // This should trigger an error in the logic
        let min_out: u128 = 1u128;

        let f: Future = minimask_exchange_router.aleo/deposit_aleo_for_swap(
            usdcx_id,
            aleo_in,
            min_out
        );
 

        f.await();
    }

    // Test a deposit that should fail if the user provides 0 ALEO
    @test
    @should_fail
     script test_deposit_invalid_amount() {
        let usdcx_id: field = 12345field;
        let aleo_in: u128 = 100u128; // This should trigger an error in the logic
        let min_out: u128 = 1u128;

        let f: Future = minimask_exchange_router.aleo/deposit_aleo_for_swap(
            usdcx_id,
            aleo_in,
            min_out
        );
 

        f.await();
    }
transition keep_compiler_happy() {
        return;
    }
@admin(address="aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw")
async constructor() {}
}