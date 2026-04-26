import { NextResponse } from "next/server";
import { getTrendingTokens } from "@/lib/birdeye";
import { getTokenSignal } from "@/lib/insights";
import { processTokenAlerts } from "@/lib/alertsEngine";
import type { BirdeyeToken } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await getTrendingTokens(20);
    const tokens: BirdeyeToken[] = res?.data?.tokens ?? [];

    // Classify tokens
    const hot: BirdeyeToken[] = [];
    const risk: BirdeyeToken[] = [];
    const watch: BirdeyeToken[] = [];

    for (const t of tokens) {
      const signal = getTokenSignal({
        volume24hUSD: t.volume24hUSD,
        volumeChangePercent: t.volumeChangePercent,
        priceChange24hPercent: t.priceChange24hPercent,
        rank: t.rank,
        liquidity: t.liquidity,
      }).signal;

      if (signal === "HOT") hot.push(t);
      else if (signal === "RISK") risk.push(t);
      else watch.push(t);
    }

    // Fire Telegram alerts (non-blocking)
    const alertResult = await processTokenAlerts(tokens);

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      counts: { hot: hot.length, risk: risk.length, watch: watch.length, total: tokens.length },
      alertsSent: alertResult.sent,
      tokens: { hot, risk, watch },
    });
  } catch (err) {
    console.error("Alerts API error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
