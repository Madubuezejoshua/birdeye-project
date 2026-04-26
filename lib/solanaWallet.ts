/**
 * lib/solanaWallet.ts
 * Fetches SPL token balances + SOL balance using Helius RPC with fallback.
 */

export interface SolanaTokenAccount {
  mint: string;
  balance: number;
}

const HELIUS_RPC = process.env.HELIUS_RPC_URL ?? "";
const FALLBACK_RPC = "https://api.mainnet-beta.solana.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callRPC(url: string, body: object): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status} from ${url.slice(0, 40)}`);
  }

  const json = await res.json();

  // Surface RPC-level errors clearly
  if (json.error) {
    const msg = json.error.message ?? JSON.stringify(json.error);
    throw new Error(`RPC error: ${msg}`);
  }

  return json;
}

/**
 * Try Helius first, automatically fall back to public Solana RPC on any failure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryRPC(payload: object): Promise<any> {
  // Try Helius if configured
  if (HELIUS_RPC) {
    try {
      console.log(`🔍 Trying Helius RPC...`);
      return await callRPC(HELIUS_RPC, payload);
    } catch (err) {
      console.warn(`⚠️ Helius failed (${err instanceof Error ? err.message : err}), switching to fallback...`);
    }
  } else {
    console.warn("⚠️ HELIUS_RPC_URL not set, using public fallback RPC");
  }

  // Fallback to public Solana RPC
  console.log("🔍 Trying public Solana RPC fallback...");
  return await callRPC(FALLBACK_RPC, payload);
}

/** Fetch all SPL token accounts with non-zero balance */
export async function getWalletTokens(wallet: string): Promise<SolanaTokenAccount[]> {
  const data = await tryRPC({
    jsonrpc: "2.0",
    id: "spl-tokens",
    method: "getTokenAccountsByOwner",
    params: [
      wallet,
      { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      { encoding: "jsonParsed" },
    ],
  });

  const accounts = data.result?.value ?? [];
  console.log(`📦 SPL accounts found: ${accounts.length}`);

  return accounts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      const info = item?.account?.data?.parsed?.info;
      const balance = info?.tokenAmount?.uiAmount ?? 0;
      return { mint: info?.mint ?? "", balance };
    })
    .filter((t: SolanaTokenAccount) => t.mint && t.balance > 0);
}

/** Fetch native SOL balance in SOL (not lamports) */
export async function getSolBalance(wallet: string): Promise<number> {
  try {
    const data = await tryRPC({
      jsonrpc: "2.0",
      id: "sol-balance",
      method: "getBalance",
      params: [wallet],
    });
    const lamports = data.result?.value ?? 0;
    return lamports / 1_000_000_000;
  } catch (err) {
    console.error("getSolBalance failed:", err);
    return 0;
  }
}
