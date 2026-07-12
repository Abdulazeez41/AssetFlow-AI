import { z } from "zod";
import { getDistributions } from "@/lib/db";
import { sha256Bytes32 } from "@/lib/hash";
import type { AIVerificationResult, AssetRecord } from "@/lib/types";

const aiSchema = z.object({
  approved: z.boolean(),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
  risks: z.array(z.string()),
});

function buildDuplicateFlag(referenceId: string, referenceIds: string[]) {
  return referenceIds.some((item) => item === referenceId);
}

async function callOpenAI(prompt: string) {
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
            "You are an institutional financial settlement verifier. Return ONLY strict JSON. No markdown, no prose, no code fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content as string | undefined;
}

export async function evaluateRevenueProof(
  asset: AssetRecord,
): Promise<AIVerificationResult> {
  if (!asset.proof) {
    throw new Error("Revenue proof is required before Revenue verification.");
  }

  const distributions = await getDistributions();
  const duplicateDetected = buildDuplicateFlag(
    asset.proof.referenceId,
    distributions.map((item) => item.referenceId),
  );
  const amountMatches = asset.proof.amount === asset.expectedMonthlyRent;
  const dueDateValid = asset.proof.date <= asset.dueDate;

  const prompt = `Evaluate this monthly revenue settlement proof for a tokenized real estate asset. Focus on explainability, amount consistency, duplicates, and timing. Return ONLY JSON in this exact schema: {"approved":true,"confidence":98,"reason":"...","risks":[]}.\n\nAsset: ${asset.name}\nExpected rent: ${asset.expectedMonthlyRent}\nReceipt amount: ${asset.proof.amount}\nReference ID: ${asset.proof.referenceId}\nReceipt date: ${asset.proof.date}\nDue date: ${asset.dueDate}\nDuplicate detected: ${duplicateDetected}.`;

  const fallbackApproved = amountMatches && dueDateValid && !duplicateDetected;
  const fallbackConfidence = fallbackApproved ? 98 : 62;
  const fallbackReason = fallbackApproved
    ? "Amount matches lease, no duplicates detected, and receipt date is within the settlement window."
    : "One or more controls require manual review: amount mismatch, duplicate reference, or late settlement date.";
  const fallbackRisks = [
    !amountMatches
      ? "Receipt amount does not match the expected lease payment."
      : null,
    duplicateDetected
      ? "Reference ID appears to overlap with an existing distribution record."
      : null,
    !dueDateValid
      ? "Receipt date falls outside the contractual due date."
      : null,
  ].filter(Boolean) as string[];

  let base = {
    approved: fallbackApproved,
    confidence: fallbackConfidence,
    reason: fallbackReason,
    risks: fallbackRisks,
  };
  let rawProvider: "openai" | "mock" = "mock";

  try {
    const llmText = await callOpenAI(prompt);
    if (llmText) {
      base = aiSchema.parse(JSON.parse(llmText.trim()));
      rawProvider = "openai";
    }
  } catch {
    rawProvider = "mock";
  }

  return {
    ...base,
    hash: sha256Bytes32(
      JSON.stringify({ assetId: asset.id, proof: asset.proof, base }),
    ),
    analysis: [
      amountMatches
        ? "✓ Amount matches lease schedule"
        : "✗ Amount mismatch against lease schedule",
      dueDateValid
        ? "✓ Due date within covenant window"
        : "✗ Receipt date exceeds covenant window",
      duplicateDetected
        ? "✗ Duplicate reference ID detected"
        : "✓ No duplicate settlement reference detected",
    ],
    duplicateDetected,
    amountMatches,
    dueDateValid,
    rawProvider,
  };
}
