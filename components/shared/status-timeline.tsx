"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  "Upload",
  "Revenue Intelligence",
  "HSP Settlement",
  "Approve",
  "Complete",
];

export function StatusTimeline({ current }: { current: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => {
        const active = index <= current;
        const isCurrent = index === current;
        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border px-4 py-3 text-sm",
              active
                ? "border-primary bg-primary/10 text-white"
                : "border-white/10 bg-white/5 text-slate-400",
            )}
          >
            {isCurrent ? (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-sky/10 to-primary/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            ) : null}
            <div className="relative font-medium">{step}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
