FeeManager DApp
Overview

This project is a decentralized application (DApp) built to demonstrate wallet integration, smart contract execution, and automatic fee redirection on the Ethereum blockchain. It provides a simple, professional interface that allows users to connect their wallet and execute a transaction with an additional fee routed to a treasury wallet.

The project aligns with the following objectives:

Wallet integration with WalletConnect and injected wallets (e.g., MetaMask).

Execution of smart contract functions via ethers.js.

Automatic inclusion of a fixed fee in each transaction.

Minimalistic, professional frontend with light/dark theme toggle.

Smart Contract

Contract Name: FeeManager
Network: Sepolia Testnet
Framework: Truffle

Key Features

Accepts user payments and executes a callback.

Automatically deducts and forwards a fixed fee to a predefined treasury wallet.

Designed to separate user payment value from project fees.

Tech Stack
Backend / Smart Contracts

Solidity for contract logic.

Truffle for contract compilation, migration, and deployment.

Sepolia Testnet for deployment and testing.

Frontend

React (Vite) for the user interface.

TypeScript for type safety.

ethers.js v6 for blockchain interactions.

WalletConnect v2 for multi-wallet support.

Injected Wallet (MetaMask) fallback option.

TailwindCSS v3 for styling.

Lucide Icons for clean and professional iconography.

DApp Features

Wallet Integration

Supports MetaMask and WalletConnect-compatible wallets.

Smooth connect and disconnect flow.

Transaction Execution

Calls the payAndCall function of the FeeManager contract.

Allows the user to define the ETH value being sent.

Adds a fixed fee automatically to the transaction.

UI Features

Modern, minimal, and responsive design.

Light/Dark mode toggle.

Displays connected wallet address, transaction status, and confirmation link on Etherscan.
