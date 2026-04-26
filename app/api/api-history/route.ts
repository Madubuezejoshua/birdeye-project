import { NextResponse } from "next/server";
import { apiCounter } from "@/lib/apiCounter";

export async function GET() {
  try {
    const history = apiCounter.getHistory(20); // Get last 20 calls
    
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("API history error:", error);
    return NextResponse.json(
      { error: "Failed to get API call history" },
      { status: 500 }
    );
  }
}