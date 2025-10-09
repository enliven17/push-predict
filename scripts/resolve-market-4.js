const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const marketId = "4"; // Market ID to resolve
  const outcome = "0"; // 0 for Yes (optionA), 1 for No (optionB)

  console.log("🔧 Resolving Market ID:", marketId);
  console.log("🔧 Outcome:", outcome === '0' ? 'Yes (optionA)' : 'No (optionB)');

  console.log(`🍩 Resolving market ${marketId} on PushPredict...`);
  console.log(`📊 Outcome: ${outcome === '0' ? 'Yes (optionA)' : 'No (optionB)'}`);

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    process.exit(1);
  }

  // Get the contract
  const PushPredict = await hre.ethers.getContractFactory("PushPredict");
  const pushPredict = PushPredict.attach(contractAddress);

  try {
    // Get market info first
    const market = await pushPredict.getMarket(marketId);
    console.log("📋 Market Info:");
    console.log("🏷️ Title:", market.title);
    console.log("🅰️ Option A:", market.optionA);
    console.log("🅱️ Option B:", market.optionB);
    console.log("💰 Total Pool:", hre.ethers.utils.formatEther(market.totalPool), "PC");
    console.log("📊 Option A Shares:", hre.ethers.utils.formatEther(market.totalOptionAShares), "PC");
    console.log("📊 Option B Shares:", hre.ethers.utils.formatEther(market.totalOptionBShares), "PC");

    if (market.resolved) {
      console.log("⚠️ Market is already resolved!");
      console.log("🏆 Winner:", market.outcome === 0 ? 'Option A (Yes)' : 'Option B (No)');
      return;
    }

    console.log("⏳ Resolving market...");
    const tx = await pushPredict.resolveMarket(marketId, outcome);

    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();

    console.log("✅ Market resolved successfully!");
    console.log("🏆 Winner:", outcome === '0' ? 'Option A (Yes)' : 'Option B (No)');
    console.log(`🔗 View on explorer: https://donut.push.network/tx/${tx.hash}`);

  } catch (error) {
    console.error("❌ Failed to resolve market:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });