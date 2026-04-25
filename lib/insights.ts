/**
 * lib/insights.ts
 * Insight engine — transforms raw Birdeye data into actionable signals.
 */

import type { TokenSignal, TokenInsight, WalletAnalysis, WalletHolding } from "@/types";

export type { TokenSignal, TokenInsight, WalletAnalysis };

const SIGNAL_CONFIG: Record<TokenSignal, { emoji: string; label: string; color: string }> = {
  HOT:     { emoji: "🔥", label: "HOT",     color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  RISK:    { emoji: "⚠️", label: "RISK",    color: "text-red-400 bg-red-400/10 border-red-400/30" },
  WATCH:   { emoji: "👀", label: "WATCH",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  NEUTRAL: { emoji: "➖", label: "NEUTRAL", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
};

interface SignalInput {
  volume24hUSD?: number;
  volume24hChangePercent?: number;
  volumeChangePercent?: number;
  priceChange24hPercent?: number;
  liquidity?: number;
  rank?: number;
  securityScore?: number;
  isNew?: boolean;
}

export function getTokenSignal(token: SignalInput): TokenInsight {
  const volume = token.volume24hUSD ?? 0;
  const liquidity = token.liquidity ?? 0;
  const priceChange = token.priceChange24hPercent ?? 0;
  const volChange = token.volume24hChangePercent ?? token.volumeChangePercent ?? 0;
  const { rank, securityScore, isNew } = token;

  // 🔥 HOT: strong volume + liquidity + positive price action
  if (
    (volume > 1_000_000 && liquidity > 500_000 && priceChange > 0) ||
    (volChange > 50 && (rank === undefined || rank <= 30) && priceChange > 0)
  ) {
    return { signal: "HOT", ...SIGNAL_CONFIG.HOT };
  }

  // ⚠️ RISK: low liquidity, big dump, or poor security
  if (
    liquidity < 50_000 ||
    priceChange < -20 ||
    (securityScore !== undefined && securityScore < 30)
  ) {
    return { signal: "RISK", ...SIGNAL_CONFIG.RISK };
  }

  // 👀 WATCH: new listing or moderate momentum
  if (isNew || volChange > 10 || (priceChange > 5 && volume > 100_000)) {
    return { signal: "WATCH", ...SIGNAL_CONFIG.WATCH };
  }

  return { signal: "NEUTRAL", ...SIGNAL_CONFIG.NEUTRAL };
}

// ─── Wallet Analysis ──────────────────────────────────────────────────────────

export function analyzeWallet(
  holdings: WalletHolding[],
  trendingAddresses: Set<string>,
  riskyAddresses: Set<string>
): WalletAnalysis {
  const total = holdings.length;

  if (total === 0) {
    return {
      totalTokens: 0,
      riskScore: 0,
      exposureScore: 0,
      opportunityScore: 0,
      hotTokens: [],
      riskyTokens: [],
      suggestions: ["Enter a wallet address above to get started."],
    };
  }

  const hotTokens = holdings
    .filter((h) => trendingAddresses.has(h.address))
    .map((h) => h.symbol);

  const riskyTokens = holdings
    .filter((h) => riskyAddresses.has(h.address))
    .map((h) => h.symbol);

  const riskScore = Math.min(100, Math.round((riskyTokens.length / total) * 100));
  const exposureScore = Math.min(100, Math.round((hotTokens.length / total) * 100));
  const opportunityScore = Math.min(
    100,
    Math.round(
      ((trendingAddresses.size - hotTokens.length) / Math.max(trendingAddresses.size, 1)) * 100
    )
  );

  const suggestions: string[] = [];
  if (riskScore > 40)
    suggestions.push("⚠️ You are overexposed to risky tokens — consider rebalancing.");
  if (hotTokens.length > 0)
    suggestions.push(`🔥 You hold ${hotTokens.length} trending token(s) — momentum is strong.`);
  if (opportunityScore > 30)
    suggestions.push("👀 There are trending tokens you don't hold yet — potential opportunities.");
  if (riskScore < 20 && hotTokens.length === 0)
    suggestions.push("✅ Your portfolio looks stable but low on momentum plays.");
  if (suggestions.length === 0)
    suggestions.push("📊 Portfolio looks balanced. Keep monitoring for new opportunities.");

  return { totalTokens: total, riskScore, exposureScore, opportunityScore, hotTokens, riskyTokens, suggestions };
}
