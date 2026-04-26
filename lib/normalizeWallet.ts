/**
 * lib/normalizeWallet.ts
 * Wallet portfolio data normalization and analysis
 */

import type { WalletHolding, WalletAnalysis } from "@/types";

export interface NormalizedWalletData {
  tokens: WalletHolding[];
  totalTokens: number;
  riskyTokens: number;
  trendingTokens: number;
  totalValue: number;
  validTokens: number;
}

export function validateSolanaAddress(address: string): boolean {
  // Basic Solana address validation
  if (!address || typeof address !== 'string') return false;
  
  // Solana addresses are base58 encoded and typically 32-44 characters
  if (address.length < 32 || address.length > 44) return false;
  
  // Check for valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!base58Regex.test(address)) return false;
  
  // Exclude known system addresses that aren't wallets
  const systemAddresses = [
    'So11111111111111111111111111111111111111112', // Wrapped SOL
    '11111111111111111111111111111111', // System Program
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
  ];
  
  if (systemAddresses.includes(address)) return false;
  
  return true;
}

export function normalizeWalletResponse(data: any): NormalizedWalletData {
  // Handle different API response structures
  const items = data?.data?.items || 
                data?.data || 
                data?.items || 
                data || 
                [];

  if (!Array.isArray(items)) {
    console.warn('Wallet API response is not an array:', data);
    return {
      tokens: [],
      totalTokens: 0,
      riskyTokens: 0,
      trendingTokens: 0,
      totalValue: 0,
      validTokens: 0,
    };
  }

  // Normalize each token holding
  const tokens: WalletHolding[] = items.map((item: any) => {
    // Handle different field names from various API responses
    const address = item.address || item.mint || item.tokenAddress || '';
    const symbol = item.symbol || item.tokenSymbol || item.name || 'UNKNOWN';
    const name = item.name || item.tokenName || item.symbol || '';
    const balance = parseFloat(item.balance || item.amount || item.quantity || '0');
    const valueUsd = parseFloat(item.valueUsd || item.value || item.usdValue || '0');
    const decimals = parseInt(item.decimals || '9');
    const logoURI = item.logoURI || item.image || item.logo || '';

    return {
      address,
      symbol,
      name,
      decimals,
      balance,
      valueUsd,
      logoURI,
    };
  }).filter((token: WalletHolding) => {
    // Filter out invalid tokens
    return token.address && 
           token.symbol && 
           token.symbol !== 'UNKNOWN' &&
           token.balance > 0;
  });

  const totalTokens = tokens.length;
  const validTokens = tokens.filter(t => t.valueUsd > 0).length;
  const totalValue = tokens.reduce((sum, token) => sum + (token.valueUsd || 0), 0);

  // Analyze risk based on token characteristics
  const riskyTokens = tokens.filter(token => {
    // Consider tokens risky if:
    // 1. Very low value (< $1)
    // 2. Unknown/suspicious symbols
    // 3. No logo/metadata
    const lowValue = (token.valueUsd || 0) < 1;
    const suspiciousSymbol = token.symbol.length > 10 || 
                            /[^A-Za-z0-9]/.test(token.symbol) ||
                            token.symbol.toLowerCase().includes('scam');
    const noMetadata = !token.logoURI && !token.name;
    
    return lowValue || suspiciousSymbol || noMetadata;
  }).length;

  // Analyze trending tokens (simplified heuristic)
  const trendingTokens = tokens.filter(token => {
    // Consider tokens trending if:
    // 1. High value (> $100)
    // 2. Well-known symbols
    // 3. Good metadata
    const highValue = (token.valueUsd || 0) > 100;
    const knownSymbols = ['SOL', 'USDC', 'USDT', 'RAY', 'SRM', 'ORCA', 'MNGO'];
    const isKnown = knownSymbols.includes(token.symbol);
    const hasMetadata = token.logoURI && token.name;
    
    return highValue || isKnown || hasMetadata;
  }).length;

  return {
    tokens,
    totalTokens,
    riskyTokens,
    trendingTokens,
    totalValue,
    validTokens,
  };
}

export function computeWalletAnalysis(
  walletData: NormalizedWalletData,
  trendingAddresses: Set<string> = new Set(),
  riskyAddresses: Set<string> = new Set()
): WalletAnalysis {
  const { tokens, totalTokens, riskyTokens, trendingTokens } = walletData;

  if (totalTokens === 0) {
    return {
      totalTokens: 0,
      riskScore: 0,
      exposureScore: 0,
      opportunityScore: 0,
      hotTokens: [],
      riskyTokens: [],
      suggestions: ["Enter a valid Solana wallet address to get started."],
    };
  }

  // Calculate scores
  const riskScore = Math.min(100, Math.round((riskyTokens / totalTokens) * 100));
  const exposureScore = Math.min(100, Math.round((trendingTokens / totalTokens) * 100));
  const opportunityScore = Math.max(0, Math.min(100, 100 - riskScore));

  // Get token symbols for display
  const hotTokenSymbols = tokens
    .filter(token => trendingAddresses.has(token.address) || (token.valueUsd || 0) > 100)
    .map(token => token.symbol)
    .slice(0, 10); // Limit display

  const riskyTokenSymbols = tokens
    .filter(token => riskyAddresses.has(token.address) || (token.valueUsd || 0) < 1)
    .map(token => token.symbol)
    .slice(0, 10); // Limit display

  // Generate smart suggestions
  const suggestions: string[] = [];
  
  if (riskScore > 40) {
    suggestions.push("⚠️ High risk detected - consider diversifying away from low-value tokens.");
  }
  
  if (exposureScore > 60) {
    suggestions.push("🔥 Strong trending exposure - you're well-positioned for market momentum.");
  }
  
  if (exposureScore < 20 && totalTokens > 5) {
    suggestions.push("👀 Low trending exposure - consider adding some momentum plays.");
  }
  
  if (totalTokens > 20) {
    suggestions.push("📊 Large portfolio - consider consolidating into higher-conviction positions.");
  }
  
  if (totalTokens < 5 && walletData.totalValue > 1000) {
    suggestions.push("💎 Concentrated portfolio - good focus on quality positions.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("✅ Portfolio looks balanced - keep monitoring for new opportunities.");
  }

  return {
    totalTokens,
    riskScore,
    exposureScore,
    opportunityScore,
    hotTokens: hotTokenSymbols,
    riskyTokens: riskyTokenSymbols,
    suggestions,
  };
}