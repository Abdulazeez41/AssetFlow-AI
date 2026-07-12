// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract AIVerifier is Ownable, EIP712 {
    using ECDSA for bytes32;

    struct VerificationState {
        bool approved;
        uint256 confidence;
        bytes32 hashValue;
    }

    /// @notice The address whose signature is trusted to approve distributions.
    ///         Held by the Revenue verification service (see lib/ai-signature.ts) -
    ///         this key never needs gas and never sends transactions, it only
    ///         signs. Keep it separate from the deployer/owner key.
    address public aiSigner;

    /// @notice Which RevenuePool contracts are allowed to consume attestations.
    ///         Prevents an unrelated contract from burning a cycle that
    ///         belongs to the real pool.
    mapping(address => bool) public approvedPools;

    /// @notice pool => cycle => already consumed (replay protection).
    mapping(address => mapping(uint256 => bool)) public cycleConsumed;

    /// @notice Kept for read compatibility with the existing dashboard UI -
    ///         populated automatically as a side effect of a successful
    ///         verifyAndConsume() call. Not itself a source of authority.
    mapping(bytes32 => VerificationState) public verifications;

    bytes32 private constant ATTESTATION_TYPEHASH = keccak256(
        "VerificationAttestation(address pool,uint256 cycle,bytes32 assetIdHash,bool approved,uint256 confidence,bytes32 hashValue,uint256 expiry)"
    );

    event AISignerUpdated(address indexed oldSigner, address indexed newSigner);
    event PoolApprovalUpdated(address indexed pool, bool approved);
    event VerificationStored(bytes32 indexed assetIdHash, bool approved, uint256 confidence, bytes32 hashValue);
    event AttestationConsumed(address indexed pool, uint256 indexed cycle, bytes32 indexed assetIdHash);

    constructor(address initialOwner, address _aiSigner)
        Ownable(initialOwner)
        EIP712("AssetFlowAIVerifier", "1")
    {
        require(_aiSigner != address(0), "zero signer");
        aiSigner = _aiSigner;
        emit AISignerUpdated(address(0), _aiSigner);
    }

    modifier onlyApprovedPool() {
        require(approvedPools[msg.sender], "pool not approved");
        _;
    }

    /// @notice Rotate the trusted AI signing key. Owner-gated - in production
    ///         this should sit behind a timelock/multisig, not a hot key.
    function setAISigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "zero signer");
        emit AISignerUpdated(aiSigner, newSigner);
        aiSigner = newSigner;
    }

    /// @notice Whitelist a RevenuePool contract allowed to consume attestations.
    function setPoolApproval(address pool, bool approved) external onlyOwner {
        approvedPools[pool] = approved;
        emit PoolApprovalUpdated(pool, approved);
    }

    /// @notice Returns the exact EIP-712 digest the AI service must sign.
    ///         Exposed so the backend can independently reproduce it for
    ///         testing before ever sending a transaction.
    function hashAttestation(
        address pool,
        uint256 cycle,
        bytes32 assetIdHash,
        bool approved,
        uint256 confidence,
        bytes32 hashValue,
        uint256 expiry
    ) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(ATTESTATION_TYPEHASH, pool, cycle, assetIdHash, approved, confidence, hashValue, expiry)
        );
        return _hashTypedDataV4(structHash);
    }

    /// @notice The only way a distribution can be authorized. Reverts on any
    ///         failure - RevenuePool.approveDistribution() calls this and
    ///         will revert along with it if the attestation is invalid,
    ///         expired, already used, or not actually approved.
    function verifyAndConsume(
        address pool,
        uint256 cycle,
        bytes32 assetIdHash,
        bool approved,
        uint256 confidence,
        bytes32 hashValue,
        uint256 expiry,
        bytes calldata signature
    ) external onlyApprovedPool returns (bool) {
        require(pool == msg.sender, "pool mismatch");
        require(block.timestamp <= expiry, "attestation expired");
        require(!cycleConsumed[pool][cycle], "cycle already consumed");
        require(confidence <= 100, "confidence > 100");
        require(approved, "AI did not approve this settlement");

        bytes32 digest = hashAttestation(pool, cycle, assetIdHash, approved, confidence, hashValue, expiry);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == aiSigner, "invalid AI signature");

        cycleConsumed[pool][cycle] = true;
        verifications[assetIdHash] = VerificationState({approved: approved, confidence: confidence, hashValue: hashValue});

        emit VerificationStored(assetIdHash, approved, confidence, hashValue);
        emit AttestationConsumed(pool, cycle, assetIdHash);
        return true;
    }
}
