import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get bot info" }, { status: 500 });
    }

    const botInfo = await response.json();
    
    return NextResponse.json({
      success: true,
      bot: {
        username: botInfo.result.username,
        first_name: botInfo.result.first_name,
        id: botInfo.result.id,
      }
    });
  } catch (error) {
    console.error("Bot info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}