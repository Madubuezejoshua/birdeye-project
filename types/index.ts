// ─── Birdeye API Types ───────────────────────────────────────────────────────

export interface BirdeyeToken {
  address: string;
  symbol: string;
  name?: string;
  decimals?: number;
  price?: number;
  priceChange24hPercent?: number;
  volume24hUSD?: number;
  volumeChangePercent?: number;
  volumeDelta?: number;
  liquidity?: number;
  marketCap?: number;
  rank?: number;
  logoURI?: string;
  // Extended fields for safe display
  isValid?: boolean;
  hasPrice?: boolean;
  hasVolume?: boolean;
  hasLiquidity?: boolean;
  displayName?: string;
  displaySymbol?: string;
}

export interface BirdeyeTokenOverview extends BirdeyeToken {
  supply?: number;
  holder?: number;
  extensions?: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
}

export interface BirdeyeTokenSecurity {
  address: string;
  score?: number;
  mintable?: boolean;
  freezable?: boolean;
  mutableMetadata?: boolean;
  top10HolderPercent?: number;
  ownerBalance?: number;
  creatorBalance?: number;
  creationTx?: string;
}

export interface BirdeyePricePoint {
  unixTime: number;
  value: number;
}

export interface BirdeyeNewListing extends BirdeyeToken {
  listingTime?: number;
}

// ─── Wallet Types ─────────────────────────────────────────────────────────────

export interface WalletHolding {
  address: string;
  symbol: string;
  name?: string;
  decimals?: number;
  balance?: number;
  valueUsd?: number;
  logoURI?: string;
}

// ─── Insight Engine Types ─────────────────────────────────────────────────────

export type TokenSignal = "HOT" | "RISK" | "WATCH";

export interface TokenInsight {
  signal: TokenSignal;
  label: string;
  emoji: string;
  color: string;
}

export interface WalletAnalysis {
  totalTokens: number;
  riskScore: number;
  exposureScore: number;
  opportunityScore: number;
  hotTokens: string[];
  riskyTokens: string[];
  suggestions: string[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface TrendingResponse {
  tokens: BirdeyeToken[];
}

export interface NewListingsResponse {
  items: BirdeyeNewListing[];
}

export interface TokenDetailResponse {
  overview: BirdeyeTokenOverview | null;
  security: BirdeyeTokenSecurity | null;
  history: BirdeyePricePoint[];
}

export interface WalletApiResponse {
  holdings: WalletHolding[];
  analysis: WalletAnalysis;
  trendingCount: number;
  error?: string;
}
