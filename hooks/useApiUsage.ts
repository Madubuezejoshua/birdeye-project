import { useEffect, useState } from "react";

export interface ApiUsageStats {
  count: number;
  totalCalls: number;
  usagePercentage: number;
  remainingCalls: number;
  limitReached: boolean;
  maxCalls: number;
}

export function useApiUsage() {
  const [stats, setStats] = useState<ApiUsageStats>({
    count: 0,
    totalCalls: 0,
    usagePercentage: 0,
    remainingCalls: 50,
    limitReached: false,
    maxCalls: 50,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/counter");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch API usage stats:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchStats, 2000);

    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, error };
}