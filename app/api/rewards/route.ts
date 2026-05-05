import { NextResponse } from "next/server";
import { getActiveIncentive } from "@/lib/torque";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const incentive = await getActiveIncentive();
    return NextResponse.json({ success: true, incentive });
  } catch (err) {
    console.error("Rewards API error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
