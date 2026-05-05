/**
 * lib/torque.ts
 * Torque incentive engine integration.
 * Tracks wallet activity and creates leaderboard-based rewards.
 * Server-side only.
 */

const TORQUE_API_BASE = "https://api.torque.so";
const TORQUE_API_KEY = process.env.TORQUE_API_KEY ?? "";

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  score: number;
  reward: string;
}

export interface TorqueIncentive {
  id: string;
  type: "leaderboard";
  status: "active" | "upcoming" | "ended";
  title: string;
  description: string;
  reward: string;
  endsAt: string;
  topWallets: LeaderboardEntry[];
}

/** Submit wallet activity to Torque for tracking */
export async function trackWalletActivity(
  wallet: string,
  activityType: "hold" | "swap",
  tokenCount: number,
  totalValue: number
): Promise<boolean> {
  if (!TORQUE_API_KEY) {
    console.warn("TORQUE_API_KEY not set — activity tracking skipped");
    return false;
  }

  try {
    const res = await fetch(`${TORQUE_API_BASE}/v1/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TORQUE_API_KEY}`,
      },
      body: JSON.stringify({
        wallet,
        source: activityType,
        metadata: {
          tokenCount,
          totalValue,
          timestamp: Date.now(),
        },
      }),
    });

    if (!res.ok) {
      console.warn(`Torque activity tracking failed: ${res.status}`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Torque activity tracking error:", err);
    return false;
  }
}

/** Get current leaderboard from Torque */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!TORQUE_API_KEY) {
    return getMockLeaderboard();
  }

  try {
    const res = await fetch(`${TORQUE_API_BASE}/v1/leaderboard`, {
      headers: {
        "Authorization": `Bearer ${TORQUE_API_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return getMockLeaderboard();

    const data = await res.json();
    return data?.entries ?? getMockLeaderboard();
  } catch {
    return getMockLeaderboard();
  }
}

/** Get wallet rank on leaderboard */
export async function getWalletRank(wallet: string): Promise<number | null> {
  if (!TORQUE_API_KEY) return null;

  try {
    const res = await fetch(`${TORQUE_API_BASE}/v1/leaderboard/rank?wallet=${wallet}`, {
      headers: { "Authorization": `Bearer ${TORQUE_API_KEY}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.rank ?? null;
  } catch {
    return null;
  }
}

/** Get active incentive campaign */
export async function getActiveIncentive(): Promise<TorqueIncentive> {
  // Returns the current weekly leaderboard incentive
  // Falls back to a well-defined mock so UI always renders
  const leaderboard = await getLeaderboard();

  return {
    id: "upsite-weekly-001",
    type: "leaderboard",
    status: "active",
    title: "Weekly Active Wallet Leaderboard",
    description: "Top 10 most active Solana wallets this week earn Upsite rewards. Activity is measured by token holdings diversity and portfolio value.",
    reward: "Top 10 wallets share the reward pool",
    endsAt: getNextSunday(),
    topWallets: leaderboard,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNextSunday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

/** Mock leaderboard used when Torque API key is not configured */
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, wallet: "9WzDXw...AWWM", score: 9840, reward: "🥇 1st Place" },
    { rank: 2, wallet: "7xKpLm...3nQR", score: 8720, reward: "🥈 2nd Place" },
    { rank: 3, wallet: "4Bv9Tz...8mWX", score: 7650, reward: "🥉 3rd Place" },
    { rank: 4, wallet: "2NqRst...5pYZ", score: 6430, reward: "Top 10" },
    { rank: 5, wallet: "6CwMnp...1kAB", score: 5980, reward: "Top 10" },
    { rank: 6, wallet: "8DxQvr...9jCD", score: 5210, reward: "Top 10" },
    { rank: 7, wallet: "3FyHus...4lEF", score: 4870, reward: "Top 10" },
    { rank: 8, wallet: "5GzIwt...7mGH", score: 4320, reward: "Top 10" },
    { rank: 9, wallet: "1HaJxu...2nIJ", score: 3760, reward: "Top 10" },
    { rank: 10, wallet: "0IbKyv...6oKL", score: 3210, reward: "Top 10" },
  ];
}
