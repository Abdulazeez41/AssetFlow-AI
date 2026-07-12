const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

function loadInvestors() {
  const payload = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data", "investors.json"),
      "utf-8",
    ),
  );
  return payload.investors;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const AI_SIGNER_ADDRESS = process.env.AI_SIGNER_ADDRESS;
  if (!AI_SIGNER_ADDRESS) {
    throw new Error(
      "Set AI_SIGNER_ADDRESS in your environment before deploying — see the note below.",
    );
  }

  const AssetToken = await ethers.getContractFactory("AssetToken");
  const AIVerifier = await ethers.getContractFactory("AIVerifier");
  const RevenuePool = await ethers.getContractFactory("RevenuePool");

  const assetToken = await AssetToken.deploy(deployer.address);
  await assetToken.waitForDeployment();

  // AIVerifier now needs (owner, aiSigner) — aiSigner is a SEPARATE key from
  // deployer, held by your Revenue verification backend, never used to send txs.
  const aiVerifier = await AIVerifier.deploy(
    deployer.address,
    AI_SIGNER_ADDRESS,
  );
  await aiVerifier.waitForDeployment();

  // RevenuePool now needs the AIVerifier address at construction time.
  const revenuePool = await RevenuePool.deploy(
    await assetToken.getAddress(),
    await aiVerifier.getAddress(),
    deployer.address,
  );
  await revenuePool.waitForDeployment();

  // REQUIRED: tell AIVerifier this specific pool is allowed to consume
  // attestations. Without this line, every approveDistribution() call
  // reverts with "pool not approved" — this is the step most likely to
  // get missed since nothing about a missing whitelist entry is obvious
  // until you try to actually run a distribution.
  const approvalTx = await aiVerifier.setPoolApproval(
    await revenuePool.getAddress(),
    true,
  );
  await approvalTx.wait();

  const investors = loadInvestors();
  for (const investor of investors) {
    const tx = await assetToken.mint(
      investor.wallet,
      ethers.parseUnits("80", 18),
    );
    await tx.wait();
  }

  const output = {
    network: hre.network.name,
    assetToken: await assetToken.getAddress(),
    aiVerifier: await aiVerifier.getAddress(),
    revenuePool: await revenuePool.getAddress(),
    deployer: deployer.address,
    aiSigner: AI_SIGNER_ADDRESS,
  };

  fs.mkdirSync(path.join(process.cwd(), "deployments"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "deployments", `${hre.network.name}.json`),
    JSON.stringify(output, null, 2),
  );
  console.log(output);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
