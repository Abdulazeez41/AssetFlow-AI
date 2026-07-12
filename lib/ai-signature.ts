import { Wallet } from "ethers";
import { sha256Bytes32 } from "@/lib/hash";
import type {
  AIVerificationResult,
  AssetRecord,
  HSPDecision,
} from "@/lib/types";

/// This is the missing link: previously, the AI's decision and the HSP
/// decision were computed off-chain and simply *displayed* to the user,
/// who then separately signed a raw approveDistribution(hash, confidence)
/// call with no cryptographic connection back to either decision.
///
/// This module signs an EIP-712 attestation over the exact same struct
/// AIVerifier.sol expects. The private key used here belongs to a
/// dedicated AI-signer wallet - it never needs gas and never sends a
/// transaction, it only signs. Keep it separate from the deployer/owner
/// key entirely (do not reuse HASHKEY_PRIVATE_KEY for this).

interface AttestationInput {
  poolAddress: string;
  chainId: number;
  aiVerifierAddress: string;
  cycle: number;
  assetId: string;
  confidence: number;
  hashValue: string; // bytes32, e.g. hsp.receiptHash
}

interface SignedAttestation {
  assetIdHash: string;
  confidence: number;
  hashValue: string;
  expiry: number;
  signature: string;
  aiSigner: string;
}

function domain(chainId: number, verifyingContract: string) {
  return {
    name: "AssetFlowAIVerifier",
    version: "1",
    chainId,
    verifyingContract,
  };
}

const types = {
  VerificationAttestation: [
    { name: "pool", type: "address" },
    { name: "cycle", type: "uint256" },
    { name: "assetIdHash", type: "bytes32" },
    { name: "approved", type: "bool" },
    { name: "confidence", type: "uint256" },
    { name: "hashValue", type: "bytes32" },
    { name: "expiry", type: "uint256" },
  ],
};

/// Signs an attestation ONLY if both the Revenue verification and the HSP
/// decision actually approved/accepted. This function is the single
/// choke point where "should this distribution be allowed to proceed"
/// gets decided - everything upstream (Revenue check, HSP check) feeds into
/// it, and nothing downstream can move funds without its signature.
export async function signDistributionAttestation(
  input: AttestationInput,
  aiResult: AIVerificationResult,
  hspDecision: HSPDecision,
): Promise<SignedAttestation> {
  if (!aiResult.approved) {
    throw new Error(
      "Refusing to sign: Revenue verification did not approve this proof.",
    );
  }
  if (hspDecision.outcomeClass !== "ACCEPT") {
    throw new Error("Refusing to sign: HSP outcomeClass is not ACCEPT.");
  }

  const privateKey = process.env.AI_SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "AI_SIGNER_PRIVATE_KEY is not configured - cannot produce a real attestation.",
    );
  }

  const wallet = new Wallet(privateKey);
  const assetIdHash = sha256Bytes32(input.assetId);
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h validity window

  const value = {
    pool: input.poolAddress,
    cycle: BigInt(input.cycle),
    assetIdHash,
    approved: true,
    confidence: BigInt(input.confidence),
    hashValue: input.hashValue,
    expiry: BigInt(expiry),
  };

  const signature = await wallet.signTypedData(
    domain(input.chainId, input.aiVerifierAddress),
    types,
    value,
  );

  return {
    assetIdHash,
    confidence: input.confidence,
    hashValue: input.hashValue,
    expiry,
    signature,
    aiSigner: wallet.address,
  };
}
