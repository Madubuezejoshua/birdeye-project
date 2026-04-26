"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, TrendingUp, AlertTriangle, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import TelegramTestPanel from "@/components/TelegramTestPanel";
import type { BirdeyeToken } from "@/types";

interface AlertData {
  success: boolean;
  checkedAt: string;
  counts: { hot: number; risk: number; watch: number; total: number };
  alertsSent: number;
  tokens: { hot: BirdeyeToken[]; risk: BirdeyeToken[]; watch: BirdeyeToken[] };
}

const POLL_INTERVAL = 60_000; // 60 seconds

export default function AlertsPage() {
  const [data, setData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [totalAlertsSent, setTotalAlertsSent] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/alerts");
      const json: AlertData = await res.json();
      if (json.success) {
        setData(json);
        setLastChecked(new Date());
        setTotalAlertsSent(prev => prev + (json.alertsSent ?? 0));
        setError("");
      } else {
        setError("Failed to fetch alert data");
      }
    } catch {
      setError("Network error — retrying...");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const hot = data?.tokens.hot ?? [];
  const risk = data?.tokens.risk ?? [];
  const watch = data?.tokens.watch ?? [];

  const sections = [
    {
      title: "🔥 Hot Alerts",
      subtitle: "High volume + high liquidity momentum tokens",
      items: hot,
      icon: TrendingUp,
      border: "border-orange-400/20",
      badge: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    },
    {
      title: "⚠️ Risk Alerts",
      subtitle: "Low liquidity — exercise caution",
      items: risk,
      icon: AlertTriangle,
      border: "border-red-400/20",
      badge: "text-red-400 bg-red-400/10 border-red-400/30",
    },
    {
      title: "👀 Watch List",
      subtitle: "Moderate signals worth monitoring",
      items: watch,
      icon: Eye,
      border: "border-yellow-400/20",
      badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Alerts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Live signals from Birdeye — auto-refreshes every 60s
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAlerts(true)}
            disabled={isRefreshing}
            className="text-gray-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Last checked + alerts sent */}
      {lastChecked && (
        <div className="text-gray-600 text-xs flex items-center gap-4">
          <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
          {totalAlertsSent > 0 && (
            <span className="text-cyan-500">
              {totalAlertsSent} Telegram alert{totalAlertsSent !== 1 ? "s" : ""} sent this session
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Count cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hot Alerts", count: data?.counts.hot ?? 0, color: "text-orange-400" },
          { label: "Risk Alerts", count: data?.counts.risk ?? 0, color: "text-red-400" },
          { label: "Watch Alerts", count: data?.counts.watch ?? 0, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
            {loading ? (
              <div className="h-8 w-12 bg-gray-800 rounded animate-pulse mx-auto mb-1" />
            ) : (
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            )}
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Telegram Test Panel */}
      <TelegramTestPanel />

      {/* Token sections */}
      {sections.map(section => (
        <div key={section.title} className={`bg-gray-900 border ${section.border} rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <section.icon className="w-4 h-4 text-gray-400" />
            <h2 className="text-white font-semibold">{section.title}</h2>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${section.badge}`}>
              {section.items.length}
            </span>
          </div>
          <p className="text-gray-500 text-xs mb-4">{section.subtitle}</p>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : section.items.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">No alerts in this category</p>
          ) : (
            <div className="space-y-1">
              {section.items.slice(0, 10).map(t => (
                <Link
                  key={t.address}
                  href={`/token/${t.address}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {t.symbol?.slice(0, 1)}
                    </div>
                    <span className="text-white text-sm font-medium">{t.symbol}</span>
                    {t.name && (
                      <span className="text-gray-500 text-xs hidden sm:block truncate max-w-[120px]">
                        {t.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {t.volume24hUSD != null && (
                      <span className="text-gray-400 hidden sm:block">
                        Vol ${(t.volume24hUSD / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                    {t.priceChange24hPercent != null && (
                      <span className={t.priceChange24hPercent >= 0 ? "text-green-400" : "text-red-400"}>
                        {t.priceChange24hPercent >= 0 ? "+" : ""}
                        {t.priceChange24hPercent.toFixed(2)}%
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
