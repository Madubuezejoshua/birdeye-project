import { NextResponse } from "next/server";
import { apiCounter } from "@/lib/apiCounter";

export async function GET() {
  try {
    const stats = apiCounter.getStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("API stats error:", error);
    return NextResponse.json(
      { error: "Failed to get API statistics" },
      { status: 500 }
    );
  }
}

// Optional: Add a reset endpoint for testing (remove in production)
export async function DELETE() {
  try {
    apiCounter.reset();
    
    return NextResponse.json({ 
      success: true, 
      message: "API counter reset" 
    });
  } catch (error) {
    console.error("API reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset API counter" },
      { status: 500 }
    );
  }
}