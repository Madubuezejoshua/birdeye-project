import { NextResponse } from "next/server";
import { getNewListings } from "@/lib/birdeye";

export async function GET() {
  try {
    const data = await getNewListings(20);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
