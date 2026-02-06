import credits.aleo;
import token_registry.aleo;
import minimask_exchange_router.aleo;
program test_minimask_exchange_router.aleo;

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

function keep_compiler_happy:

constructor:
    assert.eq program_owner aleo1l2lyqhh0n206drgzhw2a70atg7te8kgedlc2e9tjz0m0zr65nyysla8cnw;
