import { NextResponse } from "next/server";
import { getNewListings, getTokenOverview } from "@/lib/birdeye";
import { normalizeToken, enrichTokenWithDefaults, validateTokenForDisplay } from "@/lib/normalizeToken";

export async function GET() {
  try {
    // Fetch initial listings data
    const data = await getNewListings(20);
    const rawTokens = data?.data?.items || [];
    
    if (rawTokens.length === 0) {
      return NextResponse.json({ 
        data: { items: [] },
        success: true,
        message: "No new listings available"
      });
    }

    // Normalize and enrich tokens
    const enrichedTokens = await Promise.allSettled(
      rawTokens.map(async (rawToken: any) => {
        try {
          // Step 1: Normalize the raw token data
          let token = normalizeToken(rawToken);
          
          // Step 2: If token is missing critical data, try to enrich it
          if (!token.hasPrice || !token.hasVolume || !token.hasLiquidity) {
            try {
              const detailData = await getTokenOverview(token.address);
              if (detailData?.data) {
                // Merge enriched data
                const enrichedRaw = { ...rawToken, ...detailData.data };
                token = normalizeToken(enrichedRaw);
              }
            } catch (enrichError) {
              console.log(`Failed to enrich token ${token.address}:`, enrichError);
            }
          }
          
          // Step 3: Apply smart defaults for missing data
          token = enrichTokenWithDefaults(token);
          
          return token;
        } catch (error) {
          console.error(`Error processing token:`, error);
          // Return a basic normalized version even if enrichment fails
          return normalizeToken(rawToken);
        }
      })
    );

    // Filter successful results and validate for display
    const validTokens = enrichedTokens
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(validateTokenForDisplay);

    console.log(`✅ Processed ${rawTokens.length} raw tokens → ${validTokens.length} valid tokens`);

    return NextResponse.json({
      data: { items: validTokens },
      success: true,
      processed: rawTokens.length,
      valid: validTokens.length
    });
  } catch (e) {
    console.error("New listings API error:", e);
    return NextResponse.json({ 
      error: String(e),
      data: { items: [] }
    }, { status: 500 });
  }
}
