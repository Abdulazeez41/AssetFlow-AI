"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-white/10",
        className,
      )}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-sky"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
