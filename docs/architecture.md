# Architecture Overview

AssetFlow AI uses a deliberately compact hackathon architecture:

- **Next.js App Router** serves the 6 demo screens and API routes.
- **Revenue verification service** runs inside the Next.js backend layer.
- **HSP adapter layer** applies a pinned adapter trust model and capability-based decisioning.
- **Hardhat contracts** provide the token, verification state anchor, and revenue distribution engine.
- **Local JSON storage** keeps asset, investor, and distribution state persistent enough for local demo use.

## High-level Architecture Diagram

```mermaid
flowchart LR
  U[Judge / Operator] --> F[Next.js Frontend]
  F --> API[Next.js API Routes]
  API --> AI[Revenue Verification Service]
  API --> HSP[HSP Verifier / Adapter Layer]
  API --> DB[(Local JSON Storage)]
  F --> W[Browser Wallet]
  W --> RP[RevenuePool.sol]
  RP --> AT[AssetToken.sol]
  API --> AIC[AIVerifier.sol]
```

## System Component Diagram

```mermaid
flowchart TB
  subgraph Next.js
    P1[Landing Page]
    P2[Dashboard]
    P3[Upload Revenue Proof]
    P4[Revenue Verification]
    P5[Approve Distribution]
    P6[Distribution Complete]
    R1[/api/upload]
    R2[/api/verify]
    R3[/api/hsp/verify]
    R4[/api/distribution/execute]
    R5[/api/dashboard]
  end

  subgraph Services
    S1[AI verifier service]
    S2[HSP verifier]
    S3[JSON data store]
  end

  subgraph Chain
    C1[AssetToken]
    C2[AIVerifier]
    C3[RevenuePool]
  end

  P3 --> R1 --> S3
  P4 --> R2 --> S1 --> S3
  P5 --> R3 --> S2 --> S3
  P5 --> C3
  C3 --> C1
  R4 --> S3
  R2 --> C2
```

## End-to-End Sequence Diagram

```mermaid
sequenceDiagram
  participant User
  participant UI as Next.js UI
  participant API as API Routes
  participant AI as AI Verifier
  participant HSP as HSP Adapter
  participant Wallet as Browser Wallet
  participant Pool as RevenuePool
  participant DB as JSON Store

  User->>UI: Upload receipt.pdf + amount + ref + date
  UI->>API: POST /api/upload
  API->>DB: Save proof metadata
  User->>UI: Run Revenue verification
  UI->>API: POST /api/verify
  API->>AI: Evaluate proof
  AI-->>API: {approved, confidence, reason, risks}
  API->>DB: Save AI result
  UI->>API: POST /api/hsp/verify
  API->>HSP: verify(mandate, receipt, attestations)
  HSP-->>API: outcomeClass ACCEPT/REVIEW/REJECT
  API->>DB: Save HSP result
  User->>Wallet: Connect + sign transactions
  Wallet->>Pool: depositRevenue()
  Wallet->>Pool: approveDistribution()
  UI->>API: POST /api/distribution/execute
  API->>DB: Persist investor payout ledger
  UI-->>User: Show 125 investors + tx hash
```

## Smart Contract Interaction Diagram

```mermaid
flowchart LR
  OwnerWallet -->|depositRevenue()| RevenuePool
  OwnerWallet -->|approveDistribution(hash, confidence)| RevenuePool
  Investor -->|claimReward()| RevenuePool
  RevenuePool -->|balanceOf / totalSupply| AssetToken
```

## Revenue Verification Workflow Diagram

```mermaid
flowchart TD
  Start[Receipt uploaded] --> Checks[Amount match / due date / duplicate scan]
  Checks --> Prompt[Prompt institutional financial settlement verifier]
  Prompt --> Parse[Parse strict JSON only]
  Parse --> Approved{approved?}
  Approved -->|yes| Save[Store Revenue verification state]
  Approved -->|no| Review[Display risks and manual review state]
```

## HSP Integration Flow Diagram

```mermaid
flowchart TD
  Input[Mandate + Receipt + Attestations] --> Caps[Derive satisfied capabilities]
  Caps --> Rule{requiredCapabilities subset of satisfiedCapabilities?}
  Rule -->|yes| Accept[decision.outcomeClass = ACCEPT]
  Rule -->|no| Review[decision.outcomeClass = REVIEW]
  Accept --> Proceed[Allow smart contract approval]
  Review --> Stop[Block distribution]
```
