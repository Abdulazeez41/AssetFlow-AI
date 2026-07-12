import { z } from "zod";
import { getAsset, saveAsset } from "@/lib/db";
import { verifyWithHSP } from "@/lib/hsp";
import { badRequest, ok, serverError } from "@/lib/http";

const schema = z.object({
  assetId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return badRequest(
        "Invalid HSP verification request.",
        body.error.flatten(),
      );
    }

    const asset = await getAsset(body.data.assetId);
    if (!asset.proof || !asset.aiVerification) {
      return badRequest(
        "Revenue proof and Revenue Intelligence are required before HSP verification.",
      );
    }

    const decision = await verifyWithHSP(
      asset.id,
      asset.proof,
      asset.aiVerification,
    );
    const nextAsset = {
      ...asset,
      status:
        decision.outcomeClass === "ACCEPT"
          ? ("HSP Accepted" as const)
          : asset.status,
      hspVerification: decision,
    };

    await saveAsset(nextAsset);
    return ok({ decision, asset: nextAsset });
  } catch (error) {
    return serverError(
      "HSP verification failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
