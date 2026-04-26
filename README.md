# Birdeye Intelligence Dashboard

A real-time Solana crypto intelligence dashboard built with Next.js 15, powered by the Birdeye API. Tracks trending tokens, analyzes wallets, detects HOT/RISK/WATCH signals, and sends live Telegram alerts.

---

## Features

- **Live Market Dashboard** — trending tokens, new listings, HOT/RISK/WATCH signal classification
- **Wallet Analyzer** — enter any Solana wallet to get portfolio value, risk score, opportunity score, and smart suggestions
- **Token Detail Pages** — price history chart, security analysis, liquidity, volume, and holder data
- **Real-time Alert Engine** — auto-detects HOT tokens every 60 seconds and fires Telegram notifications
- **Smart Money Detection** — tags wallets as Whale, Smart Money, or Trend Follower based on holdings
- **Token Heat Score** — 0–100 score per token based on volume, liquidity, and price momentum

---

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Birdeye API](https://birdeye.so) — token data, prices, security
- [Helius RPC](https://helius.dev) — Solana wallet token fetching
- [Telegram Bot API](https://core.telegram.org/bots/api) — alert delivery
- TypeScript, Tailwind CSS

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Madubuezejoshua/birdeye-project.git
cd birdeye-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
# Birdeye API — get yours at https://birdeye.so
BIRDEYE_API_KEY=your_birdeye_api_key

# Helius RPC — get yours at https://helius.dev
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_api_key

# Telegram Bot — see SETUP.md for full instructions
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_numeric_chat_id
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Telegram Alerts Setup

See [SETUP.md](./SETUP.md) for the full step-by-step guide to creating your Telegram bot and getting your chat ID.

---

## Project Structure

```
app/
  page.tsx              # Main dashboard
  alerts/page.tsx       # Live alerts tab
  wallet/page.tsx       # Wallet analyzer
  token/[address]/      # Token detail page
  api/                  # All API routes

components/             # UI components
lib/                    # Core logic (Birdeye, RPC, alerts engine)
types/                  # TypeScript types
```

---

## Deployment

Deploy instantly on [Vercel](https://vercel.com):

1. Push to GitHub
2. Import the repo on Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

---

## Author

**madubuezejoshua** — [madubuezejoshua0@gmail.com](mailto:madubuezejoshua0@gmail.com)  
GitHub: [Madubuezejoshua](https://github.com/Madubuezejoshua)
