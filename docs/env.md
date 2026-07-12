# Environment Variable Guide

Required demo variables:

- `OPENROUTER_API_KEY` - optional for live AI calls, otherwise mock AI is used.
- `HSP_COORDINATOR_URL` - live HSP coordinator endpoint.
- `HSP_API_KEY` - live HSP credential.
- `HSP_PINNED_ADAPTER_ADDRESS` - pinned adapter trust anchor. Never re-fetch dynamically.
- `HASHKEY_PRIVATE_KEY` - deployment or scripted interaction signer.
- `NEXT_PUBLIC_APP_URL` - app base URL.

Additional practical variables included in `.env.example`:

- `OPENROUTER_API_URL`
- `OPENROUTER_MODEL`
- `HASHKEY_RPC_URL`
- `REVENUE_POOL_ADDRESS`
- `AI_VERIFIER_ADDRESS`
- `ASSET_TOKEN_ADDRESS`
- `NEXT_PUBLIC_REVENUE_POOL_ADDRESS`
- `NEXT_PUBLIC_AI_VERIFIER_ADDRESS`
- `NEXT_PUBLIC_ASSET_TOKEN_ADDRESS`
