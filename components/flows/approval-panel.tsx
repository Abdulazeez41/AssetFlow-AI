"use client";
import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Wallet2,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_ONCHAIN_DEPOSIT_ETH } from "@/lib/constants";
import { revenuePoolAbi } from "@/lib/abis";
import type { AssetRecord, HSPDecision } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export function ApprovalPanel({ asset }: { asset: AssetRecord }) {
  const router = useRouter();
  const [hsp, setHsp] = useState<HSPDecision | null>(asset.hspVerification);
  const [wallet, setWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("Not connected");
  const [hspLoading, setHspLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractAddress = process.env.NEXT_PUBLIC_REVENUE_POOL_ADDRESS;
  const hasExecuted = useRef(false);
  const hasRunHsp = useRef(false);

  useEffect(() => {
    if (
      asset.aiVerification?.approved &&
      !asset.hspVerification &&
      !hasRunHsp.current
    ) {
      hasRunHsp.current = true;
      void runHsp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wallet && hsp?.outcomeClass === "ACCEPT" && !hasExecuted.current) {
      hasExecuted.current = true;
      void executeDistribution();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, hsp]);

  async function connectWallet() {
    if (!window.ethereum) {
      setError(
        "No injected Web3 wallet detected. Use MetaMask or Rabby to sign the settlement.",
      );
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const provider = new BrowserProvider(window.ethereum as never);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentNetwork = await provider.getNetwork();
      setWallet(accounts[0]);
      setNetwork(`${currentNetwork.name} (${currentNetwork.chainId})`);
      await signer.getAddress();
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Wallet connection failed.",
      );
    } finally {
      setConnecting(false);
    }
  }

  async function runHsp() {
    setHspLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hsp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "HSP verification failed");
      setHsp(payload.decision);
      router.refresh();
    } catch (hspError) {
      setError(
        hspError instanceof Error
          ? hspError.message
          : "HSP verification failed",
      );
    } finally {
      setHspLoading(false);
    }
  }

  async function executeDistribution() {
    setExecuting(true);
    setError(null);
    try {
      let txHash = `settlement-${Date.now()}`;
      let amountWei = parseEther(DEMO_ONCHAIN_DEPOSIT_ETH).toString();

      if (
        window.ethereum &&
        contractAddress &&
        hsp?.outcomeClass === "ACCEPT"
      ) {
        const provider = new BrowserProvider(window.ethereum as never);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const contract = new Contract(contractAddress, revenuePoolAbi, signer);
        const cycle = Number(await contract.currentCycle());

        const attestResponse = await fetch("/api/verify/attest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: asset.id,
            cycle,
            chainId: Number(network.chainId),
            poolAddress: contractAddress,
            aiVerifierAddress: process.env.NEXT_PUBLIC_AI_VERIFIER_ADDRESS,
          }),
        });

        const attestPayload = await attestResponse.json();
        if (!attestResponse.ok)
          throw new Error(
            attestPayload.error || "Failed to obtain AI attestation",
          );

        const { attestation } = attestPayload;

        const depositTx = await contract.depositRevenue({
          value: parseEther(DEMO_ONCHAIN_DEPOSIT_ETH),
        });
        await depositTx.wait();

        const approveTx = await contract.approveDistribution(
          attestation.assetIdHash,
          attestation.confidence,
          attestation.hashValue,
          attestation.expiry,
          attestation.signature,
        );
        const receipt = await approveTx.wait();
        txHash = approveTx.hash;
        amountWei = parseEther(DEMO_ONCHAIN_DEPOSIT_ETH).toString();

        if (!receipt?.status)
          throw new Error("approveDistribution transaction failed");
      }

      const response = await fetch("/api/distribution/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id, txHash, amountWei }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Distribution persistence failed");

      router.push("/complete");
      router.refresh();
    } catch (executionError) {
      hasExecuted.current = false;
      setExecuting(false);
      setError(
        executionError instanceof Error
          ? executionError.message
          : "Distribution failed",
      );
    }
  }

  const isAccepted = useMemo(() => hsp?.outcomeClass === "ACCEPT", [hsp]);

  return (
    <div className="space-y-6">
      {/* Premium Metric Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Sparkles className="h-5 w-5" />}
          label="AI Confidence"
          value={`${asset.aiVerification?.confidence ?? 0}%`}
          subtext="Settlement verifier score"
          accent="emerald"
        />
        <MetricCard
          icon={<Wallet2 className="h-5 w-5" />}
          label="Wallet State"
          value={
            wallet
              ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "Connect wallet"
          }
          subtext={network}
          accent="sky"
        />
        <MetricCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="HSP Status"
          value={hsp?.outcomeClass || "Confirming..."}
          subtext={`Pinned: ${hsp?.adapterAddress ? `${hsp.adapterAddress.slice(0, 6)}...${hsp.adapterAddress.slice(-4)}` : "configured"}`}
          accent="amber"
          loading={hspLoading}
        />
      </div>

      {/* HSP Verification Details */}
      <AnimatePresence>
        {hsp ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sky/5 pointer-events-none" />
              <CardContent className="relative space-y-6 p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      HSP Cryptographically Verified
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      Settlement Capability Check Passed
                    </h3>
                    <p className="text-slate-300">{hsp.details}</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-400">
                      Required Capabilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hsp.requiredCapabilities.map((cap) => (
                        <div
                          key={cap}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white"
                        >
                          {cap}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-400">
                      Satisfied Capabilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hsp.satisfiedCapabilities.map((cap) => (
                        <div
                          key={cap}
                          className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300"
                        >
                          ✓ {cap}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Execution Status */}
      {executing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-4 text-primary"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">
            Signing and executing the smart contract distribution...
          </span>
        </motion.div>
      ) : null}

      {wallet && isAccepted && !executing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-4 text-emerald-300"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">
            Wallet connected - settlement is finalizing.
          </span>
        </motion.div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-6 py-4 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!wallet ? (
          <Button
            size="lg"
            variant="secondary"
            onClick={connectWallet}
            disabled={connecting || !isAccepted}
            className="group"
          >
            <Wallet2 className="mr-2 h-4 w-4" />
            {connecting
              ? "Connecting..."
              : isAccepted
                ? "Connect wallet"
                : "Waiting for HSP acceptance..."}
          </Button>
        ) : null}

        {hsp && !isAccepted ? (
          <Button
            size="lg"
            variant="secondary"
            onClick={runHsp}
            disabled={hspLoading}
          >
            {hspLoading ? "Re-checking..." : "Re-check HSP settlement"}
          </Button>
        ) : null}
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
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  accent: "emerald" | "sky" | "amber";
  loading?: boolean;
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
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </div>
      <div className="text-sm font-medium text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-white break-all">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-500 break-all">{subtext}</div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-opacity group-hover:opacity-80 opacity-0" />
    </div>
  );
}
