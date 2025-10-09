// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ETH Bridge for PushPredict
 * @dev Bridge ETH from Ethereum Sepolia to PC on Push Network
 */
contract ETHBridge is Ownable, ReentrancyGuard {
    
    // Events
    event BridgeInitiated(
        address indexed user,
        uint256 ethAmount,
        uint256 pcAmount,
        string pushAddress,
        bytes32 indexed bridgeId
    );
    
    event BridgeCompleted(
        bytes32 indexed bridgeId,
        string txHash
    );
    
    // Bridge requests
    struct BridgeRequest {
        address user;
        uint256 ethAmount;
        uint256 pcAmount;
        string pushAddress;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    
    // ETH to PC conversion rate (1 ETH = 1000 PC for simplicity)
    uint256 public constant ETH_TO_PC_RATE = 1000;
    
    // Minimum bridge amount (0.001 ETH)
    uint256 public constant MIN_BRIDGE_AMOUNT = 0.001 ether;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Initiate bridge from ETH to PC
     * @param pushAddress The Push Network address to receive PC
     * @param marketId Market ID for the bet
     * @param option Bet option (0 or 1)
     */
    function bridgeForBet(
        string memory pushAddress,
        uint256 marketId,
        uint8 option
    ) external payable nonReentrant {
        require(msg.value >= MIN_BRIDGE_AMOUNT, "Amount too low");
        require(bytes(pushAddress).length > 0, "Invalid Push address");
        
        // Calculate PC amount
        uint256 pcAmount = (msg.value * ETH_TO_PC_RATE) / 1 ether;
        
        // Generate unique bridge ID
        bytes32 bridgeId = keccak256(abi.encodePacked(
            msg.sender,
            msg.value,
            pushAddress,
            marketId,
            option,
            block.timestamp
        ));
        
        // Store bridge request
        bridgeRequests[bridgeId] = BridgeRequest({
            user: msg.sender,
            ethAmount: msg.value,
            pcAmount: pcAmount,
            pushAddress: pushAddress,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit BridgeInitiated(
            msg.sender,
            msg.value,
            pcAmount,
            pushAddress,
            bridgeId
        );
    }
    
    /**
     * @dev Complete bridge (called by backend after PC transfer)
     * @param bridgeId The bridge request ID
     * @param pushTxHash Transaction hash on Push Network
     */
    function completeBridge(
        bytes32 bridgeId,
        string memory pushTxHash
    ) external onlyOwner {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.user != address(0), "Bridge request not found");
        require(!request.completed, "Bridge already completed");
        
        request.completed = true;
        
        emit BridgeCompleted(bridgeId, pushTxHash);
    }
    
    /**
     * @dev Withdraw collected ETH (for liquidity management)
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Get bridge request details
     */
    function getBridgeRequest(bytes32 bridgeId) external view returns (BridgeRequest memory) {
        return bridgeRequests[bridgeId];
    }
    
    /**
     * @dev Calculate PC amount for given ETH
     */
    function calculatePCAmount(uint256 ethAmount) external pure returns (uint256) {
        return (ethAmount * ETH_TO_PC_RATE) / 1 ether;
    }
}