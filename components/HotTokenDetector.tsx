"use client";

import { useEffect, useRef } from "react";
import { getTokenSignal } from "@/lib/insights";
import { sendHotTokenAlert } from "@/lib/telegram-alerts";
import type { BirdeyeToken } from "@/types";

interface HotTokenDetectorProps {
  tokens: BirdeyeToken[];
}

export default function HotTokenDetector({ tokens }: HotTokenDetectorProps) {
  const previousHotTokens = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  useEffect(() => {
    const currentHotTokens = tokens.filter(token => 
      getTokenSignal({
        volume24hUSD: token.volume24hUSD,
        volumeChangePercent: token.volumeChangePercent,
        priceChange24hPercent: token.priceChange24hPercent,
        rank: token.rank,
        liquidity: token.liquidity,
      }).signal === "HOT"
    );

    const currentHotAddresses = new Set(currentHotTokens.map(t => t.address));
    
    // Skip alerts on first load to prevent spam
    if (!isInitialized.current) {
      previousHotTokens.current = currentHotAddresses;
      isInitialized.current = true;
      return;
    }
    
    // Find newly HOT tokens (not in previous set)
    const newHotTokens = currentHotTokens.filter(
      token => !previousHotTokens.current.has(token.address)
    );

    // Send alerts for new HOT tokens
    newHotTokens.forEach(async (token) => {
      try {
        const success = await sendHotTokenAlert(token);
        if (success) {
          console.log(`🔥 HOT token alert sent for ${token.symbol}`);
        }
      } catch (error) {
        console.error("Failed to send HOT token alert:", error);
      }
    });

    // Update the previous set
    previousHotTokens.current = currentHotAddresses;
  }, [tokens]);

  return null; // This component doesn't render anything
}