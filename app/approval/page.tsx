import Link from "next/link";
export const dynamic = "force-dynamic";
import { ApprovalPanel } from "@/components/flows/approval-panel";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { ShieldCheck, FileCheck } from "lucide-react";

export default async function ApprovalPage() {
  const asset = await getAsset(ASSET_ID);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span>Settlement Execution</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Approve Distribution
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          Distribution only advances to RevenuePool once the HSP settlement
          layer returns an ACCEPT decision and the wallet signs the on-chain
          approval.
        </p>
      </div>

      <StatusTimeline current={3} />

      {!asset.aiVerification?.approved ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-slate-200">
              <FileCheck className="h-5 w-5 text-amber-300" />
              <span>
                Complete revenue verification before entering the settlement
                approval stage.
              </span>
            </div>
            <Link href="/verification">
              <Button>Open Revenue verification</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ApprovalPanel asset={asset} />
      )}
    </div>
  );
}
