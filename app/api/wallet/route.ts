import { NextResponse } from "next/server";
import { getWalletPortfolio, getTrendingTokens, getTokenSecurity } from "@/lib/birdeye";
import { analyzeWallet } from "@/lib/insights";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("address");
    if (!wallet) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const [portfolioRes, trendingRes] = await Promise.allSettled([
      getWalletPortfolio(wallet),
      getTrendingTokens(50),
    ]);

    const portfolio = portfolioRes.status === "fulfilled" ? portfolioRes.value : null;
    const trending = trendingRes.status === "fulfilled" ? trendingRes.value : null;

    const holdings: Array<{ symbol: string; valueUsd?: number; address: string }> =
      portfolio?.data?.items?.map((t: { symbol: string; valueUsd?: number; address: string }) => ({
        symbol: t.symbol,
        valueUsd: t.valueUsd,
        address: t.address,
      })) || [];

    const trendingAddresses = new Set<string>(
      (trending?.data?.tokens || []).map((t: { address: string }) => t.address)
    );

    // Check security for risky tokens (limit to first 5 to avoid rate limits)
    const riskyAddresses = new Set<string>();
    const securityChecks = holdings.slice(0, 5).map(async (h) => {
      try {
        const sec = await getTokenSecurity(h.address);
        const score = sec?.data?.score ?? 100;
        if (score < 30) riskyAddresses.add(h.address);
      } catch {
        // ignore
      }
    });
    await Promise.allSettled(securityChecks);

    const analysis = analyzeWallet(holdings, trendingAddresses, riskyAddresses);

    return NextResponse.json({ holdings, analysis, trendingCount: trendingAddresses.size });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
