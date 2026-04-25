import { NextResponse } from "next/server";
import { getTokenSecurity } from "@/lib/birdeye";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });
    const data = await getTokenSecurity(address);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
