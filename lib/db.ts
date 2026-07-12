import { promises as fs } from 'fs';
import path from 'path';
import { buildSeedAsset, buildSeedInvestors } from '@/lib/seed';
import type { AssetRecord, DistributionRecord, InvestorRecord } from '@/lib/types';

const dataDir = path.join(process.cwd(), 'data');
const assetsFile = path.join(dataDir, 'assets.json');
const investorsFile = path.join(dataDir, 'investors.json');
const distributionsFile = path.join(dataDir, 'distributions.json');

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function ensureFile<T>(filePath: string, initialData: T) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
  }
}

export async function ensureSeedData() {
  await ensureDir();
  await ensureFile(assetsFile, { assets: [buildSeedAsset()] });
  await ensureFile(investorsFile, { investors: buildSeedInvestors() });
  await ensureFile(distributionsFile, { distributions: [] });
}

async function readJson<T>(filePath: string): Promise<T> {
  await ensureSeedData();
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function writeJson(filePath: string, data: unknown) {
  await ensureSeedData();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function getAsset(assetId: string): Promise<AssetRecord> {
  const payload = await readJson<{ assets: AssetRecord[] }>(assetsFile);
  const asset = payload.assets.find((item) => item.id === assetId);
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }
  return asset;
}

export async function saveAsset(nextAsset: AssetRecord) {
  const payload = await readJson<{ assets: AssetRecord[] }>(assetsFile);
  const assets = payload.assets.map((asset) => (asset.id === nextAsset.id ? nextAsset : asset));
  await writeJson(assetsFile, { assets });
  return nextAsset;
}

export async function getInvestors(): Promise<InvestorRecord[]> {
  const payload = await readJson<{ investors: InvestorRecord[] }>(investorsFile);
  return payload.investors;
}

export async function getDistributions(): Promise<DistributionRecord[]> {
  const payload = await readJson<{ distributions: DistributionRecord[] }>(distributionsFile);
  return payload.distributions;
}

export async function saveDistribution(record: DistributionRecord) {
  const payload = await readJson<{ distributions: DistributionRecord[] }>(distributionsFile);
  const existing = payload.distributions.filter((item) => item.id !== record.id);
  const distributions = [record, ...existing];
  await writeJson(distributionsFile, { distributions });
  return record;
}

export async function resetSeedData() {
  await ensureDir();
  await writeJson(assetsFile, { assets: [buildSeedAsset()] });
  await writeJson(investorsFile, { investors: buildSeedInvestors() });
  await writeJson(distributionsFile, { distributions: [] });
}
