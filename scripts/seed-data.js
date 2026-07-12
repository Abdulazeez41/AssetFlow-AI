const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });

const investors = [
  {
    id: "inv-001",
    name: "Blackstone Capital Partners",
    wallet: "0xf5CFC83f83072f5E3357d5f1BD2AAdf5de9af96d",
    bps: 1800,
  },
  {
    id: "inv-002",
    name: "Vanguard Real Estate Fund",
    wallet: "0x3E851ffAfC9b92f63C45Cfbe7F9c5f9b66008102",
    bps: 1500,
  },
  {
    id: "inv-003",
    name: "Brookfield Asset Management",
    wallet: "0x792A24935BC39D1719F39f902eDe26222503Fd5a",
    bps: 1200,
  },
  {
    id: "inv-004",
    name: "CBRE Investment Trust",
    wallet: "0x3f42783BaEf09153F6D1Dba00297a68e7eF5e165",
    bps: 1000,
  },
  {
    id: "inv-005",
    name: "JLL Capital Advisors",
    wallet: "0x4a5B2C4f8ffB1231686681F246194945d3A01EE2",
    bps: 900,
  },
  {
    id: "inv-006",
    name: "Greenfield Holdings LLC",
    wallet: "0x78050C25925D7ab485c5Df5c07Fe46c221f2b843",
    bps: 700,
  },
  {
    id: "inv-007",
    name: "Meridian Property Group",
    wallet: "0x1D72fc66f10E2492b57953102C4EB98b98B35980",
    bps: 600,
  },
  {
    id: "inv-008",
    name: "Summit Real Estate Ventures",
    wallet: "0x4DF534abb93530D7cD8834336c100d5868296581",
    bps: 500,
  },
  {
    id: "inv-009",
    name: "Pacific Coast Investments",
    wallet: "0xe7b46aDC267a17E597B024ef45200768478f9b83",
    bps: 400,
  },
  {
    id: "inv-010",
    name: "Atlantic Capital Partners",
    wallet: "0x38b9dea6C1DE2e5aDD421d1A84E38F5041455096",
    bps: 400,
  },
];

const asset = {
  id: "building-a",
  name: "Building A",
  expectedMonthlyRent: 1,
  monthlyRentLabel: "$15,000",
  status: "Waiting",
  dueDate: "2026-07-05",
  proof: null,
  aiVerification: null,
  hspVerification: null,
  distribution: null,
};

fs.writeFileSync(
  path.join(dataDir, "assets.json"),
  JSON.stringify({ assets: [asset] }, null, 2),
);
fs.writeFileSync(
  path.join(dataDir, "investors.json"),
  JSON.stringify({ investors }, null, 2),
);
fs.writeFileSync(
  path.join(dataDir, "distributions.json"),
  JSON.stringify({ distributions: [] }, null, 2),
);
console.log(
  "Seed data written: 10 investors with realistic names and varied share distributions.",
);
