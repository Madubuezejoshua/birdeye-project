# Birdeye Intelligence Dashboard

> Real-time Solana crypto intelligence — track trending tokens, analyze wallets, and receive live Telegram alerts when the market moves.

---

## The Problem

Crypto markets move fast. Traders are overwhelmed by noise — hundreds of new tokens every day, no easy way to know which ones have real momentum, which are risky, and what their own wallet exposure looks like. Most dashboards just show raw data. None of them tell you what to do with it.

## The Solution

Birdeye Intelligence Dashboard turns raw Solana market data into actionable signals. It automatically classifies every trending token as **HOT**, **RISK**, or **WATCH**, analyzes any wallet's full portfolio in seconds, and sends Telegram alerts the moment a high-momentum token is detected — all in real time.

---

## Features

### Market Dashboard
- Top 20 trending tokens updated every 30 seconds
- New token listings feed
- Every token automatically classified: 🔥 HOT / ⚠️ RISK / 👀 WATCH
- Click any token to see full detail: price, volume, liquidity, holders, security score, 24h price chart

### Wallet Analyzer
- Paste any Solana wallet address and get a full portfolio breakdown
- Fetches all SPL token holdings + native SOL balance via Helius RPC
- Enriches each token with live price data from Birdeye
- Calculates **Risk Score**, **Exposure Score**, and **Opportunity Score** (0–100 each)
- Detects wallet type: 🐋 Whale, 🔥 Smart Money, 👀 Trend Follower, 📊 Diversified
- Token **Heat Score** (0–100) per holding based on volume, liquidity, and price momentum
- Smart suggestions generated automatically based on portfolio composition

### Live Alert System
- Polls Birdeye every 60 seconds for new HOT/RISK/WATCH signals
- Automatically fires Telegram messages when thresholds are crossed
- 30-minute cooldown per token to prevent spam
- Live monitoring badge with last-checked timestamp
- Built-in Telegram bot test panel

### Token Detail Pages
- Full token page for every token on the platform
- 24h price history chart
- Security analysis: mintable, freezable, mutable metadata, top holder concentration
- Volume, liquidity, market cap, holder count

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Market Data | [Birdeye API](https://birdeye.so) |
| Wallet Data | [Helius RPC](https://helius.dev) (Solana JSON-RPC) |
| Alerts | [Telegram Bot API](https://core.telegram.org/bots/api) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Madubuezejoshua/birdeye-project.git
cd birdeye-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Birdeye API key — https://birdeye.so
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Helius RPC URL — https://helius.dev
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_key_here

# Telegram Bot — see SETUP.md for full instructions
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_numeric_chat_id_here
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Testing the App

**Trending tokens** — visible immediately on the dashboard on load.

**Wallet Analyzer** — paste this active Solana wallet to test:
```
9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

**Telegram alerts** — go to the Alerts tab, scroll to "Telegram Bot Test", click Send Test Alert.

**Live alert engine** — open the Alerts tab and watch the 60-second auto-refresh cycle.

---

## Documentation

| File | Description |
|---|---|
| [SETUP.md](./SETUP.md) | Telegram bot setup and chat ID guide |
| [DEMO.md](./DEMO.md) | Step-by-step user walkthrough |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and technical breakdown |
| [PROJECT.md](./PROJECT.md) | Full project reference (all files, flows, components) |

---

## Deployment

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — live in under 2 minutes

---

## Why This Matters

Solana has thousands of tokens launching every week. Without intelligence tools, traders are flying blind. This dashboard gives any trader — from beginner to professional — a clear, real-time view of what's moving, what's risky, and what their own portfolio looks like against the market. The Telegram alert system means you never miss a HOT token even when you're away from the screen.

---

## Live Demo

> 🔗 Coming soon — deploy link will be added here

## Demo Video

> 📹 Coming soon — walkthrough video will be added here

---

## Author

**Joshua Madubueze**
GitHub: [Madubuezejoshua](https://github.com/Madubuezejoshua)
Email: [madubuezejoshua0@gmail.com](mailto:madubuezejoshua0@gmail.com)
