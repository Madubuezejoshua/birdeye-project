import { NextResponse } from "next/server";
import { getTrendingTokens } from "@/lib/birdeye";
import { getTokenSignal } from "@/lib/insights";
import { sendHotTokenAlert } from "@/lib/telegram-alerts";

export async function GET() {
  try {
    const data = await getTrendingTokens(20);
    const tokens = data?.data?.tokens ?? [];

    // Fire server-side Telegram alerts for HOT tokens (non-blocking)
    const hotTokens = tokens.filter(
      (t: any) => getTokenSignal({
        volume24hUSD: t.volume24hUSD,
        volumeChangePercent: t.volumeChangePercent,
        rank: t.rank,
        liquidity: t.liquidity,
      }).signal === "HOT"
    );

    // Send alerts in background — don't await so it doesn't slow the response
    Promise.allSettled(hotTokens.map((t: any) => sendHotTokenAlert(t))).catch(() => {});

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
