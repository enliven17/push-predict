const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🍩 Creating Bitcoin prediction market on PushPredict...");

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    process.exit(1);
  }

  // Get the contract
  const PushPredict = await hre.ethers.getContractFactory("PushPredict");
  const pushPredict = PushPredict.attach(contractAddress);

  // Market details - Updated for December 2025
  const title = "Bitcoin Price Prediction - Will BTC reach $150,000 by December 31, 2025?";
  const description = "Predict whether Bitcoin (BTC) will reach or exceed $150,000 USD by December 31, 2025. This market leverages Push Network's universal cross-chain technology for seamless participation from any supported blockchain.";
  const optionA = "Yes - BTC will reach $150,000";
  const optionB = "No - BTC will stay below $150,000";
  const category = 1; // Crypto category
  const endTime = Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000); // December 31, 2025
  const minBet = hre.ethers.utils.parseEther("0.01"); // 0.01 PC
  const maxBet = hre.ethers.utils.parseEther("10"); // 10 PC
  const imageUrl = "/bitcoin.png";

  // Supported chains for this market
  const supportedChains = [
    "eip155:42101", // Push Testnet
    "eip155:11155111", // Ethereum Sepolia
    "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" // Solana Devnet
  ];

  try {
    console.log("⏳ Creating universal market...");
    const tx = await pushPredict.createUniversalMarket(
      title,
      description,
      optionA,
      optionB,
      category,
      endTime,
      minBet,
      maxBet,
      imageUrl,
      supportedChains
    );

    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    // Find the MarketCreated event
    const marketCreatedEvent = receipt.events?.find(
      event => event.event === "MarketCreated"
    );
    
    if (marketCreatedEvent) {
      const marketId = marketCreatedEvent.args.marketId.toString();
      console.log("✅ Bitcoin market created successfully!");
      console.log("📊 Market ID:", marketId);
      console.log("🏷️ Title:", title);
      console.log("⏰ End Time:", new Date(endTime * 1000).toLocaleString());
      console.log("💰 Min Bet:", hre.ethers.utils.formatEther(minBet), "PC");
      console.log("💰 Max Bet:", hre.ethers.utils.formatEther(maxBet), "PC");
      console.log("🌐 Supported Chains:", supportedChains.length);
      console.log(`🔗 View on explorer: https://donut.push.network/address/${contractAddress}`);
    } else {
      console.log("✅ Market created but event not found in receipt");
    }

  } catch (error) {
    console.error("❌ Failed to create market:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });