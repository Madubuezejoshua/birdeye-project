"use client";

import { useEffect, useState, use } from "react";
import { getTokenSignal } from "@/lib/insights";
import { formatPrice, formatNumber, formatPercent, changeColor, shortenAddress } from "@/lib/utils";
import PriceChart from "@/components/PriceChart";
import Badge from "@/components/Badge";
import { ArrowLeft, Shield, TrendingUp, Droplets, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { BirdeyeTokenOverview, BirdeyeTokenSecurity, BirdeyePricePoint } from "@/types";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-800 rounded animate-pulse ${className}`} />;
}

export default function TokenDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [overview, setOverview] = useState<BirdeyeTokenOverview | null>(null);
  const [security, setSecurity] = useState<BirdeyeTokenSecurity | null>(null);
  const [history, setHistory] = useState<BirdeyePricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/token-detail?address=${address}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOverview(data.overview ?? null);
      setSecurity(data.security ?? null);
      setHistory(data.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load token data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [address]);

  const insight = getTokenSignal({
    volume24hUSD: overview?.volume24hUSD,
    volumeChangePercent: overview?.volumeChangePercent,
    priceChange24hPercent: overview?.priceChange24hPercent,
    liquidity: overview?.liquidity,
  });

  const secScore = security?.score ?? null;
  const secColor =
    secScore === null ? "text-gray-400" :
    secScore >= 70 ? "text-green-400" :
    secScore >= 40 ? "text-yellow-400" : "text-red-400";

  const statCards = [
    { label: "Price",      value: overview?.price != null ? formatPrice(overview.price) : null,                          color: "text-white" },
    { label: "24h",        value: overview?.priceChange24hPercent != null ? formatPercent(overview.priceChange24hPercent) : null, color: changeColor(overview?.priceChange24hPercent) },
    { label: "Volume 24h", value: overview?.volume24hUSD != null ? formatNumber(overview.volume24hUSD, "$") : null,       color: "text-cyan-400" },
    { label: "Liquidity",  value: overview?.liquidity != null ? formatNumber(overview.liquidity, "$") : null,             color: "text-purple-400" },
    { label: "Market Cap", value: overview?.marketCap != null ? formatNumber(overview.marketCap, "$") : null,             color: "text-gray-300" },
    { label: "Holders",    value: overview?.holder != null ? overview.holder.toLocaleString() : null,                    color: "text-gray-300" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
          {loading ? "?" : (overview?.symbol ?? "??").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <>
                <h1 className="text-xl font-bold text-white">{overview?.symbol ?? "Unknown"}</h1>
                <Badge signal={insight.signal} size="md" />
              </>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-4 w-32 mt-1" />
          ) : overview?.name ? (
            <p className="text-gray-500 text-sm truncate">{overview.name}</p>
          ) : null}
        </div>

        {/* Refresh button */}
        <button
          onClick={load}
          disabled={loading}
          className="text-gray-600 hover:text-cyan-400 transition-colors disabled:opacity-40 ml-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error with retry */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-400 text-sm">{error}</span>
          <button
            onClick={load}
            className="text-red-400 hover:text-red-300 text-sm underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{s.label}</div>
            {loading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <div className={`font-bold text-lg font-mono ${s.color}`}>
                {s.value ?? "—"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Price chart */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Price History (24h)
        </h2>
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : history.length > 0 ? (
          <PriceChart data={history} height={220} />
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">
            No price history available for this token
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          Security Analysis
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : security ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Security Score</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${secColor.replace("text-", "bg-")}`}
                    style={{ width: `${secScore ?? 0}%` }}
                  />
                </div>
                <span className={`font-bold text-sm ${secColor}`}>{secScore ?? "—"}/100</span>
              </div>
            </div>
            {[
              ["Mintable",         security.mintable,           "boolean"],
              ["Freezable",        security.freezable,          "boolean"],
              ["Mutable Metadata", security.mutableMetadata,    "boolean"],
              ["Top 10 Holders",   security.top10HolderPercent !== undefined
                ? `${(security.top10HolderPercent * 100).toFixed(1)}%`
                : undefined, "string"],
            ].map(([label, val]) =>
              val !== undefined ? (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="text-gray-500">{String(label)}</span>
                  <span className={typeof val === "boolean" ? (val ? "text-red-400" : "text-green-400") : "text-gray-300"}>
                    {typeof val === "boolean" ? (val ? "Yes ⚠️" : "No ✅") : String(val)}
                  </span>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Security data unavailable for this token</p>
        )}
      </div>

      {/* Links */}
      {!loading && overview?.extensions && (overview.extensions.website || overview.extensions.twitter) && (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {overview.extensions.website && (
              <a href={overview.extensions.website} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-xs transition-colors">
                🌐 Website
              </a>
            )}
            {overview.extensions.twitter && (
              <a href={`https://twitter.com/${overview.extensions.twitter}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-xs transition-colors">
                𝕏 Twitter
              </a>
            )}
          </div>
        </div>
      )}

      {/* Contract address */}
      <div className="flex items-center gap-2 text-xs text-gray-600 font-mono flex-wrap">
        <Copy className="w-3 h-3 shrink-0" />
        <span>Contract:</span>
        <span className="text-gray-500 break-all">{address}</span>
        <span className="text-gray-700">({shortenAddress(address, 6)})</span>
      </div>
    </div>
  );
}
