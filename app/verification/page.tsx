import Link from "next/link";
export const dynamic = "force-dynamic";
import { VerificationPanel } from "@/components/flows/verification-panel";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { Brain, Loader2 } from "lucide-react";

export default async function VerificationPage() {
  const asset = await getAsset(ASSET_ID);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Brain className="h-4 w-4" />
          <span>AI Settlement Verifier</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Revenue Intelligence
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          The verifier checks amount matching, due date validity, and duplicate
          settlement risk, returning structured JSON with confidence scoring.
        </p>
      </div>

      <StatusTimeline current={1} />

      {!asset.proof ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">
                No uploaded receipt found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Upload a revenue proof first to begin verification.
              </p>
            </div>
            <Link href="/upload">
              <Button>Upload revenue proof</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <VerificationPanel asset={asset} />
      )}
    </div>
  );
}
