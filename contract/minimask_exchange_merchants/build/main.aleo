import credits.aleo;
program minimask_exchange.aleo;

record BridgeRequest:
    owner as address.private;
    amount as u64.private;
    destination_chain as field.private;
    destination_address as field.private;
    timestamp as u64.private;
    status as u8.private;

record MerchantPosition:
    owner as address.private;
    locked_amount as u64.private;
    unlock_height as u32.private;
    fee_markup_bps as u64.private;

mapping bridge_requests:
    key as field.public;
    value as u8.public;

mapping user_bridge_volume:
    key as address.public;
    value as u64.public;

mapping bridge_fees:
    key as address.public;
    value as u64.public;

mapping registered_merchants:
    key as address.public;
    value as boolean.public;

mapping total_volume:
    key as address.public;
    value as u64.public;

mapping fees_collected:
    key as address.public;
    value as u64.public;

mapping merchant_vault:
    key as address.public;
    value as u64.public;

mapping merchant_fees:
    key as address.public;
    value as u64.public;

mapping merchant_active:
    key as address.public;
    value as boolean.public;

mapping pending_withdrawals:
    key as address.public;
    value as u64.public;

mapping withdrawal_unlock:
    key as address.public;
    value as u32.public;

mapping release_times:
    key as address.public;
    value as u32.public;

function swap_with_fee:
    input r0 as u64.public;
    input r1 as address.public;
    input r2 as u64.public;
    gte r2 10u64 into r3;
    assert.eq r3 true;
    lte r2 200u64 into r4;
    assert.eq r4 true;
    mul r0 r2 into r5;
    div r5 10000u64 into r6;
    sub r0 r6 into r7;
    gt r7 0u64 into r8;
    assert.eq r8 true;
    gt r6 0u64 into r9;
    assert.eq r9 true;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r6 into r10;
    call credits.aleo/transfer_public r1 r7 into r11;
    async swap_with_fee r10 r11 self.signer r0 r6 into r12;
    output r12 as minimask_exchange.aleo/swap_with_fee.future;

finalize swap_with_fee:
    input r0 as credits.aleo/transfer_public.future;
    input r1 as credits.aleo/transfer_public.future;
    input r2 as address.public;
    input r3 as u64.public;
    input r4 as u64.public;
    await r0;
    await r1;
    get.or_use total_volume[r2] 0u64 into r5;
    add r5 r3 into r6;
    set r6 into total_volume[r2];
    get.or_use fees_collected[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8] 0u64 into r7;
    add r7 r4 into r8;
    set r8 into fees_collected[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8];

function register_merchant:
    input r0 as address.public;
    async register_merchant r0 into r1;
    output r1 as minimask_exchange.aleo/register_merchant.future;

finalize register_merchant:
    input r0 as address.public;
    set true into registered_merchants[r0];

function is_merchant:
    input r0 as address.public;
    async is_merchant r0 into r1;
    output r1 as minimask_exchange.aleo/is_merchant.future;

finalize is_merchant:
    input r0 as address.public;
    get.or_use registered_merchants[r0] false into r1;
    assert.eq r1 true;

function multi_hop_swap:
    input r0 as u64.public;
    input r1 as address.public;
    input r2 as address.public;
    input r3 as u64.public;
    gte r3 10u64 into r4;
    assert.eq r4 true;
    lte r3 200u64 into r5;
    assert.eq r5 true;
    mul r0 r3 into r6;
    div r6 10000u64 into r7;
    sub r0 r7 into r8;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r7 into r9;
    call credits.aleo/transfer_public r1 r8 into r10;
    async multi_hop_swap r9 r10 self.signer r0 r7 into r11;
    output r11 as minimask_exchange.aleo/multi_hop_swap.future;

finalize multi_hop_swap:
    input r0 as credits.aleo/transfer_public.future;
    input r1 as credits.aleo/transfer_public.future;
    input r2 as address.public;
    input r3 as u64.public;
    input r4 as u64.public;
    await r0;
    await r1;
    get.or_use total_volume[r2] 0u64 into r5;
    add r5 r3 into r6;
    set r6 into total_volume[r2];
    get.or_use fees_collected[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8] 0u64 into r7;
    add r7 r4 into r8;
    set r8 into fees_collected[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8];

function deposit_liquidity:
    input r0 as u64.public;
    input r1 as u64.public;
    gte r0 1000000000u64 into r2;
    assert.eq r2 true;
    lte r1 100u64 into r3;
    assert.eq r3 true;
    cast self.signer r0 0u32 r1 into r4 as MerchantPosition.record;
    call credits.aleo/transfer_public_as_signer minimask_exchange.aleo r0 into r5;
    async deposit_liquidity self.signer r0 r1 r5 into r6;
    output r4 as MerchantPosition.record;
    output r6 as minimask_exchange.aleo/deposit_liquidity.future;

finalize deposit_liquidity:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    input r3 as credits.aleo/transfer_public_as_signer.future;
    await r3;
    get.or_use merchant_vault[r0] 0u64 into r4;
    add r4 r1 into r5;
    set r5 into merchant_vault[r0];
    set r2 into merchant_fees[r0];
    set true into merchant_active[r0];

function request_withdrawal:
    input r0 as u64.public;
    async request_withdrawal self.signer r0 into r1;
    output r1 as minimask_exchange.aleo/request_withdrawal.future;

finalize request_withdrawal:
    input r0 as address.public;
    input r1 as u64.public;
    get.or_use merchant_vault[r0] 0u64 into r2;
    lte r1 r2 into r3;
    assert.eq r3 true;
    set r1 into pending_withdrawals[r0];
    set 25920u32 into withdrawal_unlock[r0];

