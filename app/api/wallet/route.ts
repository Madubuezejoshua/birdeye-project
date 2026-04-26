import { NextResponse } from "next/server";
import { getWalletTokens, getSolBalance } from "@/lib/solanaWallet";
import { enrichTokensBatch, type EnrichedToken } from "@/lib/birdeyeEnrich";
import { validateSolanaAddress } from "@/lib/normalizeWallet";
import { sendTelegramMessage, formatWalletRiskAlert } from "@/lib/telegram-alerts";

// Wrapped SOL mint address
const WSOL_MINT = "So11111111111111111111111111111111111111112";

/** Smart Money tag based on portfolio characteristics */
function getWalletTag(totalValue: number, totalTokens: number, trendingCount: number): string | null {
  if (totalValue > 100_000) return "🐋 Whale Wallet";
  if (totalValue > 10_000 && trendingCount >= 3) return "🔥 Smart Money Wallet";
  if (trendingCount >= 5) return "👀 Trend Follower";
  if (totalTokens > 30) return "📊 Diversified Portfolio";
  return null;
}

/** Token Heat Score: 0–100 based on volume, liquidity, price momentum */
function computeHeatScore(token: EnrichedToken): number {
  let score = 0;
  if (token.volume24h > 10_000_000) score += 35;
  else if (token.volume24h > 1_000_000) score += 20;
  else if (token.volume24h > 100_000) score += 10;

  if (token.liquidity > 1_000_000) score += 25;
  else if (token.liquidity > 100_000) score += 15;
  else if (token.liquidity > 10_000) score += 5;

  if (token.priceChange24h > 20) score += 25;
  else if (token.priceChange24h > 5) score += 15;
  else if (token.priceChange24h > 0) score += 5;
  else if (token.priceChange24h < -20) score -= 10;

  if (token.price > 0) score += 15; // has price data

  return Math.min(100, Math.max(0, score));
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ success: false, error: "Wallet address is required" }, { status: 400 });
    }

    if (!validateSolanaAddress(address)) {
      return NextResponse.json({
        success: false,
        error: "Invalid Solana wallet address. Make sure you're entering a wallet, not a token mint.",
      }, { status: 400 });
    }

    console.log(`\n🔍 Analyzing wallet: ${address}`);

    // STEP 1 — Fetch SPL tokens + SOL balance in parallel
    const [rawTokens, solBalance] = await Promise.all([
      getWalletTokens(address),
      getSolBalance(address),
    ]);

    console.log(`📦 SPL tokens: ${rawTokens.length}, SOL balance: ${solBalance}`);

    // STEP 2 — Inject SOL as a token if wallet holds it
    const allTokens = [...rawTokens];
    if (solBalance > 0) {
      // Check if wSOL already in list to avoid double-counting
      const hasWsol = allTokens.some((t) => t.mint === WSOL_MINT);
      if (!hasWsol) {
        allTokens.unshift({ mint: WSOL_MINT, balance: solBalance });
      }
    }

    // STEP 3 — Handle empty wallet
    if (allTokens.length === 0) {
      return NextResponse.json({
        success: true,
        tokens: [],
        totalValue: 0,
        top3: [],
        debug: { splTokens: 0, solBalance, rpcStatus: "ok", birdeyeStatus: "skipped" },
        analysis: {
          totalTokens: 0,
          riskScore: 0,
          exposureScore: 0,
          opportunityScore: 0,
          hotTokens: [],
          riskyTokens: [],
          suggestions: ["This wallet has no SPL tokens and no SOL balance. It may be empty or inactive."],
        },
      });
    }

    // STEP 4 — Enrich top 20 with Birdeye price + metadata
    const tokensToEnrich = allTokens.slice(0, 20);
    let enriched: EnrichedToken[];
    let birdeyeStatus = "ok";

    try {
      enriched = await enrichTokensBatch(tokensToEnrich, 5);
      const priced = enriched.filter((t) => t.price > 0).length;
      console.log(`💰 Enriched: ${enriched.length} tokens, ${priced} with price data`);
      if (priced === 0) birdeyeStatus = "no_prices";
    } catch (enrichError) {
      console.warn("⚠️ Birdeye enrichment failed:", enrichError);
      birdeyeStatus = "error";
      enriched = allTokens.map((token) => ({
        mint: token.mint,
        balance: token.balance,
        name: token.mint === WSOL_MINT ? "Solana" : "",
        symbol: token.mint === WSOL_MINT ? "SOL" : token.mint.slice(0, 6).toUpperCase(),
        price: 0,
        liquidity: 0,
        volume24h: 0,
        priceChange24h: 0,
        valueUsd: 0,
        logoURI: "",
      }));
    }

    // Sort by USD value descending
    enriched.sort((a, b) => b.valueUsd - a.valueUsd);

    // STEP 5 — Compute analytics
    const totalValue = enriched.reduce((sum, t) => sum + t.valueUsd, 0);
    const totalTokens = enriched.length;
    const riskyTokens = enriched.filter((t) => t.liquidity < 50_000 && t.liquidity > 0);
    const trendingTokens = enriched.filter((t) => t.volume24h > 1_000_000);
    const unpricedTokens = enriched.filter((t) => t.price === 0);

    const riskScore = totalTokens > 0 ? Math.min(100, Math.round(
      ((riskyTokens.length * 1.0 + unpricedTokens.length * 0.5) / totalTokens) * 100
    )) : 0;
    const exposureScore = totalTokens > 0 ? Math.min(100, Math.round((trendingTokens.length / totalTokens) * 100)) : 0;
    const opportunityScore = Math.max(0, 100 - riskScore);

    // Heat scores per token
    const tokensWithHeat = enriched.map((t) => ({ ...t, heatScore: computeHeatScore(t) }));

    // Smart Money wallet tag
    const walletTag = getWalletTag(totalValue, totalTokens, trendingTokens.length);

    const suggestions: string[] = [];
    if (walletTag) suggestions.push(`${walletTag} detected based on portfolio characteristics.`);
    if (birdeyeStatus !== "ok") suggestions.push("⚠️ Price data unavailable — Birdeye API may be rate-limited. Token counts are accurate.");
    if (riskScore > 40) suggestions.push("⚠️ Over 40% of holdings are low-liquidity — consider rebalancing.");
    if (trendingTokens.length > 0) suggestions.push(`🔥 You hold ${trendingTokens.length} high-volume token(s) — strong momentum.`);
    if (exposureScore < 20 && totalTokens > 3) suggestions.push("👀 Low trending exposure — look for momentum opportunities.");
    if (totalTokens > 15) suggestions.push("📊 Large portfolio — consider consolidating into higher-conviction positions.");
    if (suggestions.length === 0) suggestions.push("✅ Portfolio looks balanced. Keep monitoring for new opportunities.");

    // Fire Telegram risk alert if score is high (non-blocking)
    if (riskScore > 70) {
      const riskySymbols = riskyTokens.map((t) => t.symbol).filter(Boolean);
      sendTelegramMessage(formatWalletRiskAlert(address, riskScore, riskySymbols)).catch(() => {});
    }

    const top3 = tokensWithHeat.slice(0, 3).map((t) => ({
      symbol: t.symbol || t.mint.slice(0, 6),
      valueUsd: t.valueUsd,
      price: t.price,
      heatScore: t.heatScore,
    }));

    console.log(`✅ Done — total value: $${totalValue.toFixed(2)}, tokens: ${totalTokens}, tag: ${walletTag}`);

    return NextResponse.json({
      success: true,
      tokens: tokensWithHeat,
      totalValue,
      top3,
      walletTag,
      debug: {
        splTokens: rawTokens.length,
        solBalance,
        totalTokensAnalyzed: totalTokens,
        rpcStatus: "ok",
        birdeyeStatus,
      },
      analysis: {
        totalTokens,
        riskScore,
        exposureScore,
        opportunityScore,
        hotTokens: trendingTokens.map((t) => t.symbol).filter(Boolean),
        riskyTokens: riskyTokens.map((t) => t.symbol).filter(Boolean),
        suggestions,
      },
    });
  } catch (error) {
    console.error("❌ Wallet API error:", error);
    return NextResponse.json({
      success: false,
      error: `Unable to fetch wallet data: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
}
