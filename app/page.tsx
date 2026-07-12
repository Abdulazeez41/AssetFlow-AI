import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Sparkles,
  Wallet,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedHero } from "@/components/shared/animated-hero";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { AnimatedBackground } from "@/components/shared/animated-background";

export default function LandingPage() {
  return (
    <div className="relative space-y-24 py-6 overflow-hidden">
      {/* Animated background orbs */}
      <AnimatedBackground />

      {/* Hero Section */}
      <div className="relative">
        <div className="relative max-w-5xl mx-auto">
          <AnimatedHero />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative">
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal delay={0.1}>
            <FeatureCard
              icon={Sparkles}
              title="Explainable Revenue Intelligence"
              description="Our settlement verifier doesn't just approve receipts—it explains why. Strict JSON outputs provide institutional-grade confidence scoring and risk flagging."
              accent="emerald"
            />
          </Reveal>
          <Reveal delay={0.2}>
            <FeatureCard
              icon={Shield}
              title="Pinned HSP Trust Anchors"
              description="We don't just trust API responses. AssetFlow uses capability-based HSP checks to cryptographically prove that settlement conditions were met before any funds move."
              accent="sky"
            />
          </Reveal>
          <Reveal delay={0.3}>
            <FeatureCard
              icon={Wallet}
              title="Autonomous On-Chain Distribution"
              description="Once Revenue and HSP verify the settlement, the RevenuePool smart contract automatically calculates and executes proportional payouts to all token holders."
              accent="amber"
            />
          </Reveal>
        </div>
      </div>

      {/* How it Works - Sequential Animation */}
      <div className="relative space-y-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Zap className="h-3.5 w-3.5" />
              The Flow
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              From receipt to payout in one continuous flow.
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              No manual accounting. No delayed wire transfers. Just verifiable,
              autonomous settlement.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-4">
          <StepCard
            step="01"
            title="Upload"
            text="Manager uploads the monthly rent receipt."
            delay={0.1}
          />
          <StepCard
            step="02"
            title="Revenue Verify"
            text="Engine checks amounts, dates, and duplicates."
            delay={0.25}
          />
          <StepCard
            step="03"
            title="HSP Anchor"
            text="Cryptographic proof of settlement capability."
            delay={0.4}
          />
          <StepCard
            step="04"
            title="Distribute"
            text="Smart contract pays 125+ investors instantly."
            delay={0.55}
            highlight
          />
        </div>

        {/* Animated stats row */}
        <Reveal delay={0.6}>
          <div className="grid gap-4 md:grid-cols-3 pt-8 border-t border-white/10">
            <StatBlock
              icon={<Users className="h-5 w-5" />}
              value={125}
              suffix="+"
              label="Token holders supported"
            />
            <StatBlock
              icon={<TrendingUp className="h-5 w-5" />}
              value={98}
              suffix="%"
              label="Revenue confidence threshold"
            />
            <StatBlock
              icon={<Zap className="h-5 w-5" />}
              value={4}
              suffix=" steps"
              label="Receipt to payout"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: any;
  title: string;
  description: string;
  accent: "emerald" | "sky" | "amber";
}) {
  const accentColors = {
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    sky: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <Card className="group h-full relative overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-primary/5 group-hover:to-sky/5 transition-all duration-500" />
      <CardContent className="relative space-y-4 p-6">
        <div
          className={`inline-flex rounded-xl border p-2.5 ${accentColors[accent]} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  title,
  text,
  delay,
  highlight,
}: {
  step: string;
  title: string;
  text: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className={`relative h-full rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 ${
          highlight
            ? "border-primary/40 bg-gradient-to-br from-primary/10 to-sky/5 hover:border-primary/60"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
        }`}
      >
        <div
          className={`mb-3 text-4xl font-bold transition-colors duration-500 ${
            highlight
              ? "text-primary"
              : "text-white/10 group-hover:text-white/20"
          }`}
        >
          {step}
        </div>
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{text}</div>
        {highlight && (
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
        )}
      </div>
    </Reveal>
  );
}

function StatBlock({
  icon,
  value,
  suffix,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            value={value}
            className="text-3xl font-semibold text-white"
          />
          <span className="text-2xl font-semibold text-primary">{suffix}</span>
        </div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
    </div>
  );
}
