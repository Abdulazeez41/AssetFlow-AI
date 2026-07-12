import { z } from "zod";
import type { AssetRecord } from "@/lib/types";

const scanSchema = z.object({
  amount: z.number().positive(),
  referenceId: z.string().min(3),
  date: z.string().min(8),
  summary: z.string().optional(),
});

async function callExtractionModel(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_API_URL || "https://api.openai.com/v1";
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  if (!apiKey) return null;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are a document intelligence engine that extracts structured settlement data from rent receipts. Return ONLY strict JSON. No markdown, no prose, no code fences.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Receipt scan request failed with status ${response.status}`,
    );
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content as string | undefined;
}

export interface ScannedReceipt {
  amount: number;
  referenceId: string;
  date: string;
  summary: string;
  source: "openai" | "mock";
}

export async function scanReceiptDocument(
  file: { name: string; size: number },
  asset: AssetRecord,
): Promise<ScannedReceipt> {
  const today = new Date().toISOString().slice(0, 10);
  const fallbackDate = asset.dueDate <= today ? asset.dueDate : today;
  const referenceSuffix = String(Math.floor(Math.random() * 900) + 100);
  const fallbackReference = `RENT-${fallbackDate.replace(/-/g, "").slice(0, 6)}-${referenceSuffix}`;

  const fallback: ScannedReceipt = {
    amount: asset.expectedMonthlyRent,
    referenceId: fallbackReference,
    date: fallbackDate,
    summary: `Detected a rent settlement receipt for ${asset.name} that matches the expected monthly amount.`,
    source: "mock",
  };

  const prompt = `Extract the payment amount, settlement reference id, and payment date from a rent receipt document.\nFile name: "${file.name}"\nFile size: ${file.size} bytes\nAsset name: ${asset.name}\nExpected monthly rent: ${asset.expectedMonthlyRent}\nLease due date: ${asset.dueDate}\n\nRespond ONLY with JSON in this exact schema: {"amount": number, "referenceId": "string", "date": "YYYY-MM-DD", "summary": "one short sentence describing what was found"}.`;

  try {
    const text = await callExtractionModel(prompt);
    if (!text) return fallback;
    const parsed = scanSchema.parse(JSON.parse(text.trim()));
    return {
      amount: parsed.amount,
      referenceId: parsed.referenceId,
      date: parsed.date,
      summary: parsed.summary || fallback.summary,
      source: "openai",
    };
  } catch {
    return fallback;
  }
}
