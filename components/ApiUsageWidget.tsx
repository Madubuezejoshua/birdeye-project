"use client";

import { useApiUsage } from "@/hooks/useApiUsage";
import { Activity, Zap, AlertTriangle, CheckCircle } from "lucide-react";

export default function ApiUsageWidget() {
  const { stats, isLoading, error } = useApiUsage();

  if (error) {
    return (
      <div className="fixed top-20 right-4 bg-red-900/90 backdrop-blur-sm border border-red-500/30 text-red-300 p-2 rounded-lg shadow-lg z-40">
        <div className="flex items-center gap-2 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>API Error</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed top-20 right-4 bg-gray-900/90 backdrop-blur-sm border border-white/10 text-gray-300 p-2 rounded-lg shadow-lg z-40">
        <div className="flex items-center gap-2 text-xs">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (stats.limitReached) return "text-red-400";
    if (stats.usagePercentage > 80) return "text-yellow-400";
    if (stats.usagePercentage > 50) return "text-orange-400";
    return "text-green-400";
  };

  const getProgressColor = () => {
    if (stats.limitReached) return "bg-red-500";
    if (stats.usagePercentage > 80) return "bg-yellow-500";
    if (stats.usagePercentage > 50) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (stats.limitReached) return <AlertTriangle className="w-3 h-3" />;
    if (stats.usagePercentage > 80) return <Zap className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  return (
    <div className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-sm border border-white/10 text-white p-3 rounded-lg shadow-xl z-40 min-w-[160px]">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <span className="text-xs font-medium text-gray-300">API Usage</span>
        </div>
      </div>

      {/* Compact Counter Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${getStatusColor()}`}>
            {stats.count}
          </span>
          <span className="text-gray-500 text-xs">/</span>
          <span className="text-gray-400 text-sm">{stats.maxCalls}</span>
        </div>
        <span className="text-xs text-gray-400">
          {Math.round(stats.usagePercentage)}%
        </span>
      </div>

      {/* Compact Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, stats.usagePercentage)}%` }}
          />
        </div>
      </div>

      {/* Compact Status */}
      <div className="text-xs text-gray-400 text-center">
        {stats.limitReached ? (
          <span className="text-red-400">🚫 Limit reached</span>
        ) : (
          <span>✅ {stats.remainingCalls} left</span>
        )}
      </div>
    </div>
  );
}