"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Users, DollarSign, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, truncateHash } from "@/lib/utils";
import type { DistributionRecord, InvestorRecord } from "@/lib/types";

export function CompleteSummary({
  distribution,
  investors,
  displayRevenue,
  perInvestor,
}: {
  distribution: DistributionRecord;
  investors: InvestorRecord[];
  displayRevenue: number;
  perInvestor: number;
}) {
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Investors Paid",
      value: `${distribution.investorCount} investors`,
      accent: "emerald",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Total Distributed",
      value: formatCurrency(displayRevenue),
      accent: "sky",
    },
    {
      icon: <Hash className="h-5 w-5" />,
      label: "Transaction Hash",
      value: truncateHash(distribution.txHash, 12, 10),
      accent: "amber",
      mono: true,
    },
  ];

  const accentColors: Record<string, string> = {
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    sky: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/20 text-emerald-300">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold text-emerald-200">
            On-chain distribution confirmed
          </div>
          <div className="text-sm text-emerald-300/70">
            RevenuePool.approveDistribution() executed successfully. Investor
            claims are now live.
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div
              className={`mb-4 inline-flex rounded-xl border p-2.5 ${accentColors[stat.accent]}`}
            >
              {stat.icon}
            </div>
            <div className="text-sm font-medium text-slate-400">
              {stat.label}
            </div>
            <div
              className={`mt-1 text-2xl font-semibold tracking-tight text-white ${stat.mono ? "font-mono text-lg" : ""}`}
            >
              {stat.value}
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl opacity-0 transition-opacity group-hover:opacity-80" />
          </motion.div>
        ))}
      </div>

      {/* Investor Ledger */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Investor Allocation Ledger
            </h3>
            <p className="text-sm text-slate-400">
              Pro-rata distribution across {investors.length} token holders
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Cycle 01
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Investor</th>
                <th className="px-6 py-3">Wallet</th>
                <th className="px-6 py-3 text-right">Share</th>
                <th className="px-6 py-3 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investors.slice(0, 20).map((investor, index) => (
                <motion.tr
                  key={investor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.02 }}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-6 py-3.5 text-sm text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-white">
                    {investor.name}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                    {investor.wallet.slice(0, 6)}...{investor.wallet.slice(-4)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-300">
                    {(investor.bps / 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm font-semibold text-emerald-300">
                    {formatCurrency(perInvestor)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {investors.length > 20 && (
          <div className="border-t border-white/5 bg-white/5 px-6 py-3 text-center text-sm text-slate-400">
            Showing 20 of {investors.length} investors
          </div>
        )}
      </Card>
    </div>
  );
}
