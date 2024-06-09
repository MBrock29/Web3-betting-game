# Betting DApp

This project is a decentralized betting application built using React, Next.js, and Solidity. Users can deposit, withdraw, and place bets on various football games using the Sepolia test network on the Ethereum blockchain.

## Features

- **Wallet Connection:** Users can connect their Ethereum wallet using Web3Modal.
- **Deposits and Withdrawals:** Users can deposit ETH to receive credits and withdraw credits back to ETH.
- **Betting:** Users can place bets on football matches with odds displayed in both fractional and decimal formats.
- **Live Balance Updates:** User and contract balances are updated in real-time.
- **Results Display:** Betting outcomes are displayed based on the results fetched from the blockchain.

## Live Demo

You can access the live application [here](https://web3-betting-game-35x5.vercel.app/).

Watch a video demonstration of the app on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7131096655029792768/).

## How to Use

### Prerequisites

- **MetaMask:** Install the MetaMask extension on your browser from [here](https://metamask.io/).
- **Sepolia Test ETH:** You will need some Sepolia test ETH to interact with the application. You can request test ETH from a Sepolia faucet such as [Sepolia Faucet](https://faucet.sepolia.dev/).

### Steps

1. **Connect Wallet:**
   - Click on the "Log in" button to connect your Ethereum wallet.
   - Ensure you are connected to the Sepolia test network.

2. **Depositing ETH:**
   - Click on the "Deposit" button.
   - Enter the amount in credits (0.1 test ETH = 1000 credits).
   - Confirm the transaction in MetaMask.

3. **Placing Bets:**
   - Select a match and choose to bet on either the home team, away team, or a draw.
   - Enter the amount to bet and confirm the transaction in MetaMask.

4. **Withdrawing ETH:**
   - Click on the "Withdraw" button.
   - Enter the amount in credits.
   - Confirm the transaction in MetaMask.

## Project Structure

- **App.js:** The main component that integrates all parts of the application including the header, wallet connection, and betting logic.
- **Header.js:** Contains the header component that handles user interactions for deposits, withdrawals, and displaying user balance.
- **Odds.js:** Contains the odds data for various football matches.
- **Game.sol:** The Solidity contract for handling the betting logic on the Ethereum blockchain.

## Technologies Used

- **React & Next.js:** Frontend framework for building the user interface.
- **Solidity:** Smart contract development language for the Ethereum blockchain.
- **Web3Modal:** Library for connecting to various Ethereum wallets.
- **Ethers.js:** Library for interacting with the Ethereum blockchain.
- **Tailwind CSS:** Utility-first CSS framework for styling.

