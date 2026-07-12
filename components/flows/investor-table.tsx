import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, truncateHash } from "@/lib/utils";
import type { DistributionRecord } from "@/lib/types";

export function InvestorTable({
  distribution,
}: {
  distribution: DistributionRecord;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Investor Allocation Ledger
            </h2>
            <p className="text-sm text-slate-400">
              Proportional payouts based on token holdings
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {distribution.investorCount} Recipients
          </div>
        </div>
        <div className="max-h-[540px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-sm text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Investor</th>
                <th className="px-6 py-4 font-medium">Wallet</th>
                <th className="px-6 py-4 font-medium">Share</th>
                <th className="px-6 py-4 font-medium text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {distribution.investors.map((investor, index) => (
                <tr key={investor.id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="font-medium text-white">
                        {investor.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-400">
                      {truncateHash(investor.wallet, 10, 6)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300">
                      {(investor.bps / 100).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-semibold text-emerald-300">
                      {formatCurrency(investor.amount)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
