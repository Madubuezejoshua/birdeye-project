import { getTokenOverview, getTokenSecurity, getTokenPriceHistory } from "@/lib/birdeye";
import { getTokenSignal } from "@/lib/insights";
import { formatPrice, formatNumber, formatPercent, changeColor, shortenAddress } from "@/lib/utils";
import PriceChart from "@/components/PriceChart";
import Badge from "@/components/Badge";
import { ArrowLeft, Shield, TrendingUp, Droplets, Copy } from "lucide-react";
import Link from "next/link";
import type { BirdeyeTokenOverview, BirdeyeTokenSecurity, BirdeyePricePoint } from "@/types";

export const revalidate = 30;

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [overviewRes, securityRes, historyRes] = await Promise.allSettled([
    getTokenOverview(address),
    getTokenSecurity(address),
    getTokenPriceHistory(address, "1D"),
  ]);

  const overview: BirdeyeTokenOverview | null =
    overviewRes.status === "fulfilled" ? overviewRes.value?.data ?? null : null;
  const security: BirdeyeTokenSecurity | null =
    securityRes.status === "fulfilled" ? securityRes.value?.data ?? null : null;
  const history: BirdeyePricePoint[] =
    historyRes.status === "fulfilled" ? historyRes.value?.data?.items ?? [] : [];

  const insight = getTokenSignal({
    volume24hChangePercent: overview?.volumeChangePercent,
    liquidity: overview?.liquidity,
    securityScore: security?.score,
  });

  const secScore = security?.score ?? null;
  const secColor =
    secScore === null ? "text-gray-400" :
    secScore >= 70 ? "text-green-400" :
    secScore >= 40 ? "text-yellow-400" : "text-red-400";

  const statCards = [
    { label: "Price",     value: formatPrice(overview?.price),                          color: "text-white" },
    { label: "24h",       value: formatPercent(overview?.priceChange24hPercent),         color: changeColor(overview?.priceChange24hPercent) },
    { label: "Volume 24h",value: formatNumber(overview?.volume24hUSD, "$"),              color: "text-cyan-400" },
    { label: "Liquidity", value: formatNumber(overview?.liquidity, "$"),                 color: "text-purple-400" },
    { label: "Market Cap",value: formatNumber(overview?.marketCap, "$"),                 color: "text-gray-300" },
    { label: "Holders",   value: overview?.holder?.toLocaleString() ?? "—",             color: "text-gray-300" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
          {overview?.symbol?.slice(0, 2).toUpperCase() ?? "??"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{overview?.symbol ?? "Unknown"}</h1>
            <Badge signal={insight.signal} size="md" />
          </div>
          {overview?.name && (
            <p className="text-gray-500 text-sm truncate">{overview.name}</p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{s.label}</div>
            <div className={`font-bold text-lg font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Price chart */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Price History (24h)
        </h2>
        <PriceChart data={history} height={220} />
      </div>

      {/* Security */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          Security Analysis
        </h2>
        {security ? (
          <div className="space-y-3">
            {/* Score bar */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Security Score</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${secColor.replace("text-", "bg-")}`}
                    style={{ width: `${secScore ?? 0}%` }}
                  />
                </div>
                <span className={`font-bold text-sm ${secColor}`}>
                  {secScore ?? "—"}/100
                </span>
              </div>
            </div>

            {/* Security flags */}
            {[
              ["Mintable",           security.mintable,           "boolean"],
              ["Freezable",          security.freezable,          "boolean"],
              ["Mutable Metadata",   security.mutableMetadata,    "boolean"],
              ["Top 10 Holders",     security.top10HolderPercent !== undefined
                ? `${(security.top10HolderPercent * 100).toFixed(1)}%`
                : undefined,         "string"],
            ].map(([label, val]) =>
              val !== undefined ? (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="text-gray-500">{String(label)}</span>
                  <span
                    className={
                      typeof val === "boolean"
                        ? val ? "text-red-400" : "text-green-400"
                        : "text-gray-300"
                    }
                  >
                    {typeof val === "boolean"
                      ? val ? "Yes ⚠️" : "No ✅"
                      : String(val)}
                  </span>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Security data unavailable</p>
        )}
      </div>

      {/* Links */}
      {overview?.extensions && (
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
      <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
        <Copy className="w-3 h-3" />
        <span>Contract:</span>
        <span className="text-gray-500 break-all">{address}</span>
        <span className="text-gray-700">({shortenAddress(address)})</span>
      </div>
    </div>
  );
}
