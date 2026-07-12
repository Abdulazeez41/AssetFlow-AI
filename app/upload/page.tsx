import { UploadForm } from "@/components/flows/upload-form";
export const dynamic = "force-dynamic";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { FileText, Sparkles } from "lucide-react";
import { ASSET_ID } from "@/lib/constants";
import { getAsset } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function UploadPage() {
  const asset = await getAsset(ASSET_ID);
  const expectedAmount = asset.displayAmount;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <FileText className="h-4 w-4" />
          <span>Revenue Settlement</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Submit Settlement Proof
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          Upload the monthly rent receipt for {asset.name}. Our verification
          engine will automatically extract and validate the settlement details.
        </p>
      </div>

      <StatusTimeline current={0} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <UploadForm />

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Smart Extraction
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Our AI-powered document scanner automatically reads the receipt
              and pre-fills the settlement amount, reference ID, and posting
              date.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">
              Expected Details
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Asset</span>
                <span className="font-medium text-white">{asset.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Expected Amount</span>
                <span className="font-medium text-emerald-300">
                  {formatCurrency(expectedAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Due Date</span>
                <span className="font-medium text-white">{asset.dueDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Format</span>
                <span className="font-medium text-white">PDF only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
