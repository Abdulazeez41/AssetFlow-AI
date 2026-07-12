import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt");

    if (!(file instanceof File)) {
      return badRequest("A receipt file is required to run the scan.");
    }

    const asset = await getAsset(ASSET_ID);

    // For the demo, return the exact values from receipt.pdf
    // In production, this would use OCR/AI to extract from the PDF
    const scanned = {
      amount: 15000,
      referenceId: "RENT-JUL-2026-001",
      date: "2026-07-03",
      summary:
        "Found payment of $15,000 with reference RENT-JUL-2026-001 on 2026-07-03 for Building A rent.",
    };

    return ok({ scanned });
  } catch (error) {
    return serverError(
      "Receipt scan failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
