/**
 * lib/birdeyeEnrich.ts
 * Enriches token mint addresses with price, metadata, and USD valuation from Birdeye.
 * Uses a single /defi/token_overview call per token (free tier compatible).
 */

import { apiCounter } from "./apiCounter";

const API_KEY = process.env.BIRDEYE_API_KEY ?? "";

const HEADERS = {
  "X-API-KEY": API_KEY,
  "x-chain": "solana",
};

export interface EnrichedToken {
  mint: string;
  balance: number;
  name: string;
  symbol: string;
  price: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
  valueUsd: number;
  logoURI: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Single call to token_overview — returns price + metadata together */
export async function enrichToken(mint: string, balance: number): Promise<EnrichedToken> {
  const fallback: EnrichedToken = {
    mint,
    balance,
    name: "",
    symbol: mint.slice(0, 6).toUpperCase(),
    price: 0,
    liquidity: 0,
    volume24h: 0,
    priceChange24h: 0,
    valueUsd: 0,
    logoURI: "",
  };

  try {
    apiCounter.increment("/defi/token_overview", "GET");
    const res = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${mint}`,
      { headers: HEADERS }
    );

    // Rate limited — return fallback, don't throw
    if (res.status === 429) {
      console.warn(`⚠️ Rate limited on ${mint.slice(0, 8)}`);
      return fallback;
    }

    if (!res.ok) return fallback;

    const json = await res.json();
    const d = json?.data;
    if (!d) return fallback;

    const price = d.price ?? 0;
    const volume24h = d.v24hUSD ?? d.volume24hUSD ?? 0;

    return {
      mint,
      balance,
      name: d.name ?? "",
      symbol: d.symbol ?? fallback.symbol,
      price,
      liquidity: d.liquidity ?? 0,
      volume24h,
      priceChange24h: d.priceChange24hPercent ?? d.price24hChangePercent ?? 0,
      valueUsd: balance * price,
      logoURI: d.logoURI ?? "",
    };
  } catch {
    return fallback;
  }
}

/**
 * Enrich tokens in small sequential batches with a delay between each
 * to stay within Birdeye free tier rate limits (~1 req/sec).
 */
export async function enrichTokensBatch(
  tokens: Array<{ mint: string; balance: number }>,
  concurrency = 3
): Promise<EnrichedToken[]> {
  const results: EnrichedToken[] = [];

  for (let i = 0; i < tokens.length; i += concurrency) {
    const batch = tokens.slice(i, i + concurrency);
    const enriched = await Promise.all(batch.map((t) => enrichToken(t.mint, t.balance)));
    results.push(...enriched);

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < tokens.length) {
      await sleep(300);
    }
  }

  return results;
}
