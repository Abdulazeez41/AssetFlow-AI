import crypto from 'crypto';
import { getInvestors } from '@/lib/db';
import type { DistributionRecord, InvestorPayout } from '@/lib/types';

export async function calculateInvestorPayouts(amount: number): Promise<InvestorPayout[]> {
  const investors = await getInvestors();
  const totalBps = investors.reduce((sum, investor) => sum + investor.bps, 0);
  const totalCents = Math.round(amount * 100);

  let allocated = 0;
  const payouts = investors.map((investor, index) => {
    const cents = index === investors.length - 1
      ? totalCents - allocated
      : Math.floor((totalCents * investor.bps) / totalBps);
    allocated += cents;

    return {
      ...investor,
      amount: cents / 100
    };
  });

  return payouts;
}

export async function buildDistributionRecord(params: {
  assetId: string;
  amount: number;
  amountWei: string;
  verifiedHash: string;
  referenceId: string;
  confidence: number;
  txHash: string;
}): Promise<DistributionRecord> {
  const investors = await calculateInvestorPayouts(params.amount);
  return {
    id: crypto.randomUUID(),
    assetId: params.assetId,
    amount: params.amount,
    amountWei: params.amountWei,
    txHash: params.txHash,
    verifiedHash: params.verifiedHash,
    referenceId: params.referenceId,
    confidence: params.confidence,
    approvedAt: new Date().toISOString(),
    investorCount: investors.length,
    investors
  };
}
