import { NextResponse } from "next/server";
import { getTokenOverview, getTokenSecurity, getTokenPriceHistory } from "@/lib/birdeye";
import type { TokenDetailResponse } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const [overviewRes, securityRes, historyRes] = await Promise.allSettled([
      getTokenOverview(address),
      getTokenSecurity(address),
      getTokenPriceHistory(address, "1D"),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = overviewRes.status === "fulfilled" ? overviewRes.value?.data ?? null : null;

    // Normalize overview — Birdeye uses different field names in overview vs trending
    const overview = raw ? {
      ...raw,
      volume24hUSD:          raw.v24hUSD          ?? raw.volume24hUSD          ?? 0,
      volumeChangePercent:   raw.v24hChangePercent ?? raw.volumeChangePercent   ?? 0,
      priceChange24hPercent: raw.priceChange24hPercent ?? raw.price24hChangePercent ?? 0,
      marketCap:             raw.marketCap         ?? raw.mc                    ?? raw.fdv ?? 0,
      holder:                raw.holder            ?? raw.holders               ?? 0,
    } : null;

    const security = securityRes.status === "fulfilled" ? securityRes.value?.data ?? null : null;

    // History items from Birdeye: [{ unixTime, value }]
    const history = historyRes.status === "fulfilled"
      ? (historyRes.value?.data?.items ?? [])
      : [];

    const response: TokenDetailResponse = { overview, security, history };
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
