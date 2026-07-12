# Demo Guide for Judges

## Scripted flow

1. Open the **Landing Page**.
2. Go to **Dashboard** and show Building A, monthly rent $15,000, status Waiting.
3. Open **Upload Revenue Proof** and upload `receipt.pdf` with the seeded form values.
4. On **Revenue Verification**, run the settlement verifier and show the explainable JSON-backed analysis.
5. On **Approve Distribution**, show the **HSP Cryptographically Verified** badge.
6. Connect the wallet and click **Execute Smart Contract Distribution**.
7. Open **Distribution Complete / Investor View** and show `125 investors, $15,000 distributed`, the transaction hash, and the investor allocation list.

## Demo tips

- If live OpenAI access is unavailable, the mock AI verifier still returns the exact required schema.
- If live HSP access is unavailable, the mock HSP adapter preserves the same interface and capability rule.
- If no browser wallet is connected, the UI still supports a safe demo fallback so the flow remains unbroken.
