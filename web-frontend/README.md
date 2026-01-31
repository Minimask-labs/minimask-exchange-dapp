# Minimask Exchange

Minimask Exchange is a decentralized exchange (DEX) built on the Aleo blockchain, offering private and secure token swaps and cross-chain bridging.

## Overview

This project provides a template for a decentralized exchange on the Aleo network. It includes a web-based frontend built with Next.js and a set of Aleo smart contracts written in Leo. The exchange is designed to be a multi-chain platform, with integrations for Aleo, and other EVM compatible chains.

## Features

- **Decentralized Swaps:** Swap tokens securely on the Aleo network.
- **Cross-Chain Bridging:** Bridge assets between Aleo and other blockchains.
- **Liquidity Provision:** Users can provide liquidity to the exchange and earn fees.
- **Privacy:** Leveraging Aleo's zero-knowledge technology for private transactions.
- **Wallet Integration:** Connect with various Aleo wallets.

## Tech Stack

- **Frontend:**
  - [Next.js](https://nextjs.org/) (React Framework)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) (UI Components)
  - [Aleo Wallet Adapter](https://github.com/ProvableHQ/aleo-wallet-adapter)
- **Smart Contracts:**
  - [Leo](https://developer.aleo.org/leo/) (Programming language for Aleo)
- **Backend as a Service:**
  - [Supabase](https://supabase.com/)

## Project Structure

The project is organized into two main parts:

- `web-frontend/`: The Next.js application that serves as the user interface for the exchange.
- `contract/`: The Aleo smart contracts that power the exchange's backend logic.

## Aleo Smart Contracts

The core logic of the exchange is handled by three main smart contracts on the Aleo network:

### 1. `minimask_exchange_router.aleo`

This is the primary router for the exchange. It is the main entry point for swap transactions.

- **Functionality:**
  - **`swap_with_fee`**: Accepts user funds, takes a platform fee, and forwards the remaining amount to a registered merchant (e.g., a DEX or a bridge).
  - **`multi_hop_swap`**: Allows for swaps that involve multiple merchants.
  - **`register_merchant`**: Allows other contracts (DEXs, bridges) to register as a valid destination for funds.

### 2. `minimask_exchange_bridge.aleo`

<!-- Broadcasted transaction with:
  - transaction ID: 'at1z50kfu0r58lu7t9cj79plxne249lgka3yh3urk6rfnfvjdrcgggsu938x3'
  - fee ID: 'au1htzea4pnpryg30dw9u3t4weat5hjqxflk4q85vaush3wvj4x9ggsh7kqt9'
  - fee transaction ID: 'at1n0xmtrfm4xh79kfef2xyzylud8v3a8r7nunx8fnnkrz824jm6vzsa2khqe'
 -->


This contract facilitates the transfer of assets from Aleo to other blockchains.

- **Functionality:**
  - **`bridge_with_fee`**: A public function to initiate a cross-chain transfer. It collects a fee and sends the assets to a bridge provider.
  - **`private_bridge`**: A private (zero-knowledge) version of the bridge function, which hides the transaction details.
  - **`update_bridge_status`**: Allows a relayer to update the status of a bridge request (e.g., from pending to completed).

### 3. `minimask_exchange_merchants.aleo`

This contract manages liquidity providers, who are referred to as "merchants". Merchants lock up capital that can be used for instant swaps.

- **Functionality:**
  - **`deposit_liquidity`**: Allows users to become merchants by depositing a minimum amount of liquidity.
  - **`request_withdrawal`**: Initiates a withdrawal process for merchants, subject to an unstaking period.
  - **`execute_instant_swap`**: Called by the router contract to perform a swap using the liquidity provided by a merchant.

## Getting Started

To get the frontend development server running:

1.  **Navigate to the web-frontend directory:**
    ```bash
    cd web-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.