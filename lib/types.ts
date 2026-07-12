export type AssetStatus =
  | "Waiting"
  | "Uploaded"
  | "Revenue Verified"
  | "HSP Accepted"
  | "Distributed";

export interface RevenueProof {
  fileName: string;
  amount: number;
  referenceId: string;
  date: string;
  uploadedAt: string;
}

export interface AIVerificationResult {
  approved: boolean;
  confidence: number;
  reason: string;
  risks: string[];
  hash: string;
  analysis: string[];
  duplicateDetected: boolean;
  amountMatches: boolean;
  dueDateValid: boolean;
  rawProvider: "openai" | "mock";
}

export interface HSPDecision {
  ok: boolean;
  outcomeClass: "ACCEPT" | "REVIEW" | "REJECT";
  satisfiedCapabilities: string[];
  requiredCapabilities: string[];
  adapterAddress: string;
  receiptHash: string;
  details: string;
  mocked: boolean;
}

export interface DistributionRecord {
  id: string;
  assetId: string;
  amount: number;
  amountWei: string;
  txHash: string;
  verifiedHash: string;
  referenceId: string;
  confidence: number;
  approvedAt: string;
  investorCount: number;
  investors: InvestorPayout[];
}

export interface AssetRecord {
  id: string;
  name: string;
  expectedMonthlyRent: number;
  displayAmount: number;
  monthlyRentLabel: string;
  status: AssetStatus;
  dueDate: string;
  proof: RevenueProof | null;
  aiVerification: AIVerificationResult | null;
  hspVerification: HSPDecision | null;
  distribution: DistributionRecord | null;
}

export interface InvestorRecord {
  id: string;
  name: string;
  wallet: string;
  bps: number;
}

export interface InvestorPayout extends InvestorRecord {
  amount: number;
}
