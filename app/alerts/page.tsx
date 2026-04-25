import { getTrendingTokens } from "@/lib/birdeye";
import { getTokenSignal } from "@/lib/insights";
import { Bell, TrendingUp, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";

export const revalidate = 30;

interface BirdeyeToken {
  address: string;
  symbol: string;
  name?: string;
  price?: number;
  volume24hUSD?: number;
  liquidity?: number;
  priceChange24hPercent?: number;
  rank?: number;
  volumeChangePercent?: number;
}

export default async function AlertsPage() {
  let tokens: BirdeyeToken[] = [];
  try {
    const res = await getTrendingTokens(50);
    tokens = res?.data?.tokens || [];
  } catch {
    tokens = [];
  }

  const hot = tokens.filter(t => getTokenSignal({ volume24hChangePercent: t.volumeChangePercent, rank: t.rank, liquidity: t.liquidity }).signal === "HOT");
  const risky = tokens.filter(t => getTokenSignal({ volume24hChangePercent: t.volumeChangePercent, rank: t.rank, liquidity: t.liquidity }).signal === "RISK");
  const watch = tokens.filter(t => getTokenSignal({ volume24hChangePercent: t.volumeChangePercent, rank: t.rank, liquidity: t.liquidity }).signal === "WATCH");

  const sections = [
    { title: "🔥 Hot Alerts", subtitle: "High volume momentum tokens", items: hot, icon: TrendingUp, border: "border-orange-400/20", badge: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    { title: "⚠️ Risk Alerts", subtitle: "Low liquidity or security concerns", items: risky, icon: AlertTriangle, border: "border-red-400/20", badge: "text-red-400 bg-red-400/10 border-red-400/30" },
    { title: "👀 Watch List", subtitle: "New or moderate growth tokens", items: watch, icon: Eye, border: "border-yellow-400/20", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-cyan-400" />
          Alerts
        </h1>
        <p className="text-gray-500 text-sm mt-1">System-generated signals based on market data</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hot Alerts", count: hot.length, color: "text-orange-400" },
          { label: "Risk Alerts", count: risky.length, color: "text-red-400" },
          { label: "Watch Alerts", count: watch.length, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {sections.map(section => (
        <div key={section.title} className={`bg-gray-900 border ${section.border} rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <section.icon className="w-4 h-4 text-gray-400" />
            <h2 className="text-white font-semibold">{section.title}</h2>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${section.badge}`}>{section.items.length}</span>
          </div>
          <p className="text-gray-500 text-xs mb-4">{section.subtitle}</p>

          {section.items.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">No alerts in this category</p>
          ) : (
            <div className="space-y-2">
              {section.items.slice(0, 10).map(t => (
                <Link key={t.address} href={`/token/${t.address}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {t.symbol?.slice(0, 1)}
                    </div>
                    <span className="text-white text-sm font-medium">{t.symbol}</span>
                    {t.name && <span className="text-gray-500 text-xs hidden sm:block">{t.name}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {t.volumeChangePercent !== undefined && (
                      <span className="text-gray-400">Vol {t.volumeChangePercent > 0 ? "+" : ""}{t.volumeChangePercent.toFixed(0)}%</span>
                    )}
                    {t.priceChange24hPercent !== undefined && (
                      <span className={t.priceChange24hPercent >= 0 ? "text-green-400" : "text-red-400"}>
                        {t.priceChange24hPercent >= 0 ? "+" : ""}{t.priceChange24hPercent.toFixed(2)}%
                      </span>
                    )}
                    <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
