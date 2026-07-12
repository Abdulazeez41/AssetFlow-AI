import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { sha256Bytes32 } from '@/lib/hash';
import type { AIVerificationResult } from '@/lib/types';

const aiVerifierAbi = [
  'function storeVerification(bytes32 assetIdHash, bool approved, uint256 confidence, bytes32 hashValue) external'
];

export async function storeAIVerificationOnChain(assetId: string, verification: AIVerificationResult) {
  const rpcUrl = process.env.HASHKEY_RPC_URL;
  const privateKey = process.env.HASHKEY_PRIVATE_KEY;
  const contractAddress = process.env.AI_VERIFIER_ADDRESS || process.env.NEXT_PUBLIC_AI_VERIFIER_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    return { stored: false, txHash: null };
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, aiVerifierAbi, wallet);
  const tx = await contract.storeVerification(sha256Bytes32(assetId), verification.approved, verification.confidence, verification.hash);
  await tx.wait();
  return { stored: true, txHash: tx.hash };
}
