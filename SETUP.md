# Telegram Bot Setup Guide

This guide walks you through creating a Telegram bot, getting your chat ID, and connecting it to the Birdeye Intelligence Dashboard.

---

## Step 1 — Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. BotFather will ask for a name — enter anything, e.g. `My Birdeye Bot`
4. Then it asks for a username — must end in `bot`, e.g. `mybirdeye_bot`
5. BotFather replies with your **Bot Token** — it looks like this:

```
8592780330:AAHB4L2cDqS4xMN0gq3sAwBbOBufk53oOn8
```

Copy this token — you'll need it for `.env.local`.

---

## Step 2 — Get Your Numeric Chat ID

You need your **numeric chat ID** (not your @username — usernames don't work with the Bot API).

1. Open Telegram and search for **@RawDataBot**
2. Start a chat and send any message (e.g. `/start`)
3. @RawDataBot instantly replies with your full user info, including:

```json
{
  "update_id": 123456789,
  "message": {
    "from": {
      "id": 5449237062,       <-- this is your chat ID
      "username": "yourname"
    }
  }
}
```

4. Copy the `id` number — that is your `TELEGRAM_CHAT_ID`

---

## Step 3 — Start a Conversation with Your Bot

Before your bot can send you messages, you must message it first:

1. Search for your bot by its username in Telegram (e.g. `@mybirdeye_bot`)
2. Click **Start** or send `/start`

This activates the chat so the bot can reach you.

---

## Step 4 — Add to .env.local

Open `.env.local` in the project root and add:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_numeric_id_from_rawdatabot
```

Example:

```env
TELEGRAM_BOT_TOKEN=8592780330:AAHB4L2cDqS4xMN0gq3sAwBbOBufk53oOn8
TELEGRAM_CHAT_ID=5449237062
```

---

## Step 5 — Restart the Server

Environment variables only load on server start:

```bash
npm run dev
```

---

## Step 6 — Test the Connection

1. Go to the **Alerts** tab in the dashboard
2. Scroll to **Telegram Bot Test**
3. Leave the Chat ID field blank (it uses your `.env.local` value automatically)
4. Click **Send Test Alert**
5. You should receive a message in Telegram within seconds

---

## How Alerts Work

Once set up, alerts fire automatically — no manual action needed:

| Trigger | Condition | Message |
|---|---|---|
| HOT token | Volume > $1M + Liquidity > $500K | `🔥 HOT TOKEN ALERT` |
| RISK token | Liquidity < $100K | `⚠️ RISK TOKEN DETECTED` |
| WATCH token | Price change > 5% + Volume > $300K | `👀 WATCH ALERT` |
| Wallet risk | Risk score > 70/100 | `⚠️ WALLET RISK ALERT` |

Alerts have a **30-minute cooldown** per token to prevent spam.

The alert engine checks trending tokens every **60 seconds** automatically when the dashboard is open.

---

## Troubleshooting

**"Failed to send Telegram message"**
- Make sure you sent `/start` to your bot first
- Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct in `.env.local`
- Restart the dev server after editing `.env.local`

**"Chat not found"**
- You used an @username instead of a numeric ID — use @RawDataBot to get the number

**Bot token not working**
- Go back to @BotFather, send `/mybots`, select your bot, and regenerate the token
