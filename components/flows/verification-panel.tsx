"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AssetRecord, AIVerificationResult } from "@/lib/types";

export function VerificationPanel({ asset }: { asset: AssetRecord }) {
  const router = useRouter();
  const [result, setResult] = useState<AIVerificationResult | null>(
    asset.aiVerification,
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  async function runVerification() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Verification failed");
      setResult(payload.verification);

      if (payload.verification.approved) {
        setTimeout(() => {
          router.push("/approval");
          router.refresh();
        }, 900);
      } else {
        router.refresh();
      }
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Verification failed",
      );
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    if (!hasStarted.current && !asset.aiVerification && asset.proof) {
      hasStarted.current = true;
      void runVerification();
    } else if (!hasStarted.current && asset.aiVerification?.approved) {
      hasStarted.current = true;
      setTimeout(() => {
        router.push("/approval");
        router.refresh();
      }, 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = result ?? asset.aiVerification;
  const isPending = running || !current;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Verification</CardTitle>
        <CardDescription>
          The verifier checks amount matching, due date validity, and duplicate
          settlement risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(
            current?.analysis || [
              "Amount consistency check",
              "Duplicate settlement scan",
              "Due date validation",
            ]
          ).map((line, index) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span>{line}</span>
            </motion.div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-200">
            <span>Confidence</span>
            <span>{current?.confidence ?? 0}%</span>
          </div>
          <Progress value={current?.confidence ?? 0} />
        </div>
        <AnimatePresence>
          {current ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <Badge>
                {current.approved ? "Approved" : "Manual review required"}
              </Badge>
              <div className="text-sm text-slate-200">{current.reason}</div>
              {current.risks.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-300">
                  {current.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-emerald-300">
                  No material risks detected.
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {current?.approved ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-primary"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Advancing to HSP settlement…
          </motion.div>
        ) : null}

        {error ? <div className="text-sm text-rose-300">{error}</div> : null}

        {current && !current.approved ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            <span className="text-sm text-amber-200">
              This receipt needs a closer look before settlement can continue.
            </span>
            <Button
              variant="secondary"
              onClick={runVerification}
              disabled={running}
            >
              {running ? "Re-checking…" : "Re-check verification"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
