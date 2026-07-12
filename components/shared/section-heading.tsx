"use client";

import { motion } from "framer-motion";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mb-8 max-w-3xl"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        {eyebrow}
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-slate-300">{description}</p>
    </motion.div>
  );
}
