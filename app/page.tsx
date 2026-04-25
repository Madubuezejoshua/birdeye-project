import { getTrendingTokens, getNewListings } from "@/lib/birdeye";
import { getTokenSignal } from "@/lib/insights";
import TokenCard from "@/components/TokenCard";
import { TrendingUp, Sparkles, Flame, Activity } from "lucide-react";
import Link from "next/link";
import type { BirdeyeToken } from "@/types";

export const revalidate = 30;

async function getData() {
  try {
    const [trendingRes, listingsRes] = await Promise.allSettled([
      getTrendingTokens(20),
      getNewListings(10),
    ]);
    return {
      trending: trendingRes.status === "fulfilled"
        ? (trendingRes.value?.data?.tokens as BirdeyeToken[]) ?? []
        : [],
      listings: listingsRes.status === "fulfilled"
        ? (listingsRes.value?.data?.items as BirdeyeToken[]) ?? []
        : [],
    };
  } catch {
    return { trending: [], listings: [] };
  }
}

export default async function DashboardPage() {
  const { trending, listings } = await getData();

  const hot = trending
    .filter((t) => getTokenSignal({ volume24hChangePercent: t.volumeChangePercent, rank: t.rank, liquidity: t.liquidity }).signal === "HOT")
    .slice(0, 4);

  const stats = [
    { label: "Trending Tokens", value: trending.length, color: "text-cyan-400" },
    { label: "New Listings",    value: listings.length,  color: "text-purple-400" },
    { label: "Hot Tokens",      value: hot.length,       color: "text-orange-400" },
    { label: "Data Source",     value: "Birdeye",        color: "text-green-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          Market Overview
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time crypto intelligence powered by Birdeye
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* No API key warning */}
      {trending.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-300 text-sm">
          No data returned. Make sure{" "}
          <code className="text-yellow-200 bg-yellow-500/20 px-1 rounded">BIRDEYE_API_KEY</code>{" "}
          is set in <code className="text-yellow-200 bg-yellow-500/20 px-1 rounded">.env.local</code>.
        </div>
      )}

      {/* Hot tokens */}
      {hot.length > 0 && (
        <section>
          <h2 className="text-white font-semibold flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            Hot Right Now
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {hot.map((t) => (
              <TokenCard key={t.address} {...t} />
            ))}
          </div>
        </section>
      )}

      {/* Trending tokens */}
      <section>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Trending Tokens
        </h2>
        {trending.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-8 text-center text-gray-500 text-sm">
            No trending data available
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {trending.map((t) => (
              <TokenCard key={t.address} {...t} />
            ))}
          </div>
        )}
      </section>

      {/* New listings */}
      <section>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          New Listings
        </h2>
        {listings.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 text-center text-gray-500 text-sm">
            No new listings data available
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {listings.map((t) => (
              <TokenCard key={t.address} {...t} isNew />
            ))}
          </div>
        )}
      </section>

      {/* Wallet CTA */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Analyze your wallet</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            Get risk scores, exposure analysis, and smart suggestions
          </p>
        </div>
        <Link
          href="/wallet"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
        >
          Open Wallet Analyzer →
        </Link>
      </div>
    </div>
  );
}
