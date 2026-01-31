import credits.aleo;
import token_registry.aleo;
program minimask_exchange_router.aleo;

struct Pool:
    token_id as field;
    aleo_reserve as u128;
    token_reserve as u128;
    lp_fee_bps as u16;
    platform_fee_bps as u16;

struct SwapCredit:
    token_id as field;
    token_out as u128;
    platform_fee as u128;

struct TokenMetadata:
    token_id as field;
    name as u128;
    symbol as u128;
    decimals as u8;
    supply as u128;
    max_supply as u128;
    admin as address;
    external_authorization_required as boolean;
    external_authorization_party as address;

struct TokenOwner:
    account as address;
    token_id as field;

mapping registered_merchants:
    key as address.public;
    value as boolean.public;

mapping total_volume:
    key as address.public;
    value as u64.public;

mapping fees_collected:
    key as address.public;
    value as u64.public;

mapping pools:
    key as field.public;
    value as Pool.public;

mapping pending_swaps:
    key as address.public;
    value as SwapCredit.public;

function deposit_aleo_for_swap:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    cast r1 into r3 as u64;
    call credits.aleo/transfer_public_as_signer minimask_exchange_router.aleo r3 into r4;
    async deposit_aleo_for_swap self.signer r0 r1 r2 r4 into r5;
    output r5 as minimask_exchange_router.aleo/deposit_aleo_for_swap.future;

finalize deposit_aleo_for_swap:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as credits.aleo/transfer_public_as_signer.future;
    await r4;
    get pools[r1] into r5;
    cast r5.platform_fee_bps into r6 as u128;
    mul r2 r6 into r7;
    div r7 10000u128 into r8;
    sub r2 r8 into r9;
    mul r5.token_reserve r9 into r10;
    add r5.aleo_reserve r9 into r11;
    div r10 r11 into r12;
    gte r12 r3 into r13;
    assert.eq r13 true;
    add r5.aleo_reserve r9 into r14;
    sub r5.token_reserve r12 into r15;
    cast r5.token_id r14 r15 r5.lp_fee_bps r5.platform_fee_bps into r16 as Pool;
    set r16 into pools[r1];
    cast r1 r12 r8 into r17 as SwapCredit;
    set r17 into pending_swaps[r0];

function redeem_swap:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    call token_registry.aleo/transfer_public r0 self.signer r1 into r3;
    cast r2 into r4 as u64;
    call credits.aleo/transfer_public aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 r4 into r5;
    async redeem_swap self.signer r0 r1 r2 r3 r5 into r6;
    output r6 as minimask_exchange_router.aleo/redeem_swap.future;

finalize redeem_swap:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as token_registry.aleo/transfer_public.future;
    input r5 as credits.aleo/transfer_public.future;
    await r4;
    await r5;
    get pending_swaps[r0] into r6;
    is.eq r6.token_id r1 into r7;
    assert.eq r7 true;
    is.eq r6.token_out r2 into r8;
    assert.eq r8 true;
    is.eq r6.platform_fee r3 into r9;
    assert.eq r9 true;
    remove pending_swaps[r0];

function initialize_pool:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    input r3 as u16.public;
    input r4 as u16.public;
    is.eq self.signer aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8 into r5;
    assert.eq r5 true;
    cast r1 into r6 as u64;
    call credits.aleo/transfer_public_as_signer minimask_exchange_router.aleo r6 into r7;
    call token_registry.aleo/transfer_public_as_signer r0 minimask_exchange_router.aleo r2 into r8;
    async initialize_pool r0 r1 r2 r3 r4 r7 r8 into r9;
    output r9 as minimask_exchange_router.aleo/initialize_pool.future;

finalize initialize_pool:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    input r3 as u16.public;
    input r4 as u16.public;
    input r5 as credits.aleo/transfer_public_as_signer.future;
    input r6 as token_registry.aleo/transfer_public_as_signer.future;
    await r5;
    await r6;
    contains pools[r0] into r7;
    not r7 into r8;
    assert.eq r8 true;
    cast r0 r1 r2 r3 r4 into r9 as Pool;
    set r9 into pools[r0];

constructor:
    assert.eq program_owner aleo1h78z4pvqakm7660mhw5r4xjppp20t25wegtwgwqgw6ttg9mlf5rsn7zgx8;
