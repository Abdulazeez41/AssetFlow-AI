export const revenuePoolAbi = [
  "function depositRevenue() external payable",
  "function approveDistribution(bytes32 assetIdHash, uint256 confidence, bytes32 hashValue, uint256 expiry, bytes calldata aiSignature) external",
  "function currentCycle() external view returns (uint256)",
  "function pendingRevenue() external view returns (uint256)",
  "function cycleRevenue(uint256) external view returns (uint256)",
  "function cycleApproved(uint256) external view returns (bool)",
  "event RevenueDeposited(uint256 indexed cycle, uint256 amount)",
  "event DistributionApproved(uint256 indexed cycle, bytes32 indexed verificationHash, uint256 confidence, uint256 amount)",
  "event RewardClaimed(uint256 indexed cycle, address indexed investor, uint256 amount)",
];
