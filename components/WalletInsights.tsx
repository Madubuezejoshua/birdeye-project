"use client";
import { Shield, Zap, Target, Lightbulb } from "lucide-react";
import type { WalletAnalysis } from "@/types";

function ScoreBar({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-gray-400 text-sm">{label}</span>
        <span className={`ml-auto font-bold text-xl ${color}`}>{value}</span>
      </div>
      <p className="text-gray-600 text-xs mb-3">{description}</p>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function WalletInsights({ analysis }: { analysis: WalletAnalysis }) {
  return (
    <div className="space-y-4">
      {/* Score bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreBar
          label="Risk Score"
          value={analysis.riskScore}
          icon={Shield}
          color="text-red-400"
          description="% of holdings flagged as risky"
        />
        <ScoreBar
          label="Exposure Score"
          value={analysis.exposureScore}
          icon={Zap}
          color="text-cyan-400"
          description="% of holdings that are trending"
        />
        <ScoreBar
          label="Opportunity Score"
          value={analysis.opportunityScore}
          icon={Target}
          color="text-green-400"
          description="Trending tokens you don't hold"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 text-sm">Portfolio Summary</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-gray-500 text-xs mb-0.5">Total Tokens</div>
            <div className="text-white font-bold text-2xl">{analysis.totalTokens}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-0.5">Trending</div>
            <div className="text-cyan-400 font-bold text-2xl">{analysis.hotTokens.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-0.5">Risky</div>
            <div className="text-red-400 font-bold text-2xl">{analysis.riskyTokens.length}</div>
          </div>
        </div>
      </div>

      {/* Trending holdings */}
      {analysis.hotTokens.length > 0 && (
        <div className="bg-gray-900 border border-orange-400/20 rounded-xl p-4">
          <h3 className="text-orange-400 font-semibold mb-2 text-sm">🔥 Trending Holdings</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.hotTokens.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-orange-400/10 border border-orange-400/30 rounded-lg text-orange-300 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risky tokens */}
      {analysis.riskyTokens.length > 0 && (
        <div className="bg-gray-900 border border-red-400/20 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2 text-sm">⚠️ Risky Tokens</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.riskyTokens.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-red-400/10 border border-red-400/30 rounded-lg text-red-300 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart suggestions */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Smart Suggestions
        </h3>
        <ul className="space-y-2">
          {analysis.suggestions.map((s, i) => (
            <li
              key={i}
              className="text-gray-300 text-sm bg-white/5 rounded-lg px-3 py-2 leading-relaxed"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
