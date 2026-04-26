import { NextResponse } from "next/server";
import { apiCounter } from "@/lib/apiCounter";

// Force dynamic so Next.js never caches this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = apiCounter.getStats();
    
    return NextResponse.json({
      count: apiCounter.get(),
      ...stats,
    });
  } catch (error) {
    console.error("Counter API error:", error);
    return NextResponse.json(
      { error: "Failed to get counter data" },
      { status: 500 }
    );
  }
}

// Reset endpoint for testing
export async function DELETE() {
  try {
    apiCounter.reset();
    
    return NextResponse.json({ 
      success: true, 
      message: "API counter reset",
      count: 0
    });
  } catch (error) {
    console.error("Counter reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset counter" },
      { status: 500 }
    );
  }
}