import { z } from "zod";
import { getAsset, saveAsset } from "@/lib/db";
import { evaluateRevenueProof } from "@/lib/ai-verifier";
import { storeAIVerificationOnChain } from "@/lib/chain";
import { badRequest, ok, serverError } from "@/lib/http";

const schema = z.object({
  assetId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return badRequest("Invalid verification request.", body.error.flatten());
    }

    const asset = await getAsset(body.data.assetId);
    if (!asset.proof) {
      return badRequest(
        "Upload revenue proof before running Revenue Intelligence.",
      );
    }

    const verification = await evaluateRevenueProof(asset);
    const nextAsset = {
      ...asset,
      status: verification.approved
        ? ("Revenue Verified" as const)
        : asset.status,
      aiVerification: verification,
    };

    await saveAsset(nextAsset);
    const onChain = await storeAIVerificationOnChain(
      asset.id,
      verification,
    ).catch(() => ({ stored: false, txHash: null }));
    return ok({ verification, asset: nextAsset, onChain });
  } catch (error) {
    return serverError(
      "Revenue Intelligence failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
