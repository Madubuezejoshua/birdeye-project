# Architecture — Birdeye Intelligence Dashboard

This document explains how the system is designed, how data flows through it, and how each module connects to the others.

---

## System Overview

The dashboard is built on **Next.js 15 App Router**, which means the frontend and backend live in the same codebase. Server components handle data fetching and rendering. Client components handle interactivity and real-time updates. API routes act as a secure backend layer between the browser and external services.

```
┌─────────────────────────────────────────────────────┐
│                    Browser (User)                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Next.js Application                     │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Dashboard  │  │   Wallet     │  │   Alerts   │  │
│  │  (Server)   │  │  (Client)    │  │  (Client)  │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                │                │          │
│  ┌──────▼────────────────▼────────────────▼──────┐   │
│  │              API Routes (/app/api)             │   │
│  └──────┬────────────────┬────────────────┬──────┘   │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
    ┌─────▼─────┐   ┌──────▼──────┐  ┌─────▼──────┐
    │  Birdeye  │   │  Helius RPC │  │  Telegram  │
    │    API    │   │  (Solana)   │  │  Bot API   │
    └───────────┘   └─────────────┘  └────────────┘
```

---

## Pages and Their Rendering Strategy

### Dashboard (`/`) — Server Component
Renders on the server at request time. Fetches trending tokens and new listings directly from Birdeye. Revalidates every 30 seconds using Next.js ISR (Incremental Static Regeneration). No client-side fetching needed — the page arrives pre-rendered with data.

### Wallet Analyzer (`/wallet`) — Client Component
Fully interactive. User enters a wallet address, the browser calls `POST /api/wallet`, and results are rendered client-side. Uses React state for loading, error, and result management.

### Alerts (`/alerts`) — Client Component
Polls `GET /api/alerts` every 60 seconds using `setInterval`. Updates the UI with fresh HOT/RISK/WATCH counts and token lists on each cycle. Shows a live monitoring badge and last-checked timestamp.

### Token Detail (`/token/[address]`) — Client Component
Dynamic route. Fetches `GET /api/token-detail?address=...` on mount. Shows skeleton loaders while data loads. Includes a retry button if the fetch fails.

---

## API Routes

All external API calls go through Next.js API routes — never directly from the browser. This keeps API keys secure on the server.

### `GET /api/alerts`
The core of the live alert system.
- Fetches top 20 trending tokens from Birdeye
- Classifies each as HOT / RISK / WATCH using the signal engine
- Runs `processTokenAlerts()` to fire Telegram messages for qualifying tokens
- Returns counts and token lists to the frontend

### `POST /api/wallet`
Full wallet analysis pipeline.
- Validates the Solana address
- Fetches SPL tokens and SOL balance from Helius RPC in parallel
- Enriches tokens with Birdeye price and metadata
- Computes risk, exposure, and opportunity scores
- Assigns a wallet tag (Whale, Smart Money, etc.)
- Fires a Telegram risk alert if risk score exceeds 70
- Returns the complete analysis object

### `GET /api/token-detail`
Single token data aggregation.
- Calls Birdeye token_overview, token_security, and history_price in parallel
- Normalizes field names (Birdeye uses different names in different endpoints)
- Returns overview + security + price history in one response

### `POST /api/telegram-alert`
Secure Telegram message sender.
- Accepts a message string and optional chat ID
- Falls back to `TELEGRAM_CHAT_ID` from environment if no chat ID provided
- Calls Telegram Bot API server-side — bot token never exposed to browser

### `GET /api/trending`
Proxies Birdeye trending tokens.
- Also fires server-side HOT token Telegram alerts as a side effect
- Used by the HotTokenDetector component on the dashboard

---

## Core Library Modules

### `lib/birdeye.ts` — Market Data Layer
Single source of truth for all Birdeye API calls. Every endpoint is a named exported function. Normalizes raw Birdeye field names into a consistent shape. Tracks every API call via the API counter.

Key functions:
- `getTrendingTokens(limit)` — top tokens by rank
- `getNewListings(limit)` — recently listed tokens
- `getTokenOverview(address)` — full token data
- `getTokenSecurity(address)` — security flags and score
- `getTokenPriceHistory(address, type)` — OHLCV data for charts

### `lib/solanaWallet.ts` — Wallet Data Layer
Handles all Solana blockchain reads via JSON-RPC.

- `getWalletTokens(wallet)` — calls `getTokenAccountsByOwner` to get all SPL token accounts with non-zero balance
- `getSolBalance(wallet)` — calls `getBalance` and converts lamports to SOL

Both functions try Helius RPC first. If Helius fails for any reason, they automatically retry with the public Solana RPC (`api.mainnet-beta.solana.com`).

### `lib/birdeyeEnrich.ts` — Token Enrichment Layer
Takes raw `{ mint, balance }` pairs from the RPC and adds price and metadata from Birdeye.

- One API call per token (`/defi/token_overview`) — gets price, name, symbol, liquidity, and volume in a single request
- Processes 3 tokens at a time with a 300ms pause between batches to stay within free tier rate limits
- Returns price 0 gracefully if rate-limited (429) — never throws

### `lib/insights.ts` — Signal Classification Engine
Classifies any token into HOT, RISK, or WATCH based on its market data.

```
HOT   → volume > $500K  AND  liquidity > $200K
RISK  → liquidity < $50K
WATCH → everything else
```

