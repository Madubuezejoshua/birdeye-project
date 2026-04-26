import { NextResponse } from "next/server";
import { getTrendingTokens } from "@/lib/birdeye";

export async function GET() {
  try {
    console.log("🧪 Testing Birdeye API connection...");
    
    // Test with a simple trending tokens call
    const result = await getTrendingTokens(5);
    
    return NextResponse.json({
      success: true,
      message: "Birdeye API is working correctly",
      sampleData: {
        tokensFound: result?.data?.tokens?.length || 0,
        firstToken: result?.data?.tokens?.[0] || null,
      }
    });
  } catch (error) {
    console.error("Birdeye API test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}