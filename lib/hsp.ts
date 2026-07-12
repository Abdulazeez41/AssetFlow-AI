import { REQUIRED_HSP_CAPABILITIES, PINNED_ADAPTER_FALLBACK } from '@/lib/constants';
import { sha256Bytes32 } from '@/lib/hash';
import type { AIVerificationResult, HSPDecision, RevenueProof } from '@/lib/types';

interface Mandate {
  assetId: string;
  requiredCapabilities: string[];
}

interface Receipt {
  fileName: string;
  amount: number;
  referenceId: string;
  date: string;
}

interface Attestations {
  aiApproved: boolean;
  aiConfidence: number;
  duplicateDetected: boolean;
  amountMatches: boolean;
  dueDateValid: boolean;
}

interface HSPAdapter {
  verify(mandate: Mandate, receipt: Receipt, attestations: Attestations): Promise<HSPDecision>;
}

function deriveSatisfiedCapabilities(attestations: Attestations) {
  return [
    attestations.amountMatches ? 'AMOUNT_MATCH' : null,
    !attestations.duplicateDetected ? 'REFERENCE_UNIQUE' : null,
    attestations.dueDateValid ? 'DUE_DATE_VALID' : null,
    attestations.aiApproved && attestations.aiConfidence >= 90 ? 'AI_CONFIDENCE_HIGH' : null
  ].filter(Boolean) as string[];
}

class MockHSPAdapter implements HSPAdapter {
  async verify(mandate: Mandate, receipt: Receipt, attestations: Attestations): Promise<HSPDecision> {
    const satisfiedCapabilities = deriveSatisfiedCapabilities(attestations);
    const accepts = mandate.requiredCapabilities.every((capability) => satisfiedCapabilities.includes(capability));
    const receiptHash = sha256Bytes32(JSON.stringify(receipt));

    return {
      ok: accepts,
      outcomeClass: accepts ? 'ACCEPT' : 'REVIEW',
      requiredCapabilities: mandate.requiredCapabilities,
      satisfiedCapabilities,
      adapterAddress: process.env.HSP_PINNED_ADAPTER_ADDRESS || PINNED_ADAPTER_FALLBACK,
      receiptHash,
      details: accepts
        ? 'Mock HSP verifier accepted the receipt because every required settlement capability is satisfied.'
        : 'Mock HSP verifier flagged the receipt for manual review because one or more required capabilities were not satisfied.',
      mocked: true
    };
  }
}

class LiveHSPAdapter implements HSPAdapter {
  async verify(mandate: Mandate, receipt: Receipt, attestations: Attestations): Promise<HSPDecision> {
    const url = process.env.HSP_COORDINATOR_URL;
    const apiKey = process.env.HSP_API_KEY;
    const adapterAddress = process.env.HSP_PINNED_ADAPTER_ADDRESS || PINNED_ADAPTER_FALLBACK;

    if (!url || !apiKey) {
      return new MockHSPAdapter().verify(mandate, receipt, attestations);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-pinned-adapter-address': adapterAddress
        },
        body: JSON.stringify({
          adapterAddress,
          mandate,
          receipt,
          attestations
        })
      });

      if (!response.ok) {
        throw new Error(`HSP coordinator error ${response.status}`);
      }

      const payload = (await response.json()) as Partial<HSPDecision>;
      const decision: HSPDecision = {
        ok: Boolean(payload.ok),
        outcomeClass: payload.outcomeClass === 'ACCEPT' ? 'ACCEPT' : payload.outcomeClass === 'REJECT' ? 'REJECT' : 'REVIEW',
        requiredCapabilities: payload.requiredCapabilities || mandate.requiredCapabilities,
        satisfiedCapabilities: payload.satisfiedCapabilities || deriveSatisfiedCapabilities(attestations),
        adapterAddress,
        receiptHash: payload.receiptHash || sha256Bytes32(JSON.stringify(receipt)),
        details: payload.details || 'Live HSP coordinator decision received.',
        mocked: false
      };

      return decision;
    } catch {
      return new MockHSPAdapter().verify(mandate, receipt, attestations);
    }
  }
}

export async function verifyWithHSP(assetId: string, proof: RevenueProof, aiResult: AIVerificationResult): Promise<HSPDecision> {
  const verifier = new LiveHSPAdapter();
  const decision = await verifier.verify(
    {
      assetId,
      requiredCapabilities: REQUIRED_HSP_CAPABILITIES
    },
    {
      fileName: proof.fileName,
      amount: proof.amount,
      referenceId: proof.referenceId,
      date: proof.date
    },
    {
      aiApproved: aiResult.approved,
      aiConfidence: aiResult.confidence,
      duplicateDetected: aiResult.duplicateDetected,
      amountMatches: aiResult.amountMatches,
      dueDateValid: aiResult.dueDateValid
    }
  );

  return decision;
}
