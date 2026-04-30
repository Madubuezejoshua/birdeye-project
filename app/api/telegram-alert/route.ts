import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, chatId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return NextResponse.json({ error: "Telegram bot not configured" }, { status: 500 });
    }

    const targetChatId = chatId || defaultChatId;
    
    if (!targetChatId) {
      console.error("No chat ID provided");
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API error:", errorText);
      // Try again without parse_mode in case of HTML formatting error
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
        }),
      });
      if (!retry.ok) {
        const retryError = await retry.text();
        console.error("Telegram retry error:", retryError);
        return NextResponse.json(
          { error: "Failed to send Telegram message" },
          { status: 500 }
        );
      }
      const retryResult = await retry.json();
      return NextResponse.json({ success: true, result: retryResult });
    }

    const result = await response.json();
    console.log("✅ Telegram alert sent successfully");
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Telegram alert API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}