"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ScanState = "idle" | "scanning" | "filled" | "error";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [amount, setAmount] = useState(""); // Empty initially
  const [referenceId, setReferenceId] = useState(""); // Empty initially
  const [date, setDate] = useState(""); // Empty initially
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanSummary, setScanSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setScanState("scanning");

    // Clear fields when starting a new scan
    setAmount("");
    setReferenceId("");
    setDate("");

    try {
      const scanForm = new FormData();
      scanForm.append("receipt", file);

      const response = await fetch("/api/upload/scan", {
        method: "POST",
        body: scanForm,
      });

      const payload = await response.json();

      if (!response.ok)
        throw new Error(payload.error || "Could not read the document.");

      // Populate fields with extracted data
      setAmount(String(payload.scanned.amount));
      setReferenceId(payload.scanned.referenceId);
      setDate(payload.scanned.date);
      setScanSummary(payload.scanned.summary);
      setScanState("filled");
    } catch (scanError) {
      setScanState("error");
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Could not read the document.",
      );
    }
  }

  async function onSubmit() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Attach the receipt file before saving.");
      return;
    }

    if (!amount || !referenceId || !date) {
      setError(
        "Please wait for the document scan to complete or fill in all fields manually.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("amount", amount);
      formData.append("referenceId", referenceId);
      formData.append("date", date);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Upload failed");

      router.push("/verification");
      router.refresh();
    } catch (submissionError) {
      setSaving(false);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Upload failed",
      );
    }
  }

  const isScanning = scanState === "scanning";
  const isFilled = scanState === "filled";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary" />
          Settlement Receipt
        </CardTitle>
        <CardDescription>
          Upload the PDF receipt and our engine will automatically extract the
          settlement details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enhanced file upload area */}
          <div>
            <Label htmlFor="receipt">Receipt Document</Label>
            <label
              htmlFor="receipt"
              className="group mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-8 transition hover:border-primary/60 hover:bg-primary/5"
            >
              <motion.div
                animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isScanning
                    ? { duration: 1.4, repeat: Infinity, ease: "linear" }
                    : {}
                }
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"
              >
                {isScanning ? (
                  <Sparkles className="h-6 w-6" />
                ) : fileName ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-medium text-white">
                  {fileName || "Click to upload or drag and drop"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {isScanning
                    ? "Extracting settlement data..."
                    : fileName
                      ? "Receipt ready for submission"
                      : "PDF format, up to 10MB"}
                </div>
              </div>
              <Input
                ref={fileInputRef}
                id="receipt"
                name="receipt"
                type="file"
                accept=".pdf"
                required
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Scan summary alert */}
          <AnimatePresence>
            {scanSummary ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-emerald-200"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{scanSummary}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Form fields - now with empty initial state */}
          <div className="grid gap-5 md:grid-cols-2">
            <motion.div
              initial={false}
              animate={{ opacity: isScanning ? 0.5 : 1 }}
            >
              <Label htmlFor="amount">Settlement Amount (USD)</Label>
              <div className="relative mt-2">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={isScanning}
                  placeholder={
                    isScanning ? "Extracting..." : "Amount will appear here"
                  }
                  className={isFilled ? "border-primary/50 bg-primary/5" : ""}
                />
                {isScanning && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
                {isFilled && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: isScanning ? 0.5 : 1 }}
            >
              <Label htmlFor="referenceId">Reference ID</Label>
              <div className="relative mt-2">
                <Input
                  id="referenceId"
                  name="referenceId"
                  required
                  value={referenceId}
                  onChange={(event) => setReferenceId(event.target.value)}
                  disabled={isScanning}
                  placeholder={
                    isScanning
                      ? "Extracting..."
                      : "Reference ID will appear here"
                  }
                  className={isFilled ? "border-primary/50 bg-primary/5" : ""}
                />
                {isScanning && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
                {isFilled && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: isScanning ? 0.5 : 1 }}
              className="md:col-span-2"
            >
              <Label htmlFor="date">Settlement Date</Label>
              <div className="relative mt-2">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  disabled={isScanning}
                  className={isFilled ? "border-primary/50 bg-primary/5" : ""}
                />
                {isScanning && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
                {isFilled && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
            </motion.div>
          </div>

          {/* Error message */}
          {error ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          {/* Submit button */}
          <Button
            className="w-full"
            size="lg"
            disabled={
              saving ||
              isScanning ||
              !fileName ||
              !amount ||
              !referenceId ||
              !date
            }
            onClick={onSubmit}
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Processing...
              </>
            ) : (
              "Save Revenue Proof"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
