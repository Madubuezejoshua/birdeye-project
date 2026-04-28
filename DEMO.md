# Demo Walkthrough — Birdeye Intelligence Dashboard

This guide walks you through every feature of the app step by step. Follow along to see everything working.

---

## Before You Start

Make sure the app is running:

```bash
npm run dev
```

Open your browser at: **http://localhost:3000**

You should see a dark dashboard with a navbar at the top showing: **Dashboard | Wallet | Alerts**

---

## Step 1 — Dashboard (Market Overview)

**What to do:** Just open the app. No action needed.

**What you should see:**
- A stats bar showing: Trending Tokens count, New Listings count, Hot Tokens count, Data Source (Birdeye)
- A "Hot Right Now" section with up to 4 token cards highlighted in orange
- A "Trending Tokens" grid with 20 token cards
- A "New Listings" section with recently listed tokens
- Each token card shows: symbol, price, 24h change, volume, liquidity, and a signal badge

**Signal badges explained:**
- 🔥 **HOT** (orange) — high volume + high liquidity, strong momentum
- ⚠️ **RISK** (red) — low liquidity, exercise caution
- 👀 **WATCH** (yellow) — moderate activity, worth monitoring

**Working correctly looks like:** Token cards loaded with real prices and badges. The page auto-refreshes data every 30 seconds in the background.

---

## Step 2 — Token Detail Page

**What to do:** Click on any token card.

**What you should see:**
- Token name, symbol, and signal badge at the top
- Six stat cards: Price, 24h Change, Volume 24h, Liquidity, Market Cap, Holders
- A 24h price history chart (line chart)
- Security Analysis section showing: security score bar, mintable/freezable flags, top holder %
- A back arrow to return to the dashboard

**Working correctly looks like:** Stats populated with real numbers. If price history is unavailable for a token (free tier limitation), the chart area shows "No price history available" — this is expected for some tokens.

---

## Step 3 — Wallet Analyzer

**What to do:** Click **Wallet** in the navbar.

**What you should see:** An input field asking for a Solana wallet address.

**Test with this active wallet:**
```
9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

Paste it in and click **Analyze** (or press Enter).

**What happens while loading:**
- A spinner appears with "Fetching wallet data from Solana + Birdeye..."
- The app fetches all SPL tokens from the Solana blockchain via Helius RPC
- Then enriches each token with live price data from Birdeye

**What you should see after loading:**

1. **Wallet Tag** (top right) — e.g. "🐋 Whale Wallet" or "🔥 Smart Money Wallet" based on portfolio size and holdings

2. **Portfolio Summary cards:**
   - Total Value (USD)
   - Top 3 holdings with symbol, USD value, and price

3. **Score bars (0–100 each):**
   - **Risk Score** — how much of the portfolio is low-liquidity or unpriced (lower is better)
   - **Exposure Score** — how much of the portfolio is in high-volume trending tokens (higher is better)
   - **Opportunity Score** — inverse of risk score

4. **Portfolio Summary stats:** total tokens, trending count, risky count

5. **Token Holdings table** — all tokens with:
   - Symbol and name
   - Token balance
   - 24h price change (green/red)
   - USD value
   - 🔥 Heat Score badge (shown if score ≥ 60)
   - ⚠️ Low liquidity warning icon
   - Link to token detail page

6. **Smart Suggestions** — auto-generated advice like:
   - "🔥 You hold 3 high-volume token(s) — strong momentum."
   - "⚠️ Over 40% of holdings are low-liquidity — consider rebalancing."

**Working correctly looks like:** Token list populated, scores showing real numbers, suggestions relevant to the portfolio.

**Debug panel:** Click the small bug icon (🐛) next to the wallet address to see: SPL tokens fetched, SOL balance, RPC status, Birdeye status.

---

## Step 4 — Alerts Tab

**What to do:** Click **Alerts** in the navbar.

**What you should see immediately:**
- A "Live Monitoring" badge with a pulsing green dot in the top right
- Three count cards: Hot Alerts, Risk Alerts, Watch Alerts
- A last-checked timestamp
- Three sections listing HOT / RISK / WATCH tokens

**What happens automatically:**
- The page calls the alert API immediately on load
- Then repeats every 60 seconds automatically
- Each cycle checks Birdeye for new HOT/RISK/WATCH tokens
- If a qualifying token is found and hasn't been alerted in 30 minutes, a Telegram message is sent

**Working correctly looks like:** Count cards show real numbers (e.g. "8 Hot Alerts"), token lists populated with symbols and price changes, last-checked time updating every minute.

**Manual refresh:** Click the refresh icon (↻) next to the live badge to trigger an immediate check.

---

## Step 5 — Telegram Bot Test

**What to do:** On the Alerts tab, scroll down to the **Telegram Bot Test** panel.

**What to do:**
1. Leave the Chat ID field blank (it uses the configured ID from `.env.local`)
2. Leave the default test message or type your own
3. Click **Send Test Alert**

**What you should see:**
- A green "✅ Message sent! Check your Telegram." confirmation
- A message arriving in your Telegram from the bot within a few seconds

**Working correctly looks like:** Green confirmation on screen + message received in Telegram.

**If it fails:** Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in `.env.local` and the server was restarted after adding them. See [SETUP.md](./SETUP.md) for full instructions.

---

## Summary — What "Fully Working" Looks Like

| Feature | Expected Result |
|---|---|
| Dashboard loads | 20 trending tokens + new listings visible |
| Token badges | HOT / RISK / WATCH on every card |
| Token detail | Price, volume, liquidity, security data |
| Wallet analyzer | Token list, scores, suggestions |
| Wallet tag | Smart Money / Whale / etc. shown |
| Heat scores | 🔥 badge on high-scoring tokens |
| Alerts tab | HOT/RISK/WATCH counts + token lists |
| Live monitoring | Pulsing green badge, auto-refresh every 60s |
| Telegram test | Message received in Telegram |
| Auto alerts | Telegram messages firing for HOT tokens |
