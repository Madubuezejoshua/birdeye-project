"use client";
import Link from "next/link";
import { getTokenSignal } from "@/lib/insights";
import { formatPrice, formatNumber, formatPercent, changeColor } from "@/lib/utils";
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
}: TokenCardProps) {
  const insight = getTokenSignal({
    volume24hChangePercent: volumeChangePercent,
    rank,
    liquidity,
    isNew,
  });

  const isUp = (priceChange24hPercent ?? 0) >= 0;

  return (
    <Link href={`/token/${address}`} className="block group">
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-cyan-500/40 hover:bg-gray-800/80 transition-all h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {symbol?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm truncate">{symbol}</div>
              {name && (
                <div className="text-xs text-gray-500 truncate max-w-[90px]">{name}</div>
              )}
            </div>
          </div>
          <Badge signal={insight.signal} />
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Price</span>
            <span className="text-white text-sm font-mono">{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">24h</span>
            <span className={`text-sm flex items-center gap-0.5 ${changeColor(priceChange24hPercent)}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {priceChange24hPercent !== undefined
                ? `${Math.abs(priceChange24hPercent).toFixed(2)}%`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Volume</span>
            <span className="text-gray-300 text-xs font-mono">{formatNumber(volume24hUSD, "$")}</span>
          </div>
          {liquidity !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Liquidity</span>
              <span className="text-gray-300 text-xs font-mono">{formatNumber(liquidity, "$")}</span>
            </div>
          )}
          {volumeChangePercent !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Vol Δ</span>
              <span className={`text-xs font-mono ${changeColor(volumeChangePercent)}`}>
                {formatPercent(volumeChangePercent)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
