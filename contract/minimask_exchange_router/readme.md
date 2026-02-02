
# MiniMask Exchange Router

The **MiniMask Exchange Router** is an automated market maker (AMM) protocol built on the Aleo blockchain. It facilitates decentralized swaps between **ALEO** (credits), **USDCx** (stablecoin), and any token registered via the **Aleo Token Registry**.

## 🏗 Architecture

The router uses a "Separated Entry, Shared State" pattern. Due to Leo's strict typing for `Futures`, specific transitions exist for different token types to ensure gas efficiency and compiler compatibility.

---

## 🚀 Transaction Flows

### 1. Add Liquidity (Admin Only)

Before swapping, a liquidity pool must be initialized or funded. ALEO is the base pair for all pools.

* **Path A:** `add_liquidity_usdcx` (For the USDCx/ALEO pair)
* **Path B:** `add_liquidity_registry` (For any Token Registry token/ALEO pair)

### 2. Swap Flow (Deposit & Redeem)

Swaps are executed in two steps to manage state transitions safely:

1. **Deposit:** The user sends the "Input Token" to the exchange. The contract calculates the fair price based on the constant product formula  and records a `SwapCredit`.
2. **Redeem:** Once the deposit is finalized, the user calls a redeem transition to claim their "Output Token" and clear their credit.

---

## 🔧 Parameters Explained

### Pool Structure

| Parameter | Type | Description |
| --- | --- | --- |
| `token_id` | `field` | The unique identifier of the token (0 for ALEO, 10 for USDCx). |
| `aleo_reserve` | `u128` | The amount of ALEO currently in the pool. |
| `token_reserve` | `u128` | The amount of the paired token currently in the pool. |
| `lp_fee_bps` | `u16` | Fee rewarded to liquidity providers (in Basis Points, e.g., 30 = 0.3%). |
| `platform_fee_bps` | `u16` | Fee sent to the Treasury (in Basis Points). |

### Transition Inputs

* **`amount / token_amount`**: The raw quantity of tokens being moved. Note that `credits.aleo` uses `u64`, while others use `u128`.
* **`min_out / min_aleo_spillage`**: The minimum amount the user is willing to receive. This protects users from high slippage during volatile price moves.
* **`exchange_address`**: The address of the liquidity pool vault.
* **`p_fee`**: The calculated platform fee that must be paid during redemption.

---

## 🛠 Function Reference

### Swapping Tokens

| Transition | Input Token | Output |
| --- | --- | --- |
| `deposit_aleo` | ALEO (Credits) | Creates credit for Target Token |
| `deposit_usdcx` | USDCx | Creates credit for ALEO |
| `deposit_registry_token` | Registry Token | Creates credit for ALEO |

### Claiming Swaps

| Transition | Requirement |
| --- | --- |
| `redeem_aleo` | Must have a `SwapCredit` where `token_id == 0` |
| `redeem_usdcx` | Must have a `SwapCredit` where `token_id == 10` |
| `redeem_registry_token` | Must have a `SwapCredit` for the specific `token_id` |

---

## 🔒 Security & Constraints

* **Admin Control:** Only the `TREASURY` address can add liquidity or change pool parameters.
* **Slippage Protection:** All swap transitions include a `min_out` parameter. If the final amount calculated on-chain is less than this value, the transaction will fail.
* **Atomic Finalization:** Uses `Future.await()` to ensure that the token transfer actually succeeded before updating the internal pool balances.

---

## 💻 Developer Setup

1. **Install Leo:** Ensure you have the latest Leo compiler installed.
2. **Import Requirements:** This program requires `credits.aleo`, `token_registry.aleo`, and `test_usdcx_stablecoin.aleo` to be deployed or available in your environment.
3. **Build:** ```bash
leo build

<!-- contract address:  aleo1z3x9fxxu56helqe2jjk3zu3tk2yw8x3f7hf6uawvzqzatvxx75pqu08jc2 -->