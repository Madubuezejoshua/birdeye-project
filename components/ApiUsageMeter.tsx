"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, AlertTriangle } from "lucide-react";

interface ApiStats {
  totalCalls: number;
  callsLastHour: number;
  usagePercentage: number;
  limitReached: boolean;
  remainingCalls: number;
}

export default function ApiUsageMeter() {
  const [stats, setStats] = useState<ApiStats>({
    totalCalls: 0,
    callsLastHour: 0,
    usagePercentage: 0,
    limitReached: false,
    remainingCalls: 50,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/api-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch API stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Update every 2 seconds for live tracking
    const interval = setInterval(fetchStats, 2000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg">
        <Activity className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (stats.limitReached) return "text-red-400";
    if (stats.usagePercentage > 80) return "text-yellow-400";
    if (stats.usagePercentage > 50) return "text-orange-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (stats.limitReached) return <AlertTriangle className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border border-white/10 rounded-lg">
      {/* Icon and Label */}
      <div className="flex items-center gap-2">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className="text-gray-300 text-sm font-medium">API Usage:</span>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2">
        <span className={`font-bold text-lg ${getStatusColor()}`}>
          {stats.totalCalls}
        </span>
        <span className="text-gray-500 text-sm">/</span>
        <span className="text-gray-400 text-sm">50</span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 min-w-[80px] max-w-[120px]">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              stats.limitReached 
                ? "bg-red-500" 
                : stats.usagePercentage > 80 
                ? "bg-yellow-500" 
                : stats.usagePercentage > 50
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(100, stats.usagePercentage)}%` }}
          />
        </div>
      </div>

      {/* Status Text */}
      <div className="text-xs text-gray-500">
        {stats.limitReached ? (
          <span className="text-red-400 font-medium">Limit Reached</span>
        ) : (
          <span>{stats.remainingCalls} left</span>
        )}
      </div>
    </div>
  );
}