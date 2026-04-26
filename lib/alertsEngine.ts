/**
 * lib/alertsEngine.ts
 * Processes tokens and fires Telegram alerts based on HOT / RISK / WATCH rules.
 * Server-side only — called from API routes.
 */

import { sendTelegramMessage, shouldSendAlert, markAlerted } from "./telegram-alerts";
import type { BirdeyeToken } from "@/types";

export interface AlertResult {
  hot: string[];
  risk: string[];
  watch: string[];
  sent: number;
}

export async function processTokenAlerts(tokens: BirdeyeToken[]): Promise<AlertResult> {
  const result: AlertResult = { hot: [], risk: [], watch: [], sent: 0 };

  for (const token of tokens) {
    const volume = token.volume24hUSD ?? 0;
    const liquidity = token.liquidity ?? 0;
    const priceChange = token.priceChange24hPercent ?? 0;
    const symbol = token.symbol || token.address?.slice(0, 8) || "UNKNOWN";

    // 🔥 HOT: high volume + good liquidity
    if (volume > 1_000_000 && liquidity > 500_000) {
      result.hot.push(symbol);
      if (shouldSendAlert(token.address)) {
        const ok = await sendTelegramMessage(
          `🔥 <b>HOT TOKEN ALERT</b>\n\n<b>${token.name || symbol}</b> (<code>${symbol}</code>)\n💰 Price: $${token.price?.toFixed(6) ?? "N/A"}\n📈 24h: ${priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)}%\n📊 Vol: $${(volume / 1_000_000).toFixed(2)}M\n💧 Liq: $${(liquidity / 1_000_000).toFixed(2)}M\n\n<code>${token.address}</code>`
        );
        if (ok) { markAlerted(token.address); result.sent++; }
      }
      continue; // don't double-classify
    }

    // ⚠️ RISK: very low liquidity
    if (liquidity > 0 && liquidity < 100_000) {
      result.risk.push(symbol);
      if (shouldSendAlert(`risk-${token.address}`)) {
        const ok = await sendTelegramMessage(
          `⚠️ <b>RISK TOKEN DETECTED</b>\n\n<b>${symbol}</b> has low liquidity: $${(liquidity / 1_000).toFixed(1)}K\nExercise caution.\n\n<code>${token.address}</code>`
        );
        if (ok) { markAlerted(`risk-${token.address}`); result.sent++; }
      }
      continue;
    }

    // 👀 WATCH: price momentum + decent volume
    if (priceChange > 5 && volume > 300_000) {
      result.watch.push(symbol);
      if (shouldSendAlert(`watch-${token.address}`)) {
        const ok = await sendTelegramMessage(
          `👀 <b>WATCH ALERT</b>\n\n<b>${symbol}</b> is trending +${priceChange.toFixed(2)}%\n📊 Vol: $${(volume / 1_000_000).toFixed(2)}M\n\n<code>${token.address}</code>`
        );
        if (ok) { markAlerted(`watch-${token.address}`); result.sent++; }
      }
    }
  }

  return result;
}
