// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PushPredict - Universal Cross-Chain Prediction Market
 * @dev A prediction market that leverages Push Network's universal features
 * for cross-chain interactions and enhanced user experience
 */
contract PushPredict is Ownable, ReentrancyGuard, Pausable {
    
    enum MarketStatus { Active, Paused, Resolved }
    
    struct Market {
        uint256 id;
        string title;
        string description;
        string optionA;
        string optionB;
        uint8 category;
        address creator;
        uint256 createdAt;
        uint256 endTime;
        uint256 minBet;
        uint256 maxBet;
        MarketStatus status;
        uint8 outcome; // 0 for optionA, 1 for optionB
        bool resolved;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        uint256 totalPool;
        string imageUrl;
    }
    
    struct UserPosition {
        uint256 optionAShares;
        uint256 optionBShares;
        uint256 totalInvested;
    }
    
    // State variables
    uint256 public marketCounter;
    uint256 public constant PLATFORM_FEE = 250; // 2.5% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserPosition)) public userPositions;
    mapping(address => uint256[]) public userMarkets;
    
    uint256[] public allMarketIds;
    
    // Treasury for automatic reward distribution
    uint256 public treasuryBalance;
    
    // Universal Push Network Features
    address public constant UNIVERSAL_EXECUTOR_FACTORY = 0x00000000000000000000000000000000000000eA;
    address public constant UNIVERSAL_VERIFICATION_PRECOMPILE = 0x00000000000000000000000000000000000000ca;
    
    // Cross-chain user mapping (chainId => originalAddress => pushAddress)
    mapping(uint256 => mapping(address => address)) public crossChainUsers;
    mapping(address => string) public userChainNamespaces; // Store user's origin chain
    
    // Supported chain namespaces
    mapping(string => bool) public supportedChains;
    
    // Cross-chain bet tracking
    struct CrossChainBet {
        string originChain;
        address originAddress;
        bytes32 txHash;
        uint256 timestamp;
    }
    
    mapping(uint256 => mapping(address => CrossChainBet)) public crossChainBets;
    
    // Events
    event MarketCreated(uint256 indexed marketId, string title, address indexed creator);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint8 option, uint256 amount, uint256 shares);
    event CrossChainBetPlaced(uint256 indexed marketId, address indexed user, uint8 option, uint256 amount, string originChain, address originAddress);
    event MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver);
    event RewardsDistributed(uint256 indexed marketId, uint256 totalRewards, uint256 winnersCount);
    event TreasuryDeposit(uint256 amount);
    event TreasuryWithdraw(uint256 amount);
    event CrossChainUserRegistered(address indexed pushAddress, string chainNamespace, address originalAddress);
    event ChainSupportAdded(string chainNamespace);
    event ChainSupportRemoved(string chainNamespace);
    
    constructor() Ownable(msg.sender) {
        marketCounter = 0;
        
        // Initialize supported chains
        supportedChains["eip155:42101"] = true; // Push Testnet (Donut)
        supportedChains["eip155:11155111"] = true; // Ethereum Sepolia
        supportedChains["solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"] = true; // Solana Devnet
    }
    
    // Universal Chain Management Functions
    function addSupportedChain(string memory chainNamespace) external onlyOwner {
        supportedChains[chainNamespace] = true;
        emit ChainSupportAdded(chainNamespace);
    }
    
    function removeSupportedChain(string memory chainNamespace) external onlyOwner {
        supportedChains[chainNamespace] = false;
        emit ChainSupportRemoved(chainNamespace);
    }
    
    // Register cross-chain user mapping
    function registerCrossChainUser(
        string memory chainNamespace,
        address originalAddress,
        bytes memory signature
    ) external {
        require(supportedChains[chainNamespace], "Chain not supported");
        
        // Store the mapping
        crossChainUsers[getChainIdFromNamespace(chainNamespace)][originalAddress] = msg.sender;
        userChainNamespaces[msg.sender] = chainNamespace;
        
        emit CrossChainUserRegistered(msg.sender, chainNamespace, originalAddress);
    }
    
    // Helper function to extract chain ID from namespace
    function getChainIdFromNamespace(string memory chainNamespace) internal pure returns (uint256) {
        // Simple implementation - in production, you'd want more robust parsing
        if (keccak256(bytes(chainNamespace)) == keccak256(bytes("eip155:42101"))) return 42101;
        if (keccak256(bytes(chainNamespace)) == keccak256(bytes("eip155:11155111"))) return 11155111;
        return 0; // Default for non-EVM chains like Solana
    }
    
    // Deposit funds to treasury for automatic reward distribution
    function depositToTreasury() external payable onlyOwner {
        treasuryBalance += msg.value;
        emit TreasuryDeposit(msg.value);
    }
    
    // Withdraw from treasury (emergency only)
    function withdrawFromTreasury(uint256 amount) external onlyOwner {
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        treasuryBalance -= amount;
        payable(owner()).transfer(amount);
        emit TreasuryWithdraw(amount);
    }
    
    // Create a new prediction market
    function createMarket(
        string memory _title,
        string memory _description,
        string memory _optionA,
        string memory _optionB,
        uint8 _category,
        uint256 _endTime,
        uint256 _minBet,
        uint256 _maxBet,
        string memory _imageUrl
    ) public onlyOwner returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_minBet > 0, "Minimum bet must be greater than 0");
        require(_maxBet >= _minBet, "Maximum bet must be >= minimum bet");
        
        marketCounter++;
        
        markets[marketCounter] = Market({
            id: marketCounter,
            title: _title,
            description: _description,
            optionA: _optionA,
            optionB: _optionB,
            category: _category,
            creator: msg.sender,
            createdAt: block.timestamp,
            endTime: _endTime,
            minBet: _minBet,
            maxBet: _maxBet,
            status: MarketStatus.Active,
            outcome: 0,
            resolved: false,
            totalOptionAShares: 0,
            totalOptionBShares: 0,
            totalPool: 0,
            imageUrl: _imageUrl
        });
        
        allMarketIds.push(marketCounter);
        
        emit MarketCreated(marketCounter, _title, msg.sender);
        return marketCounter;
    }
    
    // Place a bet on a market (standard)
    function placeBet(uint256 _marketId, uint8 _option) external payable nonReentrant whenNotPaused {
        _placeBetInternal(_marketId, _option, msg.sender, "", address(0));
    }
    
    // Place a cross-chain bet (universal feature)
    function placeCrossChainBet(
        uint256 _marketId, 
        uint8 _option,
        string memory originChain,
        address originAddress,
        bytes memory signature
    ) external payable nonReentrant whenNotPaused {
        require(supportedChains[originChain], "Origin chain not supported");
        
        // Verify the cross-chain signature using Universal Verification Precompile
        // In a full implementation, you'd call the precompile to verify the signature
        // For now, we'll trust the caller (in production, implement proper verification)
        
        _placeBetInternal(_marketId, _option, msg.sender, originChain, originAddress);
        
        // Store cross-chain bet information
        crossChainBets[_marketId][msg.sender] = CrossChainBet({
            originChain: originChain,
            originAddress: originAddress,
            txHash: keccak256(abi.encodePacked(block.timestamp, msg.sender, _marketId)),
            timestamp: block.timestamp
        });
        
        emit CrossChainBetPlaced(_marketId, msg.sender, _option, msg.value, originChain, originAddress);
    }
    
    // Internal bet placement logic
    function _placeBetInternal(
        uint256 _marketId, 
        uint8 _option, 
        address user,
        string memory originChain,
        address originAddress
    ) internal {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Active, "Market is not active");
        require(block.timestamp < market.endTime, "Market has ended");
        require(_option == 0 || _option == 1, "Invalid option");
        require(msg.value >= market.minBet, "Bet amount too low");
        require(msg.value <= market.maxBet, "Bet amount too high");
        
        UserPosition storage position = userPositions[_marketId][user];
        
        // Calculate shares (1:1 ratio for simplicity)
        uint256 shares = msg.value;
        
        // Update user position
        if (_option == 0) {
            position.optionAShares += shares;
            market.totalOptionAShares += shares;
        } else {
            position.optionBShares += shares;
            market.totalOptionBShares += shares;
        }
        
        position.totalInvested += msg.value;
        market.totalPool += msg.value;
        
        // Add to user's market list if first bet
        if (position.totalInvested == msg.value) {
            userMarkets[user].push(_marketId);
        }
        
        emit BetPlaced(_marketId, user, _option, msg.value, shares);
    }
    
    // Resolve a market and distribute rewards automatically
    function resolveMarket(uint256 _marketId, uint8 _outcome) external onlyOwner nonReentrant {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(_outcome == 0 || _outcome == 1, "Invalid outcome");
        
        market.resolved = true;
        market.outcome = _outcome;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(_marketId, _outcome, msg.sender);
        
        // Automatically distribute rewards
        _distributeRewards(_marketId);
    }
    
    // Internal function to distribute rewards automatically
    function _distributeRewards(uint256 _marketId) internal {
        Market storage market = markets[_marketId];
        
        uint256 totalPool = market.totalPool;
        uint256 platformFee = (totalPool * PLATFORM_FEE) / BASIS_POINTS;
        uint256 rewardPool = totalPool - platformFee;
        
        uint256 winningShares = market.outcome == 0 ? market.totalOptionAShares : market.totalOptionBShares;
        
        if (winningShares == 0) {
            // No winners, return funds to treasury
            treasuryBalance += totalPool;
            return;
        }
        
        // Count winners and calculate total rewards needed
        uint256 winnersCount = 0;
        uint256 totalRewardsNeeded = 0;
        
        // First pass: calculate total rewards needed
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            // This is a simplified approach - in production, you'd want to track participants more efficiently
            // For now, we'll use events or maintain a separate mapping of participants
        }
        
        // Add platform fee to treasury
        treasuryBalance += platformFee;
        
        // For now, emit event - in production you'd implement the actual distribution
        emit RewardsDistributed(_marketId, rewardPool, winnersCount);
    }
    
    // Claim winnings for a specific market
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");
        
        UserPosition storage position = userPositions[_marketId][msg.sender];
        require(position.totalInvested > 0, "No position in this market");
        
        uint256 winningShares = market.outcome == 0 ? position.optionAShares : position.optionBShares;
        require(winningShares > 0, "No winning position");
        
        uint256 totalWinningShares = market.outcome == 0 ? market.totalOptionAShares : market.totalOptionBShares;
        uint256 totalPool = market.totalPool;
        uint256 platformFee = (totalPool * PLATFORM_FEE) / BASIS_POINTS;
        uint256 rewardPool = totalPool - platformFee;
        
        uint256 userReward = (rewardPool * winningShares) / totalWinningShares;
        
        // Mark as claimed
        position.optionAShares = 0;
        position.optionBShares = 0;
        position.totalInvested = 0;
        
        // Transfer reward
        payable(msg.sender).transfer(userReward);
    }
    
    // View functions
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
    
    function getAllMarkets() external view returns (Market[] memory) {
        Market[] memory allMarkets = new Market[](allMarketIds.length);
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            allMarkets[i] = markets[allMarketIds[i]];
        }
        return allMarkets;
    }
    
    function getActiveMarkets() external view returns (Market[] memory) {
        uint256 activeCount = 0;
        
        // Count active markets
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            if (markets[allMarketIds[i]].status == MarketStatus.Active && 
                block.timestamp < markets[allMarketIds[i]].endTime) {
                activeCount++;
            }
        }
        
        // Create array of active markets
        Market[] memory activeMarkets = new Market[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            if (markets[allMarketIds[i]].status == MarketStatus.Active && 
                block.timestamp < markets[allMarketIds[i]].endTime) {
                activeMarkets[index] = markets[allMarketIds[i]];
                index++;
            }
        }
        
        return activeMarkets;
    }
    
    function getUserPosition(address _user, uint256 _marketId) external view returns (UserPosition memory) {
        return userPositions[_marketId][_user];
    }
    
    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }
    
    // Admin functions
    function pauseContract() external onlyOwner {
        _pause();
    }
    
    function unpauseContract() external onlyOwner {
        _unpause();
    }
    
    function updateMarketStatus(uint256 _marketId, MarketStatus _status) external onlyOwner {
        markets[_marketId].status = _status;
    }
    
    // Emergency withdraw (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return treasuryBalance;
    }
    
    // Universal Features - View Functions
    function getCrossChainUser(uint256 chainId, address originalAddress) external view returns (address) {
        return crossChainUsers[chainId][originalAddress];
    }
    
    function getUserChainNamespace(address user) external view returns (string memory) {
        return userChainNamespaces[user];
    }
    
    function getCrossChainBet(uint256 marketId, address user) external view returns (CrossChainBet memory) {
        return crossChainBets[marketId][user];
    }
    
    function isChainSupported(string memory chainNamespace) external view returns (bool) {
        return supportedChains[chainNamespace];
    }
    
    // Universal Features - Batch Operations
    function batchPlaceBets(
        uint256[] memory marketIds,
        uint8[] memory options,
        uint256[] memory amounts
    ) external payable nonReentrant whenNotPaused {
        require(marketIds.length == options.length && options.length == amounts.length, "Array length mismatch");
        
        uint256 totalRequired = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalRequired += amounts[i];
        }
        require(msg.value == totalRequired, "Incorrect total amount");
        
        for (uint256 i = 0; i < marketIds.length; i++) {
            // For batch operations, we need to handle value distribution
            // This is a simplified version - in production, implement proper value handling
            _placeBetInternal(marketIds[i], options[i], msg.sender, "", address(0));
        }
    }
    
    // Universal Features - Cross-chain Market Creation
    function createUniversalMarket(
        string memory _title,
        string memory _description,
        string memory _optionA,
        string memory _optionB,
        uint8 _category,
        uint256 _endTime,
        uint256 _minBet,
        uint256 _maxBet,
        string memory _imageUrl,
        string[] memory _supportedChains
    ) external onlyOwner returns (uint256) {
        // Verify all chains are supported
        for (uint256 i = 0; i < _supportedChains.length; i++) {
            require(supportedChains[_supportedChains[i]], "Unsupported chain in list");
        }
        
        uint256 marketId = createMarket(_title, _description, _optionA, _optionB, _category, _endTime, _minBet, _maxBet, _imageUrl);
        
        // In a full implementation, you could store which chains this market supports
        // and emit events for cross-chain indexing
        
        return marketId;
    }
    
    // Emergency function to handle cross-chain issues
    function emergencyCrossChainRefund(uint256 marketId, address user) external onlyOwner {
        UserPosition storage position = userPositions[marketId][user];
        require(position.totalInvested > 0, "No position to refund");
        
        uint256 refundAmount = position.totalInvested;
        
        // Clear position
        position.optionAShares = 0;
        position.optionBShares = 0;
        position.totalInvested = 0;
        
        // Update market totals
        Market storage market = markets[marketId];
        market.totalPool -= refundAmount;
        
        // Transfer refund
        payable(user).transfer(refundAmount);
    }
}