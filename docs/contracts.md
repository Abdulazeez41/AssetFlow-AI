# Smart Contract Documentation

## 1. `AssetToken.sol`

A simple mock ERC20 representing tokenized ownership in Building A.

### Responsibilities

- Mint demo ownership balances to seeded investors.
- Provide `balanceOf()` and `totalSupply()` for payout calculations.

## 2. `AIVerifier.sol`

Stores the minimal AI verification state on-chain.

### Stored fields

- `approved` (`bool`)
- `confidence` (`uint256`)
- `hashValue` (`bytes32`)

### Security

- `onlyOwner` on verification storage.
- Confidence capped at `<= 100`.

## 3. `RevenuePool.sol`

Distribution engine handling revenue intake, approval, and investor claims.

### Required functions

- `depositRevenue()` - accepts payable revenue from the owner.
- `approveDistribution(bytes32,uint256)` - locks the current cycle, stores verification metadata, and advances the cycle.
- `claimReward()` - allows token holders to claim their share for the latest approved cycle.

### Security review

- `onlyOwner` on funding and approval actions.
- `ReentrancyGuard` on reward claims.
- Checks-effects-interactions pattern before transferring ETH.
- Confidence capped at `<= 100`.
- Approval blocked when no pending revenue exists.
