import { DEMO_MONTHLY_REVENUE } from "@/lib/constants";
import type { AssetRecord, InvestorRecord } from "@/lib/types";

const SEED_INVESTORS: Array<{ id: string; wallet: string }> = [
  { id: "inv-001", wallet: "0xf5CFC83f83072f5E3357d5f1BD2AAdf5de9af96d" },
  { id: "inv-002", wallet: "0x3E851ffAfC9b92f63C45Cfbe7F9c5f9b66008102" },
  { id: "inv-003", wallet: "0x792A24935BC39D1719F39f902eDe26222503Fd5a" },
  { id: "inv-004", wallet: "0x3f42783BaEf09153F6D1Dba00297a68e7eF5e165" },
  { id: "inv-005", wallet: "0x4a5B2C4f8ffB1231686681F246194945d3A01EE2" },
  { id: "inv-006", wallet: "0x78050C25925D7ab485c5Df5c07Fe46c221f2b843" },
  { id: "inv-007", wallet: "0x1D72fc66f10E2492b57953102C4EB98b98B35980" },
  { id: "inv-008", wallet: "0x4DF534abb93530D7cD8834336c100d5868296581" },
  { id: "inv-009", wallet: "0xe7b46aDC267a17E597B024ef45200768478f9b83" },
  { id: "inv-010", wallet: "0x38b9dea6C1DE2e5aDD421d1A84E38F5041455096" },
];

export function buildSeedInvestors(): InvestorRecord[] {
  return SEED_INVESTORS.map((investor, index) => ({
    id: investor.id,
    name: `Investor ${String(index + 1).padStart(3, "0")}`,
    wallet: investor.wallet,
    bps: 1000,
  }));
}

export function buildSeedAsset(): AssetRecord {
  return {
    id: "building-a",
    name: "Building A",
    expectedMonthlyRent: DEMO_MONTHLY_REVENUE,
    displayAmount: 15000,
    monthlyRentLabel: "$1",
    status: "Waiting",
    dueDate: "2026-07-05",
    proof: null,
    aiVerification: null,
    hspVerification: null,
    distribution: null,
  };
}
