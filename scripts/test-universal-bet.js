const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing Universal Cross-Chain Bet...");

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    process.exit(1);
  }

  // Test parameters
  const marketId = "5"; // Bitcoin market
  const option = 0; // Yes option
  const betAmount = "0.01"; // 0.01 PC
  const originChain = "eip155:11155111"; // Ethereum Sepolia
  const originAddress = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123"; // Test address

  console.log("📋 Test Parameters:");
  console.log("Market ID:", marketId);
  console.log("Option:", option === 0 ? "Yes" : "No");
  console.log("Bet Amount:", betAmount, "PC");
  console.log("Origin Chain:", originChain);
  console.log("Origin Address:", originAddress);

  // Get the contract
  const PushPredict = await hre.ethers.getContractFactory("PushPredict");
  const pushPredict = PushPredict.attach(contractAddress);

  try {
    // 1. Check market exists
    console.log("\n🔍 Step 1: Checking market...");
    const market = await pushPredict.getMarket(marketId);
    console.log("✅ Market found:", market.title);
    console.log("📊 Current pool:", hre.ethers.utils.formatEther(market.totalPool), "PC");

    // 2. Check if chain is supported
    console.log("\n🌐 Step 2: Checking chain support...");
    const isChainSupported = await pushPredict.isChainSupported(originChain);
    console.log("✅ Chain supported:", isChainSupported);

    // 3. Generate test signature
    console.log("\n✍️ Step 3: Generating signature...");
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
    const nonce = Date.now().toString();
    const message = `PushPredict Universal Action
Action: PLACE_BET
Market ID: ${marketId}
Option: ${option}
Amount: ${betAmount}
Nonce: ${nonce}
Timestamp: ${Date.now()}`;

    const signature = await wallet.signMessage(message);
    console.log("✅ Signature generated");
    console.log("📝 Message:", message);
    console.log("🔐 Signature:", signature.substring(0, 20) + "...");

    // 4. Test cross-chain bet
    console.log("\n🚀 Step 4: Placing cross-chain bet...");
    const tx = await pushPredict.placeCrossChainBet(
      marketId,
      option,
      originChain,
      originAddress,
      signature,
      {
        value: hre.ethers.utils.parseEther(betAmount),
        gasLimit: 500000
      }
    );

    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log("✅ Cross-chain bet placed successfully!");
    console.log("🔗 Block number:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());

    // 5. Check updated market state
    console.log("\n📊 Step 5: Checking updated market state...");
    const updatedMarket = await pushPredict.getMarket(marketId);
    console.log("💰 New pool:", hre.ethers.utils.formatEther(updatedMarket.totalPool), "PC");
    console.log("📈 Option A shares:", hre.ethers.utils.formatEther(updatedMarket.totalOptionAShares), "PC");
    console.log("📉 Option B shares:", hre.ethers.utils.formatEther(updatedMarket.totalOptionBShares), "PC");

    // 6. Check cross-chain bet record
    console.log("\n🔍 Step 6: Checking cross-chain bet record...");
    const crossChainBet = await pushPredict.getCrossChainBet(marketId, wallet.address);
    console.log("🌐 Origin chain:", crossChainBet.originChain);
    console.log("👤 Origin address:", crossChainBet.originAddress);
    console.log("📅 Timestamp:", new Date(crossChainBet.timestamp * 1000).toLocaleString());

    console.log("\n🎉 Universal cross-chain bet test completed successfully!");
    console.log(`🔗 View transaction: https://donut.push.network/tx/${tx.hash}`);

  } catch (error) {
    console.error("❌ Universal bet test failed:", error.message);
    
    // Detailed error analysis
    if (error.message.includes("Chain not supported")) {
      console.log("💡 Tip: Make sure the origin chain is added to supported chains");
    } else if (error.message.includes("Invalid cross-chain signature")) {
      console.log("💡 Tip: Check signature generation and verification logic");
    } else if (error.message.includes("Minimum bet")) {
      console.log("💡 Tip: Increase bet amount to meet minimum requirements");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });