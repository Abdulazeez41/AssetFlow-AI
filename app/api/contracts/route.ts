import { ok } from '@/lib/http';

export async function GET() {
  return ok({
    revenuePoolAddress: process.env.REVENUE_POOL_ADDRESS || process.env.NEXT_PUBLIC_REVENUE_POOL_ADDRESS || null,
    aiVerifierAddress: process.env.AI_VERIFIER_ADDRESS || process.env.NEXT_PUBLIC_AI_VERIFIER_ADDRESS || null,
    assetTokenAddress: process.env.ASSET_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || null
  });
}
