"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-400">{label}</div>
          <div className="text-3xl font-semibold text-white">{value}</div>
          <div className="text-sm text-slate-300">{hint}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
