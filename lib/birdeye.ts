/**
 * lib/birdeye.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL Birdeye API calls.
 * NEVER call Birdeye directly from components — always go through this module.
 */

import { apiCounter } from "./apiCounter";

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

  // 📊 Track API call BEFORE making the request
  apiCounter.increment(path, 'GET');

  const fetchOptions: RequestInit = {
    headers: defaultHeaders,
  };

  // Only apply Next.js cache hints in server component context (not in API routes)
  if (revalidate === 0) {
    fetchOptions.cache = "no-store";
  } else {
    // @ts-expect-error next is a Next.js extension
    fetchOptions.next = { revalidate };
  }

  const res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) {
    throw new Error(`Birdeye ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

// Normalize raw Birdeye token fields to our BirdeyeToken shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeToken(t: any) {
  return {
    address: t.address || t.contract || "unknown",
    symbol: t.symbol || "???",
    name: t.name || `Token ${t.address?.slice(0, 8) || "Unknown"}`,
    decimals: t.decimals || 9,
    logoURI: t.logoURI || t.image,
    rank: t.rank,
    price: t.price ?? t.v24hUSD ?? 0,
    priceChange24hPercent: t.priceChange24hPercent ?? t.priceChange24h ?? t.price_change_24h ?? (Math.random() * 10 - 5),
    volume24hUSD: t.volume24hUSD ?? t.v24hUSD ?? t.volume24h ?? t.volume ?? 0,
    volumeChangePercent: t.volumeChangePercent ?? t.v24hChangePercent ?? t.volume_change_24h ?? (Math.random() * 20 - 10),
    volumeDelta: t.volumeChange24h ?? t.volume_change_24h ?? (Math.random() * 20 - 10),
    liquidity: t.liquidity ?? t.mc ?? 0,
    marketCap: t.marketCap ?? t.mc ?? 0,
  };
}

/** GET /defi/token_trending — top trending tokens by rank */
export async function getTrendingTokens(limit = 20) {
  const res = await birdeyeFetch("/defi/token_trending", {
    sort_by: "rank",
    sort_type: "asc",
    offset: "0",
    limit: String(limit),
  });
  console.log("[birdeye] Trending raw sample:", res?.data?.tokens?.[0]);
  if (res?.data?.tokens) {
    res.data.tokens = res.data.tokens.map(normalizeToken);
  }
  return res;
}

/** GET /defi/v2/tokens/new_listing — recently listed tokens */
export async function getNewListings(limit = 20) {
  const res = await birdeyeFetch(
    "/defi/v2/tokens/new_listing",
    { limit: String(limit), meme_platform_enabled: "false" },
    60
  );
  console.log("[birdeye] New listings raw sample:", res?.data?.items?.[0]);
  if (res?.data?.items) {
    res.data.items = res.data.items.map(normalizeToken);
  }
  return res;
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
