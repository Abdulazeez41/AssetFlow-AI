import Link from "next/link";
export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/demo";
import { getInvestors } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import type { InvestorPayout } from "@/lib/types";
import {
  Building2,
  TrendingUp,
  Activity,
  ArrowRight,
  Zap,
  Upload,
  FileText,
} from "lucide-react";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  const investors = await getInvestors();

  const proof = snapshot.asset.proof;
  const hasProof = proof !== null;
  const displayRent = hasProof
    ? proof.amount
    : (snapshot.asset as any).displayAmount || 15000;

  const displayRentFormatted = hasProof ? formatCurrency(displayRent) : "-";

  let previewPayouts: InvestorPayout[] = [];
  if (hasProof && investors.length > 0) {
    const totalBps = investors.reduce((sum, inv) => sum + inv.bps, 0);
    const totalCents = Math.round(displayRent * 100);
    let allocated = 0;

    previewPayouts = investors.map((investor, index) => {
      const cents =
        index === investors.length - 1
          ? totalCents - allocated
          : Math.floor((totalCents * investor.bps) / totalBps);
      allocated += cents;
      return {
        ...investor,
        amount: cents / 100,
      };
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            <span>Live Settlement Engine</span>
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Asset Control Center
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Real-time monitoring of tokenized revenue streams and distribution
            cycles.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          label="Active Asset"
          value={snapshot.asset.name}
          subtext="Prime Office RWA"
          accent="emerald"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Monthly Yield"
          value={displayRentFormatted}
          subtext={hasProof ? "Expected lease inflow" : "Awaiting proof upload"}
          accent="sky"
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Cycle Status"
          value={snapshot.asset.status}
          subtext={
            snapshot.asset.status === "Waiting"
              ? "Awaiting proof upload"
              : snapshot.asset.status === "Revenue Verified"
                ? "AI verification complete"
                : "In progress"
          }
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Distribution Preview
                </h2>
                <p className="text-sm text-slate-400">
                  {hasProof
                    ? `${formatCurrency(displayRent)} targeted for ${previewPayouts.length} investors`
                    : "Upload revenue proof to calculate investor allocations"}
                </p>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Cycle 01
              </div>
            </div>

            {hasProof ? (
              <div className="divide-y divide-white/5">
                {previewPayouts.slice(0, 5).map((payout, index) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between px-6 py-4 transition hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-medium text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {payout.name}
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          {payout.wallet.slice(0, 6)}...
                          {payout.wallet.slice(-4)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-300">
                        {formatCurrency(payout.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(payout.bps / 100).toFixed(1)}% share
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Upload className="h-7 w-7 text-slate-400" />
                </div>
                <div className="text-sm font-medium text-white">
                  No revenue proof uploaded
                </div>
                <div className="mt-1 max-w-sm text-xs text-slate-400">
                  Upload the monthly rent receipt to calculate and display
                  investor allocations
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-sky/5 pointer-events-none" />
          <CardContent className="relative space-y-6 p-6">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                {hasProof ? "In Progress" : "Action Required"}
              </div>
              <h2 className="text-xl font-semibold text-white">
                {hasProof ? "Continue Settlement" : "Initiate Settlement"}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {hasProof
                  ? "Revenue proof uploaded. Proceed to Revenue verification to continue the settlement pipeline."
                  : "Upload the monthly rent receipt to trigger the Revenue verification and cryptographic settlement pipeline."}
              </p>
            </div>

            {hasProof ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium text-white">
                    {snapshot.asset.proof.fileName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-medium text-white">
                    {formatCurrency(snapshot.asset.proof.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Reference ID</span>
                  <span className="font-mono text-xs text-white">
                    {snapshot.asset.proof.referenceId}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Expected Amount</span>
                  {/* DYNAMIC: Pulls from seed data instead of hardcoded 15000 */}
                  <span className="font-medium text-white">
                    {formatCurrency(
                      (snapshot.asset as any).displayAmount || 15000,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Reference ID</span>
                  <span className="font-medium text-white">
                    RENT-JUL-2026-001
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Due Date</span>
                  <span className="font-medium text-white">
                    {snapshot.asset.dueDate}
                  </span>
                </div>
              </div>
            )}

            <Link
              href={hasProof ? "/verification" : "/upload"}
              className="block"
            >
              <Button className="w-full group">
                {hasProof ? (
                  <>
                    Proceed to Revenue Verification
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Upload Revenue Proof
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  accent: "emerald" | "sky" | "amber";
}) {
  const accentColors = {
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    sky: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]">
      <div
        className={`mb-4 inline-flex rounded-xl border p-2.5 ${accentColors[accent]}`}
      >
        {icon}
      </div>
      <div className="text-sm font-medium text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-500">{subtext}</div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-opacity group-hover:opacity-80 opacity-0" />
    </div>
  );
}
