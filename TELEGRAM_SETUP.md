# 🤖 Telegram Bot Setup Guide

## 🔐 Security Implementation Complete

✅ **Bot token stored securely in environment variables**  
✅ **Never exposed to frontend code**  
✅ **Backend-only API routes**  
✅ **Spam prevention with cooldown system**  

## 📋 Setup Steps

### 1. 🤖 Create Your Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "Birdeye HOT Alerts")
4. Choose a username (e.g., "birdeye_hot_alerts_bot")
5. Copy the bot token provided by BotFather

### 2. 🔑 Configure Environment Variables

Your `.env.local` is already configured with your bot token:
```env
TELEGRAM_BOT_TOKEN=8592780330:AAHB4L2cDqS4xMN0gq3sAwBbOBufk53oOn8
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

### 3. 📱 Get Your Chat ID

**Option A: Use the Test Panel**
1. Go to `/alerts` page in your dashboard
2. Message your bot first (send any message like "Hello")
3. Use the "Telegram Bot Test" panel
4. Enter your @username or chat ID
5. Send a test message

**Option B: Manual Method**
1. Message your bot: `/start`
2. Visit: `https://api.telegram.org/bot8592780330:AAHB4L2cDqS4xMN0gq3sAwBbOBufk53oOn8/getUpdates`
3. Find your chat ID in the response
4. Add it to `.env.local` as `TELEGRAM_CHAT_ID`

### 4. 🧪 Test the Integration

1. Visit `/alerts` page
2. Use the "Telegram Bot Test" panel
3. Send a test message to verify connection
4. Check your Telegram for the test message

## 🔥 HOT Token Alert System

### Features Implemented:

- **🚨 Real-time Detection**: Monitors tokens every 30 seconds
- **🛡️ Spam Prevention**: 30-minute cooldown per token
- **📊 Rich Formatting**: Includes price, volume, liquidity data
- **🔒 Secure Backend**: Bot token never exposed to frontend
- **⚡ Instant Notifications**: Alerts sent within seconds

### Alert Format:
```
🔥 HOT TOKEN ALERT

Name: Solana Token
Symbol: SOL
Price: $23.456789
24h Change: +12.34%
Volume 24h: $45.67M
Liquidity: $12.34M

🚀 This token just hit HOT status!
📊 High volume + High liquidity detected

Contract: So11111111111111111111111111111111111112
```

## 🛠️ Technical Implementation

### API Routes Created:
- `POST /api/telegram-alert` - Send alerts (secure, backend-only)
- `GET /api/telegram-info` - Get bot information (for testing)

### Components Added:
- `HotTokenDetector` - Real-time token monitoring
- `TelegramTestPanel` - Bot testing interface
- `telegram-alerts.ts` - Secure alert system

### Security Features:
- ✅ Environment variables only
- ✅ Server-side API routes
- ✅ No frontend token exposure
- ✅ Cooldown spam prevention
- ✅ Error handling and logging

## 🚀 Usage

Once configured, the system will:

1. **Monitor** all trending tokens every 30 seconds
2. **Detect** when tokens reach HOT status (volume > 500K + liquidity > 200K)
3. **Alert** you instantly via Telegram
4. **Prevent spam** with 30-minute cooldowns per token
5. **Log** all activities for debugging

## 🔧 Troubleshooting

**Bot not responding?**
- Ensure you messaged the bot first
- Check bot token in `.env.local`
- Verify chat ID is correct

**No alerts received?**
- Check console logs for errors
- Verify HOT tokens exist in current market
- Test with the Telegram Test Panel

**Getting spam alerts?**
- Cooldown system prevents this (30 min per token)
- Check console for "cooldown active" messages

## 🎯 Next Steps

1. **Message your bot** to start conversation
2. **Test the integration** using the test panel
3. **Add your chat ID** to environment variables
4. **Monitor the dashboard** for HOT token alerts!

Your Telegram bot is now ready to send real-time HOT token alerts! 🔥📱