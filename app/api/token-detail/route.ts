import { NextResponse } from "next/server";
import { getTokenOverview, getTokenSecurity, getTokenPriceHistory } from "@/lib/birdeye";
import type { TokenDetailResponse } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const [overview, security, history] = await Promise.allSettled([
      getTokenOverview(address),
      getTokenSecurity(address),
      getTokenPriceHistory(address, "1D"),
    ]);

    const response: TokenDetailResponse = {
      overview: overview.status === "fulfilled" ? overview.value?.data ?? null : null,
      security: security.status === "fulfilled" ? security.value?.data ?? null : null,
      history:  history.status  === "fulfilled" ? history.value?.data?.items ?? [] : [],
    };

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
