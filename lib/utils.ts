/**
 * Format a number into a human-readable string with optional currency prefix.
 * e.g. 1_500_000 → "$1.50M"
 */
export function formatNumber(n: number | undefined | null, prefix = ""): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(2)}K`;
  if (n < 0.01 && n > 0) return `${prefix}${n.toExponential(2)}`;
  return `${prefix}${n.toFixed(4)}`;
}

/**
 * Format a price with smart decimal places.
 */
export function formatPrice(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

/**
 * Format a percentage change with sign.
 */
export function formatPercent(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * Shorten a wallet/contract address for display.
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Returns a CSS class string for positive/negative values.
 */
export function changeColor(n: number | undefined | null): string {
  if (n === undefined || n === null) return "text-gray-400";
  return n >= 0 ? "text-green-400" : "text-red-400";
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
