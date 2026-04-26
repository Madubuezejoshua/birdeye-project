# Birdeye Intelligence Dashboard — Full Project Breakdown

This document explains every part of the project in detail: what each page does, how data flows through the system, what every file is responsible for, and how all the pieces connect together.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Data Sources & External APIs](#3-data-sources--external-apis)
4. [Page-by-Page Breakdown](#4-page-by-page-breakdown)
   - [Dashboard (Home)](#41-dashboard-home---apppagetsxs)
   - [Wallet Analyzer](#42-wallet-analyzer---appwalletpagetsx)
   - [Alerts](#43-alerts---appalertspagetsx)
   - [Token Detail](#44-token-detail---apptokenaddresspagetsx)
5. [API Routes](#5-api-routes)
6. [Core Library Files](#6-core-library-files)
7. [Components](#7-components)
8. [Signal Classification System](#8-signal-classification-system)
9. [Wallet Analysis Flow](#9-wallet-analysis-flow)
10. [Alert Engine Flow](#10-alert-engine-flow)
11. [Telegram Alert System](#11-telegram-alert-system)
12. [Environment Variables](#12-environment-variables)
13. [How Everything Connects](#13-how-everything-connects)

---

## 1. Project Overview

The Birdeye Intelligence Dashboard is a real-time Solana crypto intelligence tool. It does three main things:

1. **Monitors the market** — fetches trending tokens and new listings from Birdeye every 30 seconds and classifies them as HOT, RISK, or WATCH
2. **Analyzes wallets** — takes any Solana wallet address, fetches all its token holdings via Helius RPC, enriches them with price data from Birdeye, and produces a full portfolio analysis
3. **Sends alerts** — automatically fires Telegram messages when HOT tokens are detected, RISK tokens appear, or a wallet has a high risk score

---

## 2. Folder Structure

```
app/                        Next.js App Router pages and API routes
  page.tsx                  Dashboard (home page)
  layout.tsx                Root layout — navbar, global styles
  alerts/page.tsx           Alerts tab
  wallet/page.tsx           Wallet analyzer
  token/[address]/page.tsx  Token detail page (dynamic route)
  api/
    alerts/route.ts         GET — fetch + classify + alert on trending tokens
    wallet/route.ts         POST — full wallet analysis
    token-detail/route.ts   GET — token overview + security + price history
    trending/route.ts       GET — trending tokens (proxies Birdeye)
    telegram-alert/route.ts POST — send a Telegram message
    new-listings/route.ts   GET — new token listings
    counter/route.ts        GET/POST — API usage counter
    api-stats/route.ts      GET — API call statistics
    api-history/route.ts    GET — API call history

components/                 Reusable UI components
  Navbar.tsx                Top navigation bar
  TokenCard.tsx             Card shown for each token on dashboard
  WalletInsights.tsx        Score bars + suggestions for wallet analysis
  PriceChart.tsx            SVG line chart for price history
  Badge.tsx                 HOT / RISK / WATCH signal badge
  Loader.tsx                Animated loading spinner
  HotTokenDetector.tsx      Silent client component — detects new HOT tokens
  TelegramTestPanel.tsx     UI panel to test Telegram bot connection
  AlertSettings.tsx         Alert preferences UI
  ApiUsageWidget.tsx        Floating widget showing API call count
  ApiDebugPanel.tsx         Debug panel for API call history

lib/                        Core business logic
  birdeye.ts                All Birdeye API calls (single source of truth)
  birdeyeEnrich.ts          Enriches wallet tokens with price + metadata
  solanaWallet.ts           Fetches SPL tokens + SOL balance via RPC
  insights.ts               Signal engine — classifies tokens as HOT/RISK/WATCH
  alertsEngine.ts           Processes tokens and fires Telegram alerts
  telegram-alerts.ts        Telegram Bot API helpers (server-side only)
  alerts.ts                 Alert settings helpers (localStorage)
  normalizeToken.ts         Safe token data normalization
  normalizeWallet.ts        Wallet data normalization + address validation
  apiCounter.ts             Tracks API call counts persistently
  utils.ts                  Formatting helpers (price, number, percent)

types/
  index.ts                  All TypeScript interfaces and types

hooks/
  useApiUsage.ts            React hook for reading API usage stats
```

---

## 3. Data Sources & External APIs

### Birdeye API (`public-api.birdeye.so`)
The main data source for all token market data.

| Endpoint | Used For |
|---|---|
| `GET /defi/token_trending` | Top 20 trending tokens by rank |
| `GET /defi/v2/tokens/new_listing` | Recently listed tokens |
| `GET /defi/token_overview` | Full token data: price, volume, liquidity, metadata |
| `GET /defi/token_security` | Security flags: mintable, freezable, top holders |
| `GET /defi/history_price` | OHLCV price history for charts |

All Birdeye calls go through `lib/birdeye.ts` — never called directly from components.

### Helius RPC (`mainnet.helius-rpc.com`)
Used exclusively for Solana wallet data.

| Method | Used For |
|---|---|
| `getTokenAccountsByOwner` | All SPL token accounts for a wallet |
| `getBalance` | Native SOL balance in lamports |

If Helius fails or is not configured, the system automatically falls back to `api.mainnet-beta.solana.com`.

### Telegram Bot API (`api.telegram.org`)
Used to send alert messages. Called server-side only from `lib/telegram-alerts.ts` and `/api/telegram-alert`.

---

## 4. Page-by-Page Breakdown

### 4.1 Dashboard (Home) — `app/page.tsx`

**Type:** Server Component (renders on the server, revalidates every 30 seconds)

**What it does:**
- Fetches top 20 trending tokens and 10 new listings from Birdeye in parallel
- Deduplicates tokens by address (Birdeye sometimes returns duplicates)
- Runs each token through the signal engine to find HOT tokens
- Renders a stats bar (trending count, new listings, hot count, data source)
- Shows a "Hot Right Now" section with up to 4 HOT tokens
- Shows the full trending grid (all 20 tokens)
- Shows new listings grid
- Shows a CTA banner linking to the Wallet Analyzer

**Data flow:**
```
Server renders page
  → getTrendingTokens(20)  [Birdeye API]
  → getNewListings(10)     [Birdeye API]
  → deduplicate by address
  → getTokenSignal() for each token
  → render TokenCard for each
  → HotTokenDetector (client component, invisible) watches for new HOT tokens
```

**Revalidation:** Every 30 seconds via `export const revalidate = 30`

---

### 4.2 Wallet Analyzer — `app/wallet/page.tsx`

**Type:** Client Component (fully interactive, no server rendering)

**What it does:**
- User types a Solana wallet address and clicks Analyze (or presses Enter)
- Validates address length (32–44 characters, base58 format)
- Calls `POST /api/wallet` with the address
- Shows a loading spinner while waiting
- Displays results: total portfolio value, top 3 holdings, score bars, token list

**Results shown:**
- **Wallet Tag** — Smart Money / Whale / Trend Follower / Diversified (if applicable)
- **Total Value** — sum of all token USD values
- **Top 3 Holdings** — symbol, USD value, price per token
- **Risk Score (0–100)** — % of holdings that are low-liquidity or unpriced
- **Exposure Score (0–100)** — % of holdings that are high-volume trending tokens
- **Opportunity Score (0–100)** — inverse of risk score
- **Token Holdings Table** — all tokens with balance, price change, USD value, heat score badge, link to token detail
- **Smart Suggestions** — auto-generated text advice based on scores
- **Debug Panel** — hidden by default, toggle with the bug icon — shows SPL token count, SOL balance, RPC status, Birdeye status

**Error handling:**
- Invalid address → shows inline error, no API call made
- API failure → shows red error banner
- Empty wallet → shows "no SPL tokens" message

---

### 4.3 Alerts — `app/alerts/page.tsx`

**Type:** Client Component with auto-polling

**What it does:**
- On load, immediately calls `GET /api/alerts`
- Sets up a 60-second interval to re-call `GET /api/alerts` automatically
- Displays HOT / RISK / WATCH token counts in summary cards
- Shows each category as a list of tokens with volume and price change
- Each token links to its detail page
- Shows "Live Monitoring" badge with pulsing green dot
- Shows last-checked timestamp and total Telegram alerts sent this session
- Manual refresh button (spinning icon)
- Telegram Test Panel for verifying bot connection

**Polling flow:**
```
Page loads
  → fetchAlerts() called immediately
  → setInterval(fetchAlerts, 60000) starts
  → each call hits GET /api/alerts
  → /api/alerts fetches Birdeye, classifies tokens, fires Telegram alerts
  → UI updates with new counts and token lists
```

**Loading states:** Skeleton placeholders shown while data loads (animated gray bars)

---

### 4.4 Token Detail — `app/token/[address]/page.tsx`

**Type:** Client Component (dynamic route, address from URL)

**What it does:**
- Reads the token address from the URL (`/token/So111...`)
- Calls `GET /api/token-detail?address=...`
- Shows skeleton loaders while fetching
- Displays: symbol, name, signal badge, all stat cards, price chart, security analysis, links

**Stat cards shown:**
- Price
- 24h price change (green/red)
- Volume 24h
- Liquidity
- Market Cap
- Holders

**Price chart:** SVG line chart rendered by `PriceChart` component using 24h OHLCV data

**Security section:**
- Security score bar (0–100, color coded: green ≥70, yellow ≥40, red <40)
- Mintable flag (Yes ⚠️ / No ✅)
- Freezable flag
- Mutable metadata flag
- Top 10 holder percentage

**Error handling:** If data fails to load, shows red error banner with a Retry button. Refresh icon in header for manual reload.

---

## 5. API Routes

### `GET /api/alerts`
The core of the live alert system.

**Flow:**
1. Fetches top 20 trending tokens from Birdeye
2. Runs each through `getTokenSignal()` → classifies as HOT / RISK / WATCH
3. Calls `processTokenAlerts()` → fires Telegram messages for qualifying tokens
4. Returns: `{ counts, tokens: { hot, risk, watch }, alertsSent, checkedAt }`

**Note:** `export const dynamic = "force-dynamic"` — never cached, always fresh.

---

### `POST /api/wallet`
Full wallet analysis endpoint.

**Request body:** `{ address: string }`

**Flow:**
1. Validates address format
2. Fetches SPL tokens + SOL balance in parallel (Helius RPC)
3. Injects SOL as a token (wSOL mint) if balance > 0
4. Enriches top 20 tokens with Birdeye price + metadata
5. Computes risk score, exposure score, opportunity score
6. Computes heat score per token
7. Determines wallet tag (Whale / Smart Money / etc.)
8. Fires Telegram risk alert if risk score > 70
9. Returns full analysis object

**Response shape:**
```json
{
  "success": true,
  "tokens": [...],
  "totalValue": 1234.56,
  "walletTag": "🔥 Smart Money Wallet",
  "top3": [...],
  "debug": { "splTokens": 45, "solBalance": 0.5, "rpcStatus": "ok", "birdeyeStatus": "ok" },
  "analysis": {
    "totalTokens": 20,
    "riskScore": 35,
    "exposureScore": 15,
    "opportunityScore": 65,
    "hotTokens": ["RAY", "SOL"],
    "riskyTokens": ["SCAM"],
    "suggestions": [...]
  }
}
```

---

### `GET /api/token-detail?address=...`
Fetches all data for a single token detail page.

**Flow:**
1. Calls `getTokenOverview`, `getTokenSecurity`, `getTokenPriceHistory` in parallel
2. Normalizes field names from Birdeye's overview response (Birdeye uses `v24hUSD` not `volume24hUSD`)
3. Returns: `{ overview, security, history }`

---

### `POST /api/telegram-alert`
Sends a Telegram message directly.

**Request body:** `{ message: string, chatId?: string }`

If `chatId` is omitted, uses `TELEGRAM_CHAT_ID` from environment.

---

### `GET /api/trending`
Proxies Birdeye trending tokens. Also fires server-side HOT token Telegram alerts as a side effect.

---

## 6. Core Library Files

### `lib/birdeye.ts`
Single source of truth for all Birdeye API calls. Every endpoint is a named function. Normalizes raw Birdeye field names into a consistent `BirdeyeToken` shape. Tracks every API call via `apiCounter`.

### `lib/solanaWallet.ts`
Two exported functions:
- `getWalletTokens(wallet)` — returns all SPL token accounts with non-zero balance
- `getSolBalance(wallet)` — returns native SOL balance in SOL (not lamports)

Both use `tryRPC()` internally which tries Helius first, falls back to public RPC automatically.

### `lib/birdeyeEnrich.ts`
Takes raw `{ mint, balance }` pairs from the RPC and enriches them with Birdeye data.

- One API call per token (`/defi/token_overview`) — gets price, name, symbol, liquidity, volume all at once
- Batches 3 tokens at a time with 300ms delay between batches to avoid rate limiting
- Returns 0 values gracefully if rate limited (429) instead of throwing

### `lib/insights.ts`
The signal classification engine.

`getTokenSignal(token)` returns HOT / RISK / WATCH based on:
- **HOT:** volume > $500K AND liquidity > $200K
- **RISK:** liquidity < $50K
- **WATCH:** everything else

### `lib/alertsEngine.ts`
Server-side only. Processes a list of tokens and fires Telegram alerts.

Rules (stricter than the UI signal rules):
- **HOT alert:** volume > $1M AND liquidity > $500K
- **RISK alert:** liquidity > 0 AND liquidity < $100K
- **WATCH alert:** price change > 5% AND volume > $300K

Each token has a 30-minute cooldown — won't alert on the same token twice within 30 minutes.

### `lib/telegram-alerts.ts`
Server-side Telegram helpers. Never call from client components.

Key functions:
- `sendTelegramMessage(text)` — sends directly to Telegram Bot API
- `sendHotTokenAlert(token)` — formats + sends HOT token alert with cooldown check
- `shouldSendAlert(address)` — checks if cooldown has passed
- `markAlerted(address)` — records alert timestamp, prunes entries older than 24h
- `formatWalletRiskAlert(wallet, score, tokens)` — formats wallet risk message

### `lib/normalizeWallet.ts`
- `validateSolanaAddress(address)` — checks length, base58 format, excludes system addresses
- `normalizeWalletResponse(data)` — normalizes different API response shapes into a consistent format

### `lib/apiCounter.ts`
Tracks how many Birdeye API calls have been made. Persists to `.api-counter.json` so counts survive server restarts.

---

## 7. Components

### `TokenCard.tsx`
Displays a single token in a card format. Shows symbol, name, signal badge, price, 24h change, volume, liquidity. Clicking navigates to the token detail page. Has glass morphism hover effect with gradient glow.

### `WalletInsights.tsx`
Renders the three score bars (Risk, Exposure, Opportunity) with animated fill, plus trending holdings list, risky tokens list, and smart suggestions.

### `PriceChart.tsx`
Pure SVG line chart. Takes `BirdeyePricePoint[]` (array of `{ unixTime, value }`) and renders a responsive price line with gradient fill.

### `Badge.tsx`
Small colored pill showing HOT 🔥 / RISK ⚠️ / WATCH 👀. Color-coded: orange, red, yellow.

### `HotTokenDetector.tsx`
Invisible client component rendered on the dashboard. Watches the trending token list for newly HOT tokens (tokens that weren't HOT on the previous render). When a new HOT token appears, it calls `sendHotTokenAlert()`. Skips the first render to avoid spamming on page load.

### `Navbar.tsx`
Sticky top navigation. Shows logo + "Birdeye Intelligence" branding. Three nav links: Dashboard, Wallet, Alerts. Active link highlighted in cyan.

### `TelegramTestPanel.tsx`
UI for testing the Telegram bot. Sends a test message via `POST /api/telegram-alert`. Leaves chat ID blank to use env default. Shows helpful error messages with specific hints (e.g. "use @RawDataBot to get your numeric ID").

### `ApiUsageWidget.tsx`
Floating widget in the bottom corner showing total API calls made. Reads from the API counter.

---

## 8. Signal Classification System

Every token in the system gets classified into one of three signals:

```
HOT  🔥  volume > $500K  AND  liquidity > $200K
          → Strong momentum, safe to trade
          → Orange badge

RISK ⚠️  liquidity < $50K
          → Low liquidity, potential rug or illiquid token
          → Red badge

WATCH 👀  Everything else
          → Moderate activity, worth monitoring
          → Yellow badge
```

The alert engine uses stricter thresholds than the UI badges to reduce noise in Telegram:

```
HOT alert:   volume > $1M   AND  liquidity > $500K
RISK alert:  liquidity > 0  AND  liquidity < $100K
WATCH alert: priceChange > 5%  AND  volume > $300K
```

---

## 9. Wallet Analysis Flow

Step-by-step what happens when you click Analyze:

```
1. User enters wallet address → client validates format
2. POST /api/wallet { address }
3. Server validates address (base58, length, not a system address)
4. Parallel fetch:
   a. getWalletTokens(address)  → Helius RPC → getTokenAccountsByOwner
   b. getSolBalance(address)    → Helius RPC → getBalance
5. If Helius fails → auto-retry with api.mainnet-beta.solana.com
6. SOL balance injected as wSOL token (So111...112)
7. Top 20 tokens sent to enrichTokensBatch()
   → 3 tokens per batch, 300ms between batches
   → Each token: GET /defi/token_overview → price, name, symbol, liquidity, volume
8. Tokens sorted by USD value (highest first)
9. Scores computed:
   riskScore     = (low-liquidity tokens + 0.5 × unpriced tokens) / total × 100
   exposureScore = high-volume tokens / total × 100
   opportunityScore = 100 - riskScore
10. Heat score per token (0–100):
    volume contribution:    up to 35 points
    liquidity contribution: up to 25 points
    price change:           up to 25 points
    has price data:         15 points
11. Wallet tag assigned:
    totalValue > $100K          → 🐋 Whale Wallet
    totalValue > $10K + 3 trending → 🔥 Smart Money Wallet
    5+ trending tokens          → 👀 Trend Follower
    30+ tokens                  → 📊 Diversified Portfolio
12. If riskScore > 70 → fire Telegram wallet risk alert (non-blocking)
13. Return full analysis to client
14. Client renders results
```

---

## 10. Alert Engine Flow

What happens every 60 seconds on the Alerts tab:

```
1. Client calls GET /api/alerts
2. Server fetches top 20 trending tokens from Birdeye
3. Each token classified: HOT / RISK / WATCH
4. processTokenAlerts(tokens) runs:
   For each token:
     - Check HOT rule (vol > $1M + liq > $500K)
       → shouldSendAlert(address)? (30-min cooldown)
       → sendTelegramMessage(formatted HOT alert)
       → markAlerted(address)
     - Check RISK rule (liq < $100K)
       → shouldSendAlert("risk-" + address)?
       → sendTelegramMessage(formatted RISK alert)
     - Check WATCH rule (change > 5% + vol > $300K)
       → shouldSendAlert("watch-" + address)?
       → sendTelegramMessage(formatted WATCH alert)
5. Return counts + token lists + alertsSent to client
6. Client updates UI
7. Wait 60 seconds → repeat
```

---

## 11. Telegram Alert System

Three types of automatic alerts:

**HOT Token Alert** (from alert engine, every 60s check):
```
🔥 HOT TOKEN ALERT

RAY (RAY)
💰 Price: $0.799217
📈 24h: +19.58%
📊 Vol: $32.76M
💧 Liq: $10.96M

4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R
```

**RISK Token Alert** (from alert engine):
```
⚠️ RISK TOKEN DETECTED

SCAM has low liquidity: $30.1K
Exercise caution.

BnWMRWQj9p3H5H3iUMAgmd9amnCUi9hjeD1QqywSV4Pd
```

**Wallet Risk Alert** (from wallet analysis, when riskScore > 70):
```
⚠️ WALLET RISK ALERT

Wallet: 9WzDXwB...tAWWM
Risk Score: 75/100
Risky Tokens: SCAM, RUG, DUST

🛡️ Consider rebalancing your portfolio.
```

All alerts have a **30-minute cooldown per token** to prevent spam. Cooldown data is stored in memory (resets on server restart).

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BIRDEYE_API_KEY` | Yes | Birdeye API key from birdeye.so |
| `HELIUS_RPC_URL` | Recommended | Full Helius RPC URL including API key |
| `TELEGRAM_BOT_TOKEN` | For alerts | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | For alerts | Your numeric chat ID from @RawDataBot |

If `HELIUS_RPC_URL` is missing, the system falls back to the public Solana RPC (slower, rate-limited).

If Telegram vars are missing, alerts are silently skipped — the rest of the app works fine.

---

## 13. How Everything Connects

```
Browser
  │
  ├── / (Dashboard)
  │     Server fetches Birdeye trending + listings
  │     Renders TokenCards with HOT/RISK/WATCH badges
  │     HotTokenDetector (client) watches for new HOT tokens
  │         → fires sendHotTokenAlert() → POST /api/telegram-alert
  │
  ├── /wallet (Wallet Analyzer)
  │     User enters address → POST /api/wallet
  │         → Helius RPC (getTokenAccountsByOwner + getBalance)
  │         → Birdeye (token_overview × 20 tokens, batched)
  │         → Scores computed, wallet tagged
  │         → If riskScore > 70 → Telegram alert fired
  │     Results rendered: value, scores, token table, suggestions
  │
  ├── /alerts (Alerts Tab)
  │     Polls GET /api/alerts every 60 seconds
  │         → Birdeye trending tokens
  │         → Signal classification
  │         → processTokenAlerts() → Telegram messages
  │     UI shows HOT/RISK/WATCH lists, live badge, last-checked time
  │
  └── /token/[address] (Token Detail)
        Client fetches GET /api/token-detail?address=...
            → Birdeye token_overview (price, volume, liquidity, holders)
            → Birdeye token_security (mintable, freezable, score)
            → Birdeye history_price (24h OHLCV for chart)
        Renders stat cards, price chart, security analysis
```

---

*Built by [madubuezejoshua](https://github.com/Madubuezejoshua)*
