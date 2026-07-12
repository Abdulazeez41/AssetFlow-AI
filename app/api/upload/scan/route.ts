import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { scanReceiptDocument } from "@/lib/receipt-scanner";
import { badRequest, ok, serverError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt");

    if (!(file instanceof File)) {
      return badRequest("A receipt file is required to run the scan.");
    }

    const asset = await getAsset(ASSET_ID);
    const scanned = await scanReceiptDocument(
      { name: file.name, size: file.size },
      asset,
    );
    return ok({ scanned });
  } catch (error) {
    return serverError(
      "Receipt scan failed.",
      error instanceof Error ? error.message : error,
    );
  }
}
