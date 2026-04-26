"use client";
import { useState } from "react";
import WalletInsights from "@/components/WalletInsights";
import Loader from "@/components/Loader";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { Wallet, Search, ExternalLink, TrendingUp, AlertTriangle, DollarSign, Bug } from "lucide-react";
import Link from "next/link";

interface EnrichedToken {
  mint: string;
  balance: number;
  name: string;
  symbol: string;
  price: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
  valueUsd: number;
  logoURI: string;
  heatScore?: number;
}

interface WalletResult {
  success: boolean;
  error?: string;
  tokens: EnrichedToken[];
  totalValue: number;
  walletTag?: string;
  top3: Array<{ symbol: string; valueUsd: number; price: number; heatScore?: number }>;
  debug?: {
    splTokens: number;
    solBalance: number;
    totalTokensAnalyzed: number;
    rpcStatus: string;
    birdeyeStatus: string;
  };
  analysis: {
    totalTokens: number;
    riskScore: number;
    exposureScore: number;
    opportunityScore: number;
    hotTokens: string[];
    riskyTokens: string[];
    suggestions: string[];
  };
}

export default function WalletPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  async function analyze() {
    const trimmed = address.trim();
    if (!trimmed) return;

    if (trimmed.length < 32 || trimmed.length > 44) {
      setError("Invalid address length. Solana wallet addresses are 32–44 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed }),
      });

      const data: WalletResult = await res.json();

      if (!data.success) {
        setError(data.error || "Unable to fetch wallet data. Try again.");
        return;
      }

      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error. Please try again.");
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
            placeholder="e.g. 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
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

      {/* Loading */}
      {loading && <Loader text="Fetching wallet data from Solana + Birdeye..." />}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Analysis Results</h2>
            <div className="flex items-center gap-2">
              {result.walletTag && (
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
                  {result.walletTag}
                </span>
              )}
              <span className="text-gray-500 text-xs font-mono">{shortenAddress(address, 6)}</span>
              <button
                onClick={() => setShowDebug((v) => !v)}
                className="text-gray-600 hover:text-cyan-400 transition-colors"
                title="Toggle debug panel"
              >
                <Bug className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebug && result.debug && (
            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-4 text-xs font-mono space-y-1">
              <div className="text-yellow-400 font-semibold mb-2">Debug Info</div>
              <div className="text-gray-400">SPL Tokens fetched: <span className="text-white">{result.debug.splTokens}</span></div>
              <div className="text-gray-400">SOL Balance: <span className="text-white">{result.debug.solBalance.toFixed(4)} SOL</span></div>
              <div className="text-gray-400">Total tokens analyzed: <span className="text-white">{result.debug.totalTokensAnalyzed}</span></div>
              <div className="text-gray-400">RPC Status: <span className={result.debug.rpcStatus === "ok" ? "text-green-400" : "text-red-400"}>{result.debug.rpcStatus}</span></div>
              <div className="text-gray-400">Birdeye Status: <span className={result.debug.birdeyeStatus === "ok" ? "text-green-400" : "text-yellow-400"}>{result.debug.birdeyeStatus}</span></div>
            </div>
          )}

          {/* Portfolio Value + Top 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1 bg-gray-900 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-xs">Total Value</span>
              </div>
              <div className="text-white font-bold text-xl">
                {result.totalValue > 0 ? formatNumber(result.totalValue, "$") : "—"}
              </div>
              {result.totalValue === 0 && (
                <div className="text-gray-600 text-xs mt-1">Price data unavailable</div>
              )}
            </div>

            {result.top3?.map((t, i) => (
              <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-gray-500 text-xs">#{i + 1}</span>
                  <span className="text-gray-300 text-xs font-medium truncate">{t.symbol}</span>
                </div>
                <div className="text-white font-bold text-sm">
                  {t.valueUsd > 0 ? formatNumber(t.valueUsd, "$") : "—"}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  @ {t.price > 0 ? formatNumber(t.price, "$") : "no price"}
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <WalletInsights analysis={result.analysis} />

          {/* Holdings Table */}
          {result.tokens.length > 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">
                Token Holdings ({result.tokens.length})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-0">
                {result.tokens.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(t.symbol || "?").slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {t.symbol || t.mint.slice(0, 8)}
                        </div>
                        {t.name && (
                          <div className="text-gray-500 text-xs truncate">{t.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-gray-400 text-xs">
                          {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                      </div>

                      {t.priceChange24h !== 0 && (
                        <div className={`text-xs font-mono ${t.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {t.priceChange24h >= 0 ? "+" : ""}{t.priceChange24h.toFixed(1)}%
                        </div>
                      )}

                      <div className="text-gray-300 text-sm font-mono w-20 text-right">
                        {t.valueUsd > 0 ? formatNumber(t.valueUsd, "$") : "—"}
                      </div>

                      <div className="flex items-center gap-1">
                        {t.volume24h > 1_000_000 && (
                          <TrendingUp className="w-3 h-3 text-orange-400" title="Trending" />
                        )}
                        {t.liquidity > 0 && t.liquidity < 50_000 && (
                          <AlertTriangle className="w-3 h-3 text-yellow-400" title="Low liquidity" />
                        )}
                        {t.heatScore !== undefined && t.heatScore >= 60 && (
                          <span className="text-xs font-mono text-orange-400" title="Heat Score">
                            🔥{t.heatScore}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/token/${t.mint}`}
                        className="text-gray-600 hover:text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-8 text-center">
              <Wallet className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">This wallet has no SPL tokens but may hold SOL.</p>
              <p className="text-gray-600 text-xs mt-1">Try a different wallet address with active token holdings.</p>
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
          <p className="text-gray-600 text-xs mt-3">
            Try: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
          </p>
        </div>
      )}
    </div>
  );
}
