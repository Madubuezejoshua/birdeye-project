/**
 * lib/birdeye.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL Birdeye API calls.
 * NEVER call Birdeye directly from components — always go through this module.
 */

const BASE_URL = "https://public-api.birdeye.so";
const API_KEY = process.env.BIRDEYE_API_KEY ?? "";

if (!API_KEY && typeof window === "undefined") {
  console.warn("[birdeye] BIRDEYE_API_KEY is not set. API calls will fail.");
}

const defaultHeaders = {
  "X-API-KEY": API_KEY,
  "x-chain": "solana",
  "Content-Type": "application/json",
};

async function birdeyeFetch(
  path: string,
  params?: Record<string, string>,
  revalidate = 30
) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: defaultHeaders,
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Birdeye ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /defi/token_trending — top trending tokens by rank */
export async function getTrendingTokens(limit = 20) {
  return birdeyeFetch("/defi/token_trending", {
    sort_by: "rank",
    sort_type: "asc",
    offset: "0",
    limit: String(limit),
  });
}

/** GET /defi/v2/tokens/new_listing — recently listed tokens */
export async function getNewListings(limit = 20) {
  return birdeyeFetch(
    "/defi/v2/tokens/new_listing",
    { limit: String(limit), meme_platform_enabled: "false" },
    60
  );
}

/** GET /defi/token_security — security analysis for a token */
export async function getTokenSecurity(address: string) {
  return birdeyeFetch("/defi/token_security", { address }, 120);
}

/** GET /defi/token_overview — full token metadata + market data */
export async function getTokenOverview(address: string) {
  return birdeyeFetch("/defi/token_overview", { address });
}

/** GET /defi/history_price — OHLCV price history */
export async function getTokenPriceHistory(
  address: string,
  type: "1m" | "3m" | "15m" | "30m" | "1H" | "2H" | "4H" | "6H" | "8H" | "12H" | "1D" | "3D" | "1W" | "1M" = "1D"
) {
  return birdeyeFetch("/defi/history_price", {
    address,
    address_type: "token",
    type,
  });
}

/** GET /v1/wallet/token_list — all token holdings for a wallet */
export async function getWalletPortfolio(wallet: string) {
  return birdeyeFetch("/v1/wallet/token_list", { wallet }, 0);
}
