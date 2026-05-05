import { NextResponse } from "next/server";
import { getWalletRank } from "@/lib/torque";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    const rank = await getWalletRank(wallet);
    return NextResponse.json({ rank });
  } catch {
    return NextResponse.json({ rank: null });
  }
}
