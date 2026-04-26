"use client";

import { useState, useEffect } from "react";
import { Bug, RefreshCw, Trash2, Eye } from "lucide-react";

interface ApiCallRecord {
  timestamp: number;
  endpoint: string;
  method: string;
  count: number;
}

export default function ApiDebugPanel() {
  const [history, setHistory] = useState<ApiCallRecord[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/api-history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch API history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCounter = async () => {
    try {
      const response = await fetch('/api/api-stats', { method: 'DELETE' });
      if (response.ok) {
        setHistory([]);
        // Trigger a refresh of the usage meter
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to reset counter:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors z-50"
        title="Show API Debug Panel"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-white/10 rounded-xl p-4 shadow-xl z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-yellow-400" />
          <h3 className="text-white font-semibold text-sm">API Debug Panel</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={resetCounter}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Reset Counter"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Hide Panel"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-500 mb-2">
          Recent API Calls ({history.length})
        </div>
        
        {history.length === 0 ? (
          <div className="text-xs text-gray-600 text-center py-4">
            No API calls recorded yet
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1">
            {history.map((call, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-cyan-400 font-mono">#{call.count}</span>
                  <span className="text-gray-300 truncate">{call.endpoint}</span>
                </div>
                <div className="text-gray-500 shrink-0">
                  {new Date(call.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-500">
          💡 This panel tracks real Birdeye API calls for hackathon verification
        </div>
      </div>
    </div>
  );
}