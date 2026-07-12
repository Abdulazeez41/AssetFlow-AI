// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAssetToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

interface IAIVerifier {
    function verifyAndConsume(
        address pool,
        uint256 cycle,
        bytes32 assetIdHash,
        bool approved,
        uint256 confidence,
        bytes32 hashValue,
        uint256 expiry,
        bytes calldata signature
    ) external returns (bool);
}

contract RevenuePool is Ownable, ReentrancyGuard {
    IAssetToken public immutable assetToken;
    IAIVerifier public aiVerifier;

    uint256 public currentCycle;
    uint256 public pendingRevenue;

    mapping(uint256 => uint256) public cycleRevenue;
    mapping(uint256 => bool) public cycleApproved;
    mapping(uint256 => bytes32) public cycleVerificationHash;
    mapping(uint256 => uint256) public cycleConfidence;
    mapping(uint256 => mapping(address => uint256)) public claimedByCycle;

    event RevenueDeposited(uint256 indexed cycle, uint256 amount);
    event DistributionApproved(uint256 indexed cycle, bytes32 indexed verificationHash, uint256 confidence, uint256 amount);
    event RewardClaimed(uint256 indexed cycle, address indexed investor, uint256 amount);
    event AIVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    constructor(address assetTokenAddress, address aiVerifierAddress, address initialOwner) Ownable(initialOwner) {
        require(assetTokenAddress != address(0), "asset token required");
        require(aiVerifierAddress != address(0), "ai verifier required");
        assetToken = IAssetToken(assetTokenAddress);
        aiVerifier = IAIVerifier(aiVerifierAddress);
        currentCycle = 1;
    }

    /// @notice Allows rotating the verifier (e.g. re-pointing at an upgraded
    ///         AIVerifier). Owner-gated - pair with a timelock in production.
    function setAIVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "zero verifier");
        emit AIVerifierUpdated(address(aiVerifier), newVerifier);
        aiVerifier = IAIVerifier(newVerifier);
    }

    function depositRevenue() external payable onlyOwner {
        require(msg.value > 0, "revenue required");
        pendingRevenue += msg.value;
        emit RevenueDeposited(currentCycle, msg.value);
    }

    /// @notice Approves the current cycle's pending revenue for distribution.
    ///         `assetIdHash` and `hashValue`/`confidence` must match exactly
    ///         what the AI service signed off-chain - any mismatch causes
    ///         AIVerifier to revert (invalid signature), which reverts this
    ///         whole call. This function is still onlyOwner (the pool owner
    ///         is the only one who can *submit* a distribution), but the
    ///         actual authority to approve now lives in the AI signature,
    ///         not in the owner key.
    function approveDistribution(
        bytes32 assetIdHash,
        uint256 confidence,
        bytes32 hashValue,
        uint256 expiry,
        bytes calldata aiSignature
    ) external onlyOwner {
        require(pendingRevenue > 0, "no pending revenue");
        require(!cycleApproved[currentCycle], "cycle already approved");

        bool ok = aiVerifier.verifyAndConsume(
            address(this),
            currentCycle,
            assetIdHash,
            true, // approved - verifyAndConsume itself also requires this to be true
            confidence,
            hashValue,
            expiry,
            aiSignature
        );
        require(ok, "AI attestation rejected");

        cycleRevenue[currentCycle] = pendingRevenue;
        cycleApproved[currentCycle] = true;
        cycleVerificationHash[currentCycle] = hashValue;
        cycleConfidence[currentCycle] = confidence;

        emit DistributionApproved(currentCycle, hashValue, confidence, pendingRevenue);

        pendingRevenue = 0;
        currentCycle += 1;
    }

    function claimReward(uint256 cycle) public nonReentrant {
        require(cycleApproved[cycle], "cycle not approved");
        require(cycleRevenue[cycle] > 0, "empty cycle");

        uint256 balance = assetToken.balanceOf(msg.sender);
        require(balance > 0, "no token balance");

        uint256 totalSupply = assetToken.totalSupply();
        require(totalSupply > 0, "zero supply");

        uint256 entitled = (cycleRevenue[cycle] * balance) / totalSupply;
        uint256 claimed = claimedByCycle[cycle][msg.sender];
        require(entitled > claimed, "nothing claimable");

        uint256 payout = entitled - claimed;
        claimedByCycle[cycle][msg.sender] = entitled;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "transfer failed");

        emit RewardClaimed(cycle, msg.sender, payout);
    }

    function claimReward() external {
        claimReward(currentCycle - 1);
    }
}
