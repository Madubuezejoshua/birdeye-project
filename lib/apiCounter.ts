/**
 * lib/apiCounter.ts
 * Persistent API call tracking using file storage
 * Maintains state across server restarts
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const COUNTER_FILE = join(process.cwd(), '.api-counter.json');

interface CounterData {
  count: number;
  history: Array<{ timestamp: number; endpoint: string; method: string }>;
}

class ApiCounter {
  private count = 0;
  private history: Array<{ timestamp: number; endpoint: string; method: string }> = [];
  private readonly maxHistory = 100;

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (existsSync(COUNTER_FILE)) {
        const data = readFileSync(COUNTER_FILE, 'utf8');
        const parsed: CounterData = JSON.parse(data);
        this.count = parsed.count || 0;
        this.history = parsed.history || [];
        console.log(`📊 Loaded API counter from file: ${this.count} calls`);
      }
    } catch (error) {
      console.warn('Failed to load API counter from file:', error);
      this.count = 0;
      this.history = [];
    }
  }

  private saveToFile(): void {
    try {
      const data: CounterData = {
        count: this.count,
        history: this.history,
      };
      writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save API counter to file:', error);
    }
  }

  increment(endpoint: string = 'unknown', method: string = 'GET'): number {
    this.count += 1;
    
    // Track call history
    this.history.push({
      timestamp: Date.now(),
      endpoint,
      method,
    });
    
    // Keep only recent history to prevent memory issues
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
    
    // Save to file immediately
    this.saveToFile();
    
    console.log(`📊 API Call #${this.count}: ${method} ${endpoint}`);
    
    return this.count;
  }

  get(): number {
    // Always read from file to ensure freshness after restarts
    this.loadFromFile();
    return this.count;
  }

  getHistory(limit: number = 10) {
    return this.history
      .slice(-limit)
      .map((call, index) => ({
        ...call,
        count: this.history.length - limit + index + 1,
      }));
  }

  getStats() {
    // Always read from file to ensure freshness after restarts
    this.loadFromFile();
    const maxCalls = 50;
    const usagePercentage = Math.min(100, (this.count / maxCalls) * 100);
    const remainingCalls = Math.max(0, maxCalls - this.count);
    const limitReached = this.count >= maxCalls;

    return {
      totalCalls: this.count,
      usagePercentage,
      remainingCalls,
      limitReached,
      maxCalls,
    };
  }

  reset(): void {
    this.count = 0;
    this.history = [];
    this.saveToFile();
    console.log('🔄 API counter reset and saved to file');
  }
}

// Global singleton instance - persists across requests AND server restarts
export const apiCounter = new ApiCounter();

// Legacy exports for backward compatibility
export const incrementApiCount = (endpoint?: string, method?: string) => 
  apiCounter.increment(endpoint, method);

export const getApiCount = () => apiCounter.get();

export const getApiStats = () => apiCounter.getStats();

export const getApiCallHistory = (limit?: number) => apiCounter.getHistory(limit);

export const resetApiCounter = () => apiCounter.reset();

export const MAX_API_CALLS = 50;