"use client";
import Link from "next/link";
import { getTokenSignal } from "@/lib/insights";
import { formatPrice, formatNumber, formatPercent, changeColor } from "@/lib/utils";
import { safeDisplayValue } from "@/lib/normalizeToken";
import Badge from "@/components/Badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { BirdeyeToken } from "@/types";

interface TokenCardProps extends BirdeyeToken {
  isNew?: boolean;
}

export default function TokenCard({
  address,
  symbol,
  name,
  price,
  volume24hUSD,
  liquidity,
  priceChange24hPercent,
  rank,
  isNew,
  volumeChangePercent,
  volumeDelta,
  isValid,
  hasPrice,
  hasVolume,
}: TokenCardProps) {
  // Don't render tokens with insufficient data
  if (isValid === false || (!hasPrice && !hasVolume && !liquidity)) {
    return null;
  }

  const insight = getTokenSignal({
    volume24hUSD,
    volumeChangePercent,
    priceChange24hPercent,
    rank,
    liquidity,
    isNew,
  });

  const isUp = (priceChange24hPercent ?? 0) >= 0;

  // Safe display helpers
  const displaySymbol = safeDisplayValue(symbol, undefined, "???");
  const displayName = safeDisplayValue(name, undefined, "");
  const displayPrice = safeDisplayValue(price, (p) => formatPrice(p), "—");
  const displayVolume = safeDisplayValue(volume24hUSD, (v) => formatNumber(v, "$"), "—");
  const displayLiquidity = safeDisplayValue(liquidity, (l) => formatNumber(l, "$"), "—");

  return (
    <Link href={`/token/${address}`} className="block group">
      <div className="relative bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-gray-800/70 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 h-full cursor-pointer overflow-hidden">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {displaySymbol.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm truncate">{displaySymbol}</div>
              {displayName && (
                <div className="text-xs text-gray-500 truncate max-w-[90px]">{displayName}</div>
              )}
            </div>
          </div>
          <Badge signal={insight.signal} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Price</span>
            <span className="text-white text-sm font-mono">
              {displayPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">24h</span>
            <span className={`text-sm flex items-center gap-0.5 ${changeColor(priceChange24hPercent)}`}>
              {priceChange24hPercent !== undefined ? (
                <>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {`${priceChange24hPercent >= 0 ? "+" : ""}${priceChange24hPercent.toFixed(2)}%`}
                </>
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Volume</span>
            <span className="text-gray-300 text-xs font-mono">
              {displayVolume}
            </span>
          </div>
          {liquidity !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Liquidity</span>
              <span className="text-gray-300 text-xs font-mono">
                {displayLiquidity}
              </span>
            </div>
          )}
          {volumeDelta !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Vol Δ</span>
              <span className={`text-xs font-mono ${changeColor(volumeDelta)}`}>
                {safeDisplayValue(volumeDelta, (v) => `${v.toFixed(2)}%`, "—")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