function complete_withdrawal:
    call credits.aleo/transfer_public self.signer 0u64 into r0;
    async complete_withdrawal self.signer r0 into r1;
    output r1 as minimask_exchange.aleo/complete_withdrawal.future;

finalize complete_withdrawal:
    input r0 as address.public;
    input r1 as credits.aleo/transfer_public.future;
    get.or_use withdrawal_unlock[r0] 0u32 into r2;
    get.or_use pending_withdrawals[r0] 0u64 into r3;
    gt r3 0u64 into r4;
    assert.eq r4 true;
    get.or_use merchant_vault[r0] 0u64 into r5;
    sub r5 r3 into r6;
    set r6 into merchant_vault[r0];
    set 0u64 into pending_withdrawals[r0];
    lt r6 1000000000u64 into r7;
    branch.eq r7 false to end_then_0_0;
    set false into merchant_active[r0];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;
    await r1;

function execute_instant_swap:
    input r0 as address.public;
    input r1 as address.public;
    input r2 as u64.public;
    input r3 as u64.public;
    call credits.aleo/transfer_public r1 r2 into r4;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r3 into r5;
    async execute_instant_swap r0 r2 r3 r4 r5 into r6;
    output r6 as minimask_exchange.aleo/execute_instant_swap.future;

finalize execute_instant_swap:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    input r3 as credits.aleo/transfer_public.future;
    input r4 as credits.aleo/transfer_public.future;
    get.or_use merchant_active[r0] false into r5;
    assert.eq r5 true;
    get.or_use merchant_vault[r0] 0u64 into r6;
    gte r6 r1 into r7;
    assert.eq r7 true;
    await r3;
    await r4;
    sub r6 r1 into r8;
    set r8 into merchant_vault[r0];

function add_liquidity:
    input r0 as u64.public;
    call credits.aleo/transfer_public_as_signer minimask_exchange.aleo r0 into r1;
    async add_liquidity self.signer r0 r1 into r2;
    output r2 as minimask_exchange.aleo/add_liquidity.future;

finalize add_liquidity:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as credits.aleo/transfer_public_as_signer.future;
    await r2;
    get.or_use merchant_vault[r0] 0u64 into r3;
    add r3 r1 into r4;
    set r4 into merchant_vault[r0];
    gte r4 1000000000u64 into r5;
    branch.eq r5 false to end_then_0_2;
    set true into merchant_active[r0];
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;

function update_fee_markup:
    input r0 as u64.public;
    lte r0 100u64 into r1;
    assert.eq r1 true;
    async update_fee_markup self.signer r0 into r2;
    output r2 as minimask_exchange.aleo/update_fee_markup.future;

finalize update_fee_markup:
    input r0 as address.public;
    input r1 as u64.public;
    set r1 into merchant_fees[r0];

function bridge_with_fee:
    input r0 as u64.public;
    input r1 as u64.public;
    input r2 as field.public;
    input r3 as field.public;
    gte r1 10u64 into r4;
    assert.eq r4 true;
    lte r1 200u64 into r5;
    assert.eq r5 true;
    mul r0 r1 into r6;
    div r6 10000u64 into r7;
    sub r0 r7 into r8;
    gt r8 0u64 into r9;
    assert.eq r9 true;
    cast self.signer r8 r2 r3 0u64 0u8 into r10 as BridgeRequest.record;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r7 into r11;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r8 into r12;
    hash.bhp256 self.signer into r13 as field;
    async bridge_with_fee r11 r12 r13 self.signer r0 r7 into r14;
    output r10 as BridgeRequest.record;
    output r14 as minimask_exchange.aleo/bridge_with_fee.future;

finalize bridge_with_fee:
    input r0 as credits.aleo/transfer_public.future;
    input r1 as credits.aleo/transfer_public.future;
    input r2 as field.public;
    input r3 as address.public;
    input r4 as u64.public;
    input r5 as u64.public;
    await r0;
    await r1;
    set 0u8 into bridge_requests[r2];
    get.or_use user_bridge_volume[r3] 0u64 into r6;
    add r6 r4 into r7;
    set r7 into user_bridge_volume[r3];
    get.or_use bridge_fees[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8] 0u64 into r8;
    add r8 r5 into r9;
    set r9 into bridge_fees[aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8];

function update_bridge_status:
    input r0 as field.public;
    input r1 as u8.public;
    lte r1 3u8 into r2;
    assert.eq r2 true;
    async update_bridge_status r0 r1 into r3;
    output r3 as minimask_exchange.aleo/update_bridge_status.future;

finalize update_bridge_status:
    input r0 as field.public;
    input r1 as u8.public;
    get.or_use bridge_requests[r0] 0u8 into r2;
    gt r1 r2 into r3;
    assert.eq r3 true;
    set r1 into bridge_requests[r0];

function private_bridge:
    input r0 as u64.private;
    input r1 as field.private;
    input r2 as field.private;
    input r3 as u64.public;
    gte r3 10u64 into r4;
    assert.eq r4 true;
    lte r3 200u64 into r5;
    assert.eq r5 true;
    mul r0 r3 into r6;
    div r6 10000u64 into r7;
    sub r0 r7 into r8;
    cast self.signer r8 r1 r2 0u64 0u8 into r9 as BridgeRequest.record;
    output r9 as BridgeRequest.record;

constructor:
    assert.eq program_owner aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8;
