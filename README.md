This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Birdeye Intelligence Dashboard

A real-time crypto trading signal dashboard powered by Birdeye API with intelligent HOT token alerts.

### Features

- 🔥 **HOT Token Detection**: Automatically identifies high-volume, high-liquidity tokens
- 📱 **Real-time Alerts**: Telegram and email notifications for new HOT tokens
- 📊 **Signal Intelligence**: WATCH, HOT, and RISK classifications
- 💰 **Live Market Data**: Real-time prices, volume, and liquidity data
- 🔍 **Token Analysis**: Detailed security scores and market metrics

### Alert System Setup

1. **Telegram Alerts** (Recommended):
   - Your bot token is already configured: `8592780330:AAHB4L2cDqS4xMN0gq3sAwBbOBufk53oOn8`
   - Message your bot first to start a conversation
   - Go to `/alerts` page and use the "Telegram Bot Test" panel
   - Get your chat ID and add it to `.env.local` as `TELEGRAM_CHAT_ID`
   - Real-time HOT token alerts will be sent automatically!

2. **Email Alerts**:
   - Enter your email on the `/alerts` page
   - Email integration requires additional setup (SendGrid, AWS SES, etc.)

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
