import credits.aleo;
import token_registry.aleo;
import merkle_tree.aleo;
import test_usdcx_multisig_core.aleo;
import test_usdcx_freezelist.aleo;
import test_usdcx_stablecoin.aleo;
program minimask_exchange_router_v1.aleo;

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

struct MerkleProof:
    siblings as [field; 16u32];
    leaf_index as u32;

struct WalletEcdsaSigner:
    wallet_id as address;
    ecdsa_signer as [u8; 20u32];

struct AdminOp:
    op as u8;
    threshold as u8;
    aleo_signer as address;
    ecdsa_signer as [u8; 20u32];

mapping pools:
    key as field.public;
    value as Pool.public;

mapping pending_swaps:
    key as address.public;
    value as SwapCredit.public;

function deposit_usdcx:
    input r0 as u128.public;
    input r1 as u128.public;
    input r2 as address.private;
    call test_usdcx_stablecoin.aleo/transfer_public_as_signer r2 r0 into r3;
    async deposit_usdcx self.signer 10field r0 r1 r3 into r4;
    output r4 as minimask_exchange_router_v1.aleo/deposit_usdcx.future;

finalize deposit_usdcx:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as test_usdcx_stablecoin.aleo/transfer_public_as_signer.future;
    await r4;
    get pools[r1] into r5;
    cast r5.platform_fee_bps into r6 as u128;
    mul r2 r6 into r7;
    div r7 10000u128 into r8;
    sub r2 r8 into r9;
    mul r5.aleo_reserve r9 into r10;
    add r5.token_reserve r9 into r11;
    div r10 r11 into r12;
    gte r12 r3 into r13;
    assert.eq r13 true;
    sub r5.aleo_reserve r12 into r14;
    add r5.token_reserve r9 into r15;
    cast r5.token_id r14 r15 r5.lp_fee_bps r5.platform_fee_bps into r16 as Pool;
    set r16 into pools[r1];
    cast 0field r12 r8 into r17 as SwapCredit;
    set r17 into pending_swaps[r0];

function deposit_aleo:
    input r0 as u128.public;
    input r1 as u128.public;
    input r2 as address.private;
    cast r0 into r3 as u64;
    call credits.aleo/transfer_public_as_signer r2 r3 into r4;
    async deposit_aleo self.signer 0field r0 r1 r4 into r5;
    output r5 as minimask_exchange_router_v1.aleo/deposit_aleo.future;

finalize deposit_aleo:
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
    mul r5.aleo_reserve r9 into r10;
    add r5.token_reserve r9 into r11;
    div r10 r11 into r12;
    gte r12 r3 into r13;
    assert.eq r13 true;
    sub r5.aleo_reserve r12 into r14;
    add r5.token_reserve r9 into r15;
    cast r5.token_id r14 r15 r5.lp_fee_bps r5.platform_fee_bps into r16 as Pool;
    set r16 into pools[r1];
    cast 0field r12 r8 into r17 as SwapCredit;
    set r17 into pending_swaps[r0];

function deposit_registry_token:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    input r3 as address.private;
    is.neq r0 0field into r4;
    is.neq r0 10field into r5;
    and r4 r5 into r6;
    assert.eq r6 true;
    call token_registry.aleo/transfer_public_as_signer r0 r3 r1 into r7;
    async deposit_registry_token self.signer r0 r1 r2 r7 into r8;
    output r8 as minimask_exchange_router_v1.aleo/deposit_registry_token.future;

finalize deposit_registry_token:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as token_registry.aleo/transfer_public_as_signer.future;
    await r4;
    get pools[r1] into r5;
    cast r5.platform_fee_bps into r6 as u128;
    mul r2 r6 into r7;
    div r7 10000u128 into r8;
    sub r2 r8 into r9;
    mul r5.aleo_reserve r9 into r10;
    add r5.token_reserve r9 into r11;
    div r10 r11 into r12;
    gte r12 r3 into r13;
    assert.eq r13 true;
    sub r5.aleo_reserve r12 into r14;
    add r5.token_reserve r9 into r15;
    cast r5.token_id r14 r15 r5.lp_fee_bps r5.platform_fee_bps into r16 as Pool;
    set r16 into pools[r1];
    cast 0field r12 r8 into r17 as SwapCredit;
    set r17 into pending_swaps[r0];

function redeem_usdcx:
    input r0 as u64.public;
    input r1 as u128.public;
    cast r1 into r2 as u64;
    call credits.aleo/transfer_public aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw r2 into r3;
    cast r0 into r4 as u128;
    call test_usdcx_stablecoin.aleo/transfer_public self.signer r4 into r5;
    cast r0 into r6 as u128;
    async redeem_usdcx self.signer 10field r6 r1 r3 r5 into r7;
    output r7 as minimask_exchange_router_v1.aleo/redeem_usdcx.future;

