# Installation & Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- MetaMask or another injected wallet for live contract signing

## Install

```bash
npm install
cp .env.example .env.local
npm run seed
```

## Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Enable live smart contract signing

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npm run contracts:deploy:local
```

Copy contract addresses from `deployments/localhost.json` into `.env.local`.

## Optional AI configuration

Set:

- `OPENROUTER_API_KEY`
- `OPENROUTER_API_URL`
- `OPENROUTER_MODEL`

If omitted, the app uses deterministic mock verification logic so the demo still works.

## Optional HSP configuration

Set:

- `HSP_COORDINATOR_URL`
- `HSP_API_KEY`
- `HSP_PINNED_ADAPTER_ADDRESS`

If omitted or unreachable, the app falls back to the mock HSP adapter while preserving the same interface.
