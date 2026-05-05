"use client";

import { useState, useEffect } from "react";
import { Trophy, Zap, Clock, Users, RefreshCw, ExternalLink } from "lucide-react";
import type { TorqueIncentive, LeaderboardEntry } from "@/lib/torque";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-800 rounded animate-pulse ${className}`} />;
}

function getRankColor(rank: number): string {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-orange-400";
  return "text-gray-500";
}

function getRankBg(rank: number): string {
  if (rank === 1) return "bg-yellow-400/10 border-yellow-400/30";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/20";
  if (rank === 3) return "bg-orange-400/10 border-orange-400/30";
  return "bg-white/5 border-white/5";
}

export default function RewardsPage() {
  const [incentive, setIncentive] = useState<TorqueIncentive | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletInput, setWalletInput] = useState("");
  const [walletRank, setWalletRank] = useState<number | null>(null);
  const [checkingRank, setCheckingRank] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  async function fetchIncentive() {
    setLoading(true);
    try {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      if (data.success) setIncentive(data.incentive);
    } catch {
      // silently fail — mock data will show
    } finally {
      setLoading(false);
    }
  }

  async function checkRank() {
    if (!walletInput.trim()) return;
    setCheckingRank(true);
    setWalletRank(null);
    try {
      const res = await fetch(`/api/rewards/rank?wallet=${walletInput.trim()}`);
      const data = await res.json();
      setWalletRank(data.rank ?? null);
    } catch {
      setWalletRank(null);
    } finally {
      setCheckingRank(false);
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!incentive?.endsAt) return;
    const update = () => {
      const end = new Date(incentive.endsAt).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [incentive]);

  useEffect(() => { fetchIncentive(); }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Upsite Rewards
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay active on Solana. Earn rewards. Powered by Torque.
          </p>
        </div>
        <button
          onClick={fetchIncentive}
          disabled={loading}
          className="text-gray-600 hover:text-green-400 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Active Campaign Card */}
      <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium uppercase tracking-wide">Active Campaign</span>
          {timeLeft && (
            <span className="ml-auto flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              {timeLeft} left
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <h2 className="text-white font-semibold text-lg">
              {incentive?.title ?? "Weekly Active Wallet Leaderboard"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {incentive?.description ?? "Top 10 most active Solana wallets this week earn Upsite rewards."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">
                {incentive?.reward ?? "Top 10 wallets share the reward pool"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          How to Earn
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: "1", title: "Analyze Wallet", desc: "Enter your Solana wallet in the Wallet tab to register your activity" },
            { step: "2", title: "Stay Active", desc: "Hold diverse tokens and maintain an active portfolio on Solana" },
            { step: "3", title: "Earn Rewards", desc: "Top 10 wallets by activity score each week share the reward pool" },
          ].map((s) => (
            <div key={s.step} className="bg-white/5 rounded-lg p-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center mb-2">
                {s.step}
              </div>
              <div className="text-white text-sm font-medium">{s.title}</div>
              <div className="text-gray-500 text-xs mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Check your rank */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Check Your Rank</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkRank()}
            placeholder="Enter your Solana wallet address"
            className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 font-mono"
          />
          <button
            onClick={checkRank}
            disabled={checkingRank || !walletInput.trim()}
            className="px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            {checkingRank ? "..." : "Check"}
          </button>
        </div>
        {walletRank !== null && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="text-green-300 text-sm">
              Your current rank: <strong>#{walletRank}</strong>
              {walletRank <= 10 ? " 🎉 You're in the top 10!" : " — Keep analyzing to climb the leaderboard"}
            </span>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          This Week's Leaderboard
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(incentive?.topWallets ?? []).map((entry: LeaderboardEntry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm w-6 text-center ${getRankColor(entry.rank)}`}>
                    #{entry.rank}
                  </span>
                  <span className="text-gray-300 text-sm font-mono">{entry.wallet}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{entry.score.toLocaleString()} pts</span>
                  <span className={`text-xs font-medium ${getRankColor(entry.rank)}`}>
                    {entry.reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-600 text-xs mt-4 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Incentive infrastructure powered by{" "}
          <a href="https://torque.so" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
            Torque
          </a>
        </p>
      </div>
    </div>
  );
}
