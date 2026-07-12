import Link from "next/link";
export const dynamic = "force-dynamic";
import { CompleteSummary } from "@/components/flows/complete-summary";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { getInvestors } from "@/lib/db";
import { CheckCircle2, ArrowLeft, PartyPopper } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function CompletePage() {
  const asset = await getAsset(ASSET_ID);
  const distribution = asset.distribution;
  const investors = await getInvestors();

  const perInvestor = 15000 / investors.length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settlement Complete</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Distribution Executed
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          Revenue has been verified, settled, and distributed to all token
          holders. The investor ledger is now updated.
        </p>
      </div>

      <StatusTimeline current={4} />

      {!distribution ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <PartyPopper className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">
                No distribution yet
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Complete the approval flow to execute the on-chain distribution.
              </p>
            </div>
            <Link href="/approval">
              <Button>Go to approval</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <CompleteSummary
          distribution={distribution}
          investors={investors}
          displayRevenue={15000}
          perInvestor={perInvestor}
        />
      )}

      <div className="flex justify-center pt-4">
        <Link href="/dashboard">
          <Button variant="secondary" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
