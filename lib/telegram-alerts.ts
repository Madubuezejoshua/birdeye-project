/**
 * lib/telegram-alerts.ts
 * Server-side Telegram alert helpers.
 * Call these ONLY from API routes / server components — never from client.
 */

import type { BirdeyeToken } from "@/types";

const COOLDOWN_MS = 30 * 60 * 1000; // 30 min
const alertTimestamps = new Map<string, number>();

export function shouldSendAlert(address: string): boolean {
  const last = alertTimestamps.get(address);
  return !last || Date.now() - last > COOLDOWN_MS;
}

export function markAlerted(address: string): void {
  alertTimestamps.set(address, Date.now());
  // Prune entries older than 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [addr, ts] of alertTimestamps) {
    if (ts < cutoff) alertTimestamps.delete(addr);
  }
}

/** Send a message directly via Telegram Bot API (server-side only) */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("⚠️ Telegram not configured — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram send failed:", err);
    return false;
  }
}

export function formatHotTokenAlert(token: BirdeyeToken): string {
  const price = token.price ? `$${token.price.toFixed(6)}` : "N/A";
  const vol = token.volume24hUSD ? `$${(token.volume24hUSD / 1_000_000).toFixed(2)}M` : "N/A";
  const liq = token.liquidity ? `$${(token.liquidity / 1_000_000).toFixed(2)}M` : "N/A";
  const chg = token.priceChange24hPercent != null
    ? `${token.priceChange24hPercent > 0 ? "+" : ""}${token.priceChange24hPercent.toFixed(2)}%`
    : "N/A";

  return `🔥 <b>HOT TOKEN ALERT</b>

<b>${token.name || token.symbol}</b> (<code>${token.symbol}</code>)
💰 Price: ${price}
📈 24h Change: ${chg}
📊 Volume 24h: ${vol}
💧 Liquidity: ${liq}

Contract: <code>${token.address}</code>`;
}

export function formatWalletRiskAlert(wallet: string, riskScore: number, riskyTokens: string[]): string {
  return `⚠️ <b>WALLET RISK ALERT</b>

Wallet: <code>${wallet.slice(0, 8)}...${wallet.slice(-6)}</code>
Risk Score: <b>${riskScore}/100</b>
Risky Tokens: ${riskyTokens.slice(0, 5).join(", ") || "N/A"}

🛡️ Consider rebalancing your portfolio.`;
}

/** Send HOT token alert with cooldown check */
export async function sendHotTokenAlert(token: BirdeyeToken): Promise<boolean> {
  if (!shouldSendAlert(token.address)) return false;
  const text = formatHotTokenAlert(token);
  const ok = await sendTelegramMessage(text);
  if (ok) markAlerted(token.address);
  return ok;
}
