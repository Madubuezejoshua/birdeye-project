"use client";

import { useState } from "react";
import { Send, TestTube, CheckCircle } from "lucide-react";

export default function TelegramTestPanel() {
  const [chatId, setChatId] = useState("");
  const [testMessage, setTestMessage] = useState("🔥 Test HOT Token Alert - This is a test message from your Birdeye Intelligence Dashboard!");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const sendTestAlert = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const body: Record<string, string> = { message: testMessage };
      // Only pass chatId if user typed one — otherwise API uses env TELEGRAM_CHAT_ID
      if (chatId.trim()) body.chatId = chatId.trim();

      const response = await fetch("/api/telegram-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setResult({ ok: true, text: "✅ Message sent! Check your Telegram." });
      } else {
        // Give a helpful error based on what went wrong
        const errMsg = json.error ?? "Unknown error";
        let hint = "";
        if (errMsg.includes("chat not found") || errMsg.includes("Bad Request")) {
          hint = " — Make sure you've sent a message to the bot first, then use your numeric chat ID (not @username).";
        } else if (errMsg.includes("bot not configured")) {
          hint = " — TELEGRAM_BOT_TOKEN is missing from .env.local.";
        } else if (errMsg.includes("Chat ID required")) {
          hint = " — TELEGRAM_CHAT_ID is missing from .env.local.";
        }
        setResult({ ok: false, text: `❌ ${errMsg}${hint}` });
      }
    } catch {
      setResult({ ok: false, text: "❌ Network error — is the dev server running?" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <TestTube className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-semibold">Telegram Bot Test</h2>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
          Bot: @Birdeyealerbot
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-5">
        Send a test alert to your Telegram. Leave chat ID blank to use the one in .env.local.
      </p>

      <div className="space-y-4">
        {/* Chat ID — optional */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">
            Chat ID <span className="text-gray-600">(optional — leave blank to use env default)</span>
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="e.g. 5449237062  (numeric ID only, not @username)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-cyan-500/50 focus:outline-none"
          />
          <p className="text-gray-600 text-xs mt-1">
            ⚠️ @username does not work — you need the numeric chat ID. Message <code className="text-gray-400">@RawDataBot</code> on Telegram to get yours instantly.
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">Message</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 focus:outline-none resize-none"
          />
        </div>

        {/* Send button — always enabled */}
        <button
          onClick={sendTestAlert}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSending ? "Sending..." : "Send Test Alert"}
        </button>

        {/* Result */}
        {result && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            result.ok
              ? "bg-green-500/10 border border-green-500/30 text-green-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}>
            {result.ok && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{result.text}</span>
          </div>
        )}

        {/* Info box */}
        <div className="bg-gray-800/60 border border-white/5 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <div>Your bot token and chat ID are already set in <code className="text-gray-400">.env.local</code></div>
          <div>To get a numeric chat ID: message <code className="text-gray-400">@RawDataBot</code> on Telegram — it replies with your chat ID instantly</div>
          <div>@username format is NOT supported by the Telegram Bot API for sending messages</div>
        </div>
      </div>
    </div>
  );
}
