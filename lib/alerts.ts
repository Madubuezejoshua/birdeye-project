/**
 * lib/alerts.ts
 * Alert system for HOT token notifications
 */

export interface AlertSettings {
  telegram?: string; // telegram chat id or bot handle
  email?: string;
  enabled: boolean;
}

export function triggerHotTokenAlert(token: any) {
  const message = `🔥 HOT TOKEN ALERT

Name: ${token.name || token.symbol || 'Unknown'}
Symbol: ${token.symbol || 'N/A'}
Price: ${token.price ? `$${token.price.toFixed(6)}` : 'N/A'}
Volume 24h: ${token.volume24hUSD ? `$${(token.volume24hUSD / 1000000).toFixed(2)}M` : 'N/A'}
Liquidity: ${token.liquidity ? `$${(token.liquidity / 1000000).toFixed(2)}M` : 'N/A'}
24h Change: ${token.priceChange24hPercent ? `${token.priceChange24hPercent.toFixed(2)}%` : 'N/A'}

🚀 This token just hit HOT status!`;

  return message;
}

export function getAlertSettings(): AlertSettings {
  if (typeof window === 'undefined') {
    return { enabled: false };
  }
  
  try {
    const stored = localStorage.getItem('birdeye-alert-settings');
    return stored ? JSON.parse(stored) : { enabled: false };
  } catch {
    return { enabled: false };
  }
}

export function saveAlertSettings(settings: AlertSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('birdeye-alert-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save alert settings:', error);
  }
}