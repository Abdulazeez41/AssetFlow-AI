import { z } from "zod";
import { ASSET_ID } from "@/lib/constants";
import { getAsset, saveAsset } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/http";

const uploadSchema = z.object({
  amount: z.coerce.number().positive(),
  referenceId: z.string().min(3),
  date: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt");
    const parsed = uploadSchema.safeParse({
      amount: formData.get("amount"),
      referenceId: formData.get("referenceId"),
      date: formData.get("date"),
    });

    if (!parsed.success) {
      return badRequest("Invalid upload payload.", parsed.error.flatten());
    }

    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return badRequest("A PDF receipt is required.");
    }

    const asset = await getAsset(ASSET_ID);
    const nextAsset = {
      ...asset,
      status: "Uploaded" as const,
      proof: {
        fileName: file.name,
        amount: parsed.data.amount,
        referenceId: parsed.data.referenceId,
        date: parsed.data.date,
        uploadedAt: new Date().toISOString(),
      },
      aiVerification: null,
      hspVerification: null,
      distribution: null,
    };

    await saveAsset(nextAsset);
    return ok({ asset: nextAsset });
  } catch (error) {
    return serverError(
      "Upload failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