finalize redeem_usdcx:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as credits.aleo/transfer_public.future;
    input r5 as test_usdcx_stablecoin.aleo/transfer_public.future;
    await r4;
    await r5;
    get pending_swaps[r0] into r6;
    is.eq r6.token_id r1 into r7;
    assert.eq r7 true;
    is.eq r6.token_out r2 into r8;
    assert.eq r8 true;
    remove pending_swaps[r0];

function redeem_aleo:
    input r0 as u64.public;
    input r1 as u128.public;
    cast r1 into r2 as u64;
    call credits.aleo/transfer_public aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw r2 into r3;
    call credits.aleo/transfer_public self.signer r0 into r4;
    cast r0 into r5 as u128;
    async redeem_aleo self.signer 0field r5 r1 r3 r4 into r6;
    output r6 as minimask_exchange_router_v1.aleo/redeem_aleo.future;

finalize redeem_aleo:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as credits.aleo/transfer_public.future;
    input r5 as credits.aleo/transfer_public.future;
    await r4;
    await r5;
    get pending_swaps[r0] into r6;
    is.eq r6.token_id r1 into r7;
    assert.eq r7 true;
    is.eq r6.token_out r2 into r8;
    assert.eq r8 true;
    remove pending_swaps[r0];

function redeem_registry_token:
    input r0 as field.public;
    input r1 as u64.public;
    input r2 as u128.public;
    is.neq r0 0field into r3;
    is.neq r0 10field into r4;
    and r3 r4 into r5;
    assert.eq r5 true;
    cast r2 into r6 as u64;
    call credits.aleo/transfer_public aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw r6 into r7;
    cast r1 into r8 as u128;
    call token_registry.aleo/transfer_public r0 self.signer r8 into r9;
    cast r1 into r10 as u128;
    async redeem_registry_token self.signer r0 r10 r2 r7 r9 into r11;
    output r11 as minimask_exchange_router_v1.aleo/redeem_registry_token.future;

finalize redeem_registry_token:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as credits.aleo/transfer_public.future;
    input r5 as token_registry.aleo/transfer_public.future;
    await r4;
    await r5;
    get pending_swaps[r0] into r6;
    is.eq r6.token_id r1 into r7;
    assert.eq r7 true;
    is.eq r6.token_out r2 into r8;
    assert.eq r8 true;
    remove pending_swaps[r0];

function add_liquidity_usdcx:
    input r0 as u64.public;
    input r1 as u128.public;
    input r2 as u16.public;
    input r3 as u16.public;
    is.eq self.signer aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw into r4;
    assert.eq r4 true;
    call credits.aleo/transfer_public_as_signer minimask_exchange_router_v1.aleo r0 into r5;
    call test_usdcx_stablecoin.aleo/transfer_public_as_signer minimask_exchange_router_v1.aleo r1 into r6;
    cast r0 into r7 as u128;
    async add_liquidity_usdcx 10field r7 r1 r2 r3 r5 r6 into r8;
    output r8 as minimask_exchange_router_v1.aleo/add_liquidity_usdcx.future;

finalize add_liquidity_usdcx:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    input r3 as u16.public;
    input r4 as u16.public;
    input r5 as credits.aleo/transfer_public_as_signer.future;
    input r6 as test_usdcx_stablecoin.aleo/transfer_public_as_signer.future;
    await r5;
    await r6;
    cast r0 0u128 0u128 r3 r4 into r7 as Pool;
    get.or_use pools[r0] r7 into r8;
    add r8.aleo_reserve r1 into r9;
    add r8.token_reserve r2 into r10;
    cast r0 r9 r10 r3 r4 into r11 as Pool;
    set r11 into pools[r0];

function add_liquidity_registry:
    input r0 as field.public;
    input r1 as u64.public;
    input r2 as u128.public;
    input r3 as u16.public;
    input r4 as u16.public;
    is.eq self.signer aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw into r5;
    assert.eq r5 true;
    is.neq r0 10field into r6;
    is.neq r0 0field into r7;
    and r6 r7 into r8;
    assert.eq r8 true;
    call credits.aleo/transfer_public_as_signer minimask_exchange_router_v1.aleo r1 into r9;
    call token_registry.aleo/transfer_public_as_signer r0 minimask_exchange_router_v1.aleo r2 into r10;
    cast r1 into r11 as u128;
    async add_liquidity_registry r0 r11 r2 r3 r4 r9 r10 into r12;
    output r12 as minimask_exchange_router_v1.aleo/add_liquidity_registry.future;

finalize add_liquidity_registry:
    input r0 as field.public;
    input r1 as u128.public;
    input r2 as u128.public;
    input r3 as u16.public;
    input r4 as u16.public;
    input r5 as credits.aleo/transfer_public_as_signer.future;
    input r6 as token_registry.aleo/transfer_public_as_signer.future;
    await r5;
    await r6;
    cast r0 0u128 0u128 r3 r4 into r7 as Pool;
    get.or_use pools[r0] r7 into r8;
    add r8.aleo_reserve r1 into r9;
    add r8.token_reserve r2 into r10;
    cast r0 r9 r10 r3 r4 into r11 as Pool;
    set r11 into pools[r0];

constructor:
    assert.eq program_owner aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw;
