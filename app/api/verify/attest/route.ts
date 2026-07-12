import { z } from "zod";
import { getAsset } from "@/lib/db";
import { signDistributionAttestation } from "@/lib/ai-signature";
import { badRequest, ok, serverError } from "@/lib/http";

const schema = z.object({
  assetId: z.string().min(1),
  cycle: z.number().int().positive(),
  chainId: z.number().int().positive(),
  poolAddress: z.string().min(1),
  aiVerifierAddress: z.string().min(1),
});

/// This is the endpoint that turns "Revenue Verified + HSP Accepted" into an
/// actual on-chain-usable authorization. It refuses to produce a signature
/// unless both the stored Revenue Intelligence and the stored HSP decision are
/// present and both actually say yes - see signDistributionAttestation for
/// the hard checks. The signature this returns is what the frontend then
/// passes into RevenuePool.approveDistribution(); without it the contract
/// call reverts, full stop.
export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return badRequest("Invalid attestation request.", body.error.flatten());
    }

    const asset = await getAsset(body.data.assetId);
    if (!asset.aiVerification || !asset.hspVerification) {
      return badRequest(
        "Revenue Intelligence and HSP verification must both complete before requesting an attestation.",
      );
    }

    const attestation = await signDistributionAttestation(
      {
        poolAddress: body.data.poolAddress,
        chainId: body.data.chainId,
        aiVerifierAddress: body.data.aiVerifierAddress,
        cycle: body.data.cycle,
        assetId: asset.id,
        confidence: asset.aiVerification.confidence,
        hashValue: asset.hspVerification.receiptHash,
      },
      asset.aiVerification,
      asset.hspVerification,
    );

    return ok({ attestation });
  } catch (error) {
    return serverError(
      "Failed to sign distribution attestation.",
      error instanceof Error ? error.message : error,
    );
  }
}
