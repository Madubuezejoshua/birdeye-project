import { NextResponse } from "next/server";
import { getTokenOverview, getTokenSecurity, getTokenPriceHistory } from "@/lib/birdeye";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    const [overview, security, history] = await Promise.allSettled([
      getTokenOverview(address),
      getTokenSecurity(address),
      getTokenPriceHistory(address, "1D"),
    ]);
    return NextResponse.json({
      overview: overview.status === "fulfilled" ? overview.value : null,
      security: security.status === "fulfilled" ? security.value : null,
      history: history.status === "fulfilled" ? history.value : null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