Used on the dashboard, alerts page, and token detail pages.

### `lib/alertsEngine.ts` — Alert Processing Engine
Server-side only. Applies stricter thresholds than the UI badges to reduce Telegram noise.

```
HOT alert   → volume > $1M    AND  liquidity > $500K
RISK alert  → liquidity > 0   AND  liquidity < $100K
WATCH alert → price change > 5%  AND  volume > $300K
```

Each token has a 30-minute cooldown. The same token will not trigger more than one alert per 30 minutes.

### `lib/telegram-alerts.ts` — Telegram Delivery Layer
Server-side only. Handles all Telegram Bot API communication.

- `sendTelegramMessage(text)` — sends directly to the configured chat ID
- `shouldSendAlert(address)` — checks if the 30-minute cooldown has passed
- `markAlerted(address)` — records the alert timestamp
- `formatWalletRiskAlert(wallet, score, tokens)` — formats the wallet risk message

---

## Data Flow — Dashboard

```
Request arrives at /
  → Server fetches getTrendingTokens(20) + getNewListings(10) in parallel
  → Deduplicates tokens by address
  → Runs getTokenSignal() on each token → HOT / RISK / WATCH
  → Renders TokenCard grid with badges
  → HotTokenDetector (invisible client component) mounts
      → Watches for newly HOT tokens on re-renders
      → Calls POST /api/telegram-alert for new HOT tokens
```

---

## Data Flow — Wallet Analysis

```
User enters wallet address → clicks Analyze
  → Client validates: length 32–44 chars, base58 format
  → POST /api/wallet { address }
  → Server: validateSolanaAddress()
  → Parallel fetch:
      getWalletTokens()  → Helius RPC → getTokenAccountsByOwner
      getSolBalance()    → Helius RPC → getBalance
  → If Helius fails → auto-retry with public Solana RPC
  → SOL injected as wSOL token if balance > 0
  → enrichTokensBatch(top 20 tokens, concurrency=3)
      → GET /defi/token_overview per token
      → 300ms delay between batches
  → Scores computed:
      riskScore     = (low-liq tokens + 0.5 × unpriced) / total × 100
      exposureScore = high-volume tokens / total × 100
      opportunityScore = 100 - riskScore
  → Heat score per token (volume + liquidity + price change + has price)
  → Wallet tag assigned based on total value + trending count
  → If riskScore > 70 → Telegram wallet risk alert fired
  → Response returned to client → UI renders
```

---

## Data Flow — Alert Engine (every 60 seconds)

```
Client polls GET /api/alerts
  → Server fetches getTrendingTokens(20)
  → Each token classified: HOT / RISK / WATCH
  → processTokenAlerts(tokens):
      For each token:
        Check HOT rule → shouldSendAlert()? → sendTelegramMessage()
        Check RISK rule → shouldSendAlert()? → sendTelegramMessage()
        Check WATCH rule → shouldSendAlert()? → sendTelegramMessage()
  → Returns { counts, tokens, alertsSent }
  → Client updates UI
  → Waits 60 seconds → repeats
```

---

## Scoring System

### Token Signal (UI badges)
| Signal | Condition |
|---|---|
| 🔥 HOT | Volume > $500K AND Liquidity > $200K |
| ⚠️ RISK | Liquidity < $50K |
| 👀 WATCH | Everything else |

### Wallet Scores (0–100)
| Score | Formula |
|---|---|
| Risk Score | (low-liquidity tokens + 0.5 × unpriced tokens) ÷ total × 100 |
| Exposure Score | high-volume tokens ÷ total × 100 |
| Opportunity Score | 100 − Risk Score |

### Token Heat Score (0–100)
| Factor | Max Points |
|---|---|
| Volume > $10M | 35 |
| Liquidity > $1M | 25 |
| Price change > 20% | 25 |
| Has price data | 15 |

### Wallet Tags
| Tag | Condition |
|---|---|
| 🐋 Whale Wallet | Total value > $100K |
| 🔥 Smart Money Wallet | Value > $10K AND 3+ trending tokens |
| 👀 Trend Follower | 5+ trending tokens |
| 📊 Diversified Portfolio | 30+ tokens |

---

## External APIs

### Birdeye API
- Base URL: `https://public-api.birdeye.so`
- Auth: `X-API-KEY` header
- Chain: `x-chain: solana`
- Free tier: up to 20 results per trending call, rate-limited on overview calls

### Helius RPC
- Base URL: `https://mainnet.helius-rpc.com/?api-key=...`
- Protocol: Solana JSON-RPC 2.0
- Methods used: `getTokenAccountsByOwner`, `getBalance`
- Fallback: `https://api.mainnet-beta.solana.com`

### Telegram Bot API
- Base URL: `https://api.telegram.org/bot{TOKEN}/sendMessage`
- Auth: Bot token in URL path
- Called server-side only — token never exposed to browser
- Parse mode: HTML (supports bold, code, links in messages)

---

## Security Considerations

- All API keys stored in `.env.local` — never committed to git (`.gitignore` covers `.env*`)
- Telegram bot token only used server-side in API routes and lib files
- Wallet addresses validated before any RPC call is made
- External API calls wrapped in try/catch — failures return graceful fallbacks, never crash the UI
- No user data stored — all analysis is stateless and computed on demand
