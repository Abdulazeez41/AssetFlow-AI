import { z } from "zod";
import { getAsset, saveAsset, saveDistribution } from "@/lib/db";
import { buildDistributionRecord } from "@/lib/distribution";
import { badRequest, ok, serverError } from "@/lib/http";

const schema = z.object({
  assetId: z.string().min(1),
  txHash: z.string().min(6),
  amountWei: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return badRequest(
        "Invalid distribution execution request.",
        body.error.flatten(),
      );
    }

    const asset = await getAsset(body.data.assetId);
    if (!asset.proof || !asset.aiVerification || !asset.hspVerification) {
      return badRequest(
        "Upload, Revenue Intelligence, and HSP verification must complete before distribution.",
      );
    }

    if (asset.hspVerification.outcomeClass !== "ACCEPT") {
      return badRequest(
        "Distribution blocked because HSP outcomeClass is not ACCEPT.",
      );
    }

    const distribution = await buildDistributionRecord({
      assetId: asset.id,
      amount: asset.proof.amount,
      amountWei: body.data.amountWei,
      verifiedHash: asset.hspVerification.receiptHash,
      referenceId: asset.proof.referenceId,
      confidence: asset.aiVerification.confidence,
      txHash: body.data.txHash,
    });

    await saveDistribution(distribution);
    const nextAsset = {
      ...asset,
      status: "Distributed" as const,
      distribution,
    };
    await saveAsset(nextAsset);

    return ok({ distribution, asset: nextAsset });
  } catch (error) {
    return serverError(
      "Distribution execution failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
