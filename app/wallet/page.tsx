"use client";
import { useState } from "react";
import WalletInsights from "@/components/WalletInsights";
import { Loader } from "@/components/Loader";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { Wallet, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { WalletApiResponse } from "@/types";

export default function WalletPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalletApiResponse | null>(null);
  const [error, setError] = useState("");

  async function analyze() {
    const trimmed = address.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(trimmed)}`);
      const data: WalletApiResponse = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-cyan-400" />
          Wallet Analyzer
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter a Solana wallet address to get portfolio insights
        </p>
      </div>

      {/* Input */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="Enter Solana wallet address..."
            className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
            spellCheck={false}
          />
          <button
            onClick={analyze}
            disabled={loading || !address.trim()}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && <Loader text="Fetching wallet data..." />}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Analysis Results</h2>
            <span className="text-gray-500 text-xs font-mono hidden sm:block">
              {shortenAddress(address, 6)}
            </span>
          </div>

          <WalletInsights analysis={result.analysis} />

          {/* Holdings table */}
          {result.holdings.length > 0 && (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">
                Token Holdings ({result.holdings.length})
              </h3>
              <div className="space-y-0 max-h-72 overflow-y-auto">
                {result.holdings.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {h.symbol?.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-white text-sm font-medium">{h.symbol}</span>
                        {h.name && (
                          <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">
                            {h.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs font-mono">
                        {h.valueUsd !== undefined ? formatNumber(h.valueUsd, "$") : "—"}
                      </span>
                      <Link
                        href={`/token/${h.address}`}
                        className="text-gray-600 hover:text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Enter a Solana wallet address above to see portfolio insights, risk scores, and smart suggestions.
          </p>
        </div>
      )}
    </div>
  );
}
