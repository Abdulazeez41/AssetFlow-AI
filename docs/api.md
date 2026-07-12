# API Documentation

## `GET /api/dashboard`

Returns the dashboard snapshot for Building A, including asset state and investor preview counts.

## `POST /api/upload`

Accepts `multipart/form-data` with:

- `receipt` - PDF file
- `amount` - positive number
- `referenceId` - string
- `date` - ISO date string

Validation blocks non-PDF uploads and incomplete form data.

## `POST /api/verify`

Request body:

```json
{ "assetId": "building-a" }
```

Response returns the Revenue verification result and updated asset state.

## `POST /api/hsp/verify`

Request body:

```json
{ "assetId": "building-a" }
```

Runs HSP verification and only marks the asset as HSP Accepted when `decision.outcomeClass === "ACCEPT"`.

## `POST /api/distribution/execute`

Request body:

```json
{
  "assetId": "building-a",
  "txHash": "0x... or demo-...",
  "amountWei": "15000000000000000"
}
```

Persists the final distribution and investor ledger after AI + HSP checks pass.

## `GET /api/investors`

Returns all 125 investors.

## `GET /api/contracts`

Returns frontend-visible contract addresses from environment configuration.
