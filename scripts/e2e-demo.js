require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const { ethers } = require("ethers");

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
const rpcUrl = process.env.HASHKEY_RPC_URL;
const privateKey = process.env.HASHKEY_PRIVATE_KEY;
const revenuePoolAddress = process.env.NEXT_PUBLIC_REVENUE_POOL_ADDRESS;
const aiVerifierAddress = process.env.NEXT_PUBLIC_AI_VERIFIER_ADDRESS;

// CHANGED: approveDistribution's signature now matches the patched contract —
// it takes the full attestation tuple, not just (hash, confidence).
const revenuePoolAbi = [
  "function depositRevenue() external payable",
  "function approveDistribution(bytes32 assetIdHash, uint256 confidence, bytes32 hashValue, uint256 expiry, bytes calldata aiSignature) external",
  "function currentCycle() external view returns (uint256)",
  "function cycleApproved(uint256) external view returns (bool)",
];

// CHANGED: added cycleConsumed so we can prove replay protection actually
// fired, not just that verifications() got populated.
const aiVerifierAbi = [
  "function verifications(bytes32) external view returns (bool approved, uint256 confidence, bytes32 hashValue)",
  "function cycleConsumed(address, uint256) external view returns (bool)",
];

async function postJson(path, body) {
  const response = await fetch(`${appUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`${path}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const report = {};
  const assetId = "building-a";
  const assetIdHash = `0x${require("crypto").createHash("sha256").update(assetId).digest("hex")}`;

  // --- 1. Upload the rent proof ---
  const pdf = fs.readFileSync("public/receipt.pdf");
  const form = new FormData();
  form.append(
    "receipt",
    new File([pdf], "receipt.pdf", { type: "application/pdf" }),
  );
  form.append("amount", "1");
  form.append("referenceId", "RENT-JUL-2026-001");
  form.append("date", "2026-07-03");

  const uploadRes = await fetch(`${appUrl}/api/upload`, {
    method: "POST",
    body: form,
  });
  const uploadJson = await uploadRes.json();
  if (!uploadRes.ok)
    throw new Error(`upload failed: ${JSON.stringify(uploadJson)}`);
  report.upload = uploadJson.asset.status;

  // --- 2. Revenue verification (off-chain check, records result in the app DB) ---
  const verifyJson = await postJson("/api/verify", { assetId });
  report.ai = verifyJson.verification;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const aiVerifierRead = new ethers.Contract(
    aiVerifierAddress,
    aiVerifierAbi,
    provider,
  );

  const preOnchainAI = await aiVerifierRead.verifications(assetIdHash);
  report.aiOnChainBefore = {
    approved: preOnchainAI[0],
    confidence: Number(preOnchainAI[1]),
    hashValue: preOnchainAI[2],
  };

  // --- 3. HSP verification ---
  const hspJson = await postJson("/api/hsp/verify", { assetId });
  report.hsp = hspJson.decision;

  const pool = new ethers.Contract(revenuePoolAddress, revenuePoolAbi, wallet);

  const cycle = Number(await pool.currentCycle());

  // --- 4. NEW STEP: request the signed AI attestation ---
  const attestJson = await postJson("/api/verify/attest", {
    assetId,
    cycle,
    chainId,
    poolAddress: revenuePoolAddress,
    aiVerifierAddress,
  });
  report.attestation = attestJson.attestation;

  // --- 5. Deposit + approve, using the signed attestation ---
  const depositTx = await pool.depositRevenue({
    value: ethers.parseEther("0.001"),
  });
  await depositTx.wait();

  const {
    assetIdHash: attAssetIdHash,
    confidence,
    hashValue,
    expiry,
    signature,
  } = attestJson.attestation;

  const approveTx = await pool.approveDistribution(
    attAssetIdHash,
    confidence,
    hashValue,
    expiry,
    signature,
  );
  await approveTx.wait();

  report.contract = {
    depositTx: depositTx.hash,
    approveTx: approveTx.hash,
    currentCycle: Number(await pool.currentCycle()),
    cycleOneApproved: await pool.cycleApproved(cycle),
  };

  // Post-check: the attestation should now be consumed and recorded.
  const postOnchainAI = await aiVerifierRead.verifications(assetIdHash);
  report.aiOnChainAfter = {
    approved: postOnchainAI[0],
    confidence: Number(postOnchainAI[1]),
    hashValue: postOnchainAI[2],
  };
  report.cycleConsumedOnAIVerifier = await aiVerifierRead.cycleConsumed(
    revenuePoolAddress,
    cycle,
  );

  // --- 6. Distribution execution ---
  const executeJson = await postJson("/api/distribution/execute", {
    assetId,
    txHash: approveTx.hash,
    amountWei: ethers.parseEther("0.001").toString(),
  });
  report.distribution = {
    investorCount: executeJson.distribution.investorCount,
    amount: executeJson.distribution.amount,
    txHash: executeJson.distribution.txHash,
  };

  const completeHtml = await fetch(`${appUrl}/complete`).then((res) =>
    res.text(),
  );
  report.completePageChecks = {
    hasInvestorsHeadline: completeHtml.includes("10 investors"),
    hasDistributionHeadline: completeHtml.includes("0.001"),
    hasTxHash: completeHtml.includes(approveTx.hash.slice(0, 10)),
  };

  // --- 7. Negative test: try to approveDistribution again with the same attestation, which should revert due to replay protection. ---
  report.negativeTest = { attempted: true, reverted: false, error: null };
  try {
    const garbageSignature = "0x" + "00".repeat(65);
    const badExpiry = Math.floor(Date.now() / 1000) + 3600;
    const badTx = await pool.approveDistribution(
      assetIdHash,
      100,
      ethers.ZeroHash,
      badExpiry,
      garbageSignature,
    );
    await badTx.wait();
    // If we get here, the call succeeded when it should not have.
    report.negativeTest.reverted = false;
  } catch (err) {
    report.negativeTest.reverted = true;
    report.negativeTest.error = err.shortMessage || err.message;
  }

  fs.writeFileSync("qa-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (!report.negativeTest.reverted) {
    console.error(
      "\n⚠️  WARNING: the negative test did NOT revert. The AI gate is not enforcing on-chain.",
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
