import { ASSET_ID, DASHBOARD_COPY } from '@/lib/constants';
import { getAsset, getInvestors } from '@/lib/db';
import { calculateInvestorPayouts } from '@/lib/distribution';

export async function getDashboardSnapshot() {
  const asset = await getAsset(ASSET_ID);
  return {
    asset,
    investorCount: (await getInvestors()).length,
    previewPayouts: await calculateInvestorPayouts(asset.proof?.amount ?? asset.expectedMonthlyRent),
    heroCopy: DASHBOARD_COPY
  };
}
