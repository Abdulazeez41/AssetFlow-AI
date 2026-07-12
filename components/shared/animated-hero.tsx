"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroWords = ["Automate", "trust.", "", "Distribute", "yield."];

export function AnimatedHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-primary/5 p-10 md:p-16">
      {/* Animated glow orbs */}
      <motion.div
        className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-sky/20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-4xl space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="h-3.5 w-3.5" />
          </motion.div>
          Next-Generation RWA Infrastructure
        </motion.div>

        {/* Staggered headline */}
        <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
          {heroWords.map((word, i) =>
            word === "" ? (
              <br key={i} />
            ) : (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + i * 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={
                  i >= 3
                    ? "inline-block bg-gradient-to-r from-primary to-sky bg-clip-text text-transparent"
                    : "inline-block mr-3"
                }
              >
                {word}
              </motion.span>
            ),
          )}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="max-w-2xl text-xl text-slate-300"
        >
          The autonomous settlement engine for tokenized real estate. AssetFlow
          AI bridges off-chain rent collection and on-chain investor payouts
          using explainable Revenue verification and cryptographic HSP anchors.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="flex flex-wrap gap-4 pt-4"
        >
          <Link href="/dashboard">
            <Button className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                Launch App Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="secondary">
              View Live Demo
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
