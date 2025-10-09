const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🌉 Deploying ETH Bridge contract to Ethereum Sepolia...");

  // Deploy ETH Bridge
  const ETHBridge = await hre.ethers.getContractFactory("ETHBridge");
  const ethBridge = await ETHBridge.deploy();

  await ethBridge.waitForDeployment();
  const bridgeAddress = await ethBridge.getAddress();

  console.log("✅ ETH Bridge deployed to:", bridgeAddress);
  console.log("🔗 Sepolia Explorer:", `https://sepolia.etherscan.io/address/${bridgeAddress}`);

  // Verify contract (optional)
  try {
    console.log("⏳ Waiting for block confirmations...");
    await ethBridge.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contract...");
    await hre.run("verify:verify", {
      address: bridgeAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }

  // Test basic functions
  console.log("\n🧪 Testing bridge functions...");
  
  const minAmount = await ethBridge.MIN_BRIDGE_AMOUNT();
  const rate = await ethBridge.ETH_TO_PC_RATE();
  
  console.log("💰 Min bridge amount:", hre.ethers.formatEther(minAmount), "ETH");
  console.log("📊 ETH to PC rate:", rate.toString(), "PC per ETH");
  
  const testPCAmount = await ethBridge.calculatePCAmount(hre.ethers.parseEther("0.001"));
  console.log("🧮 0.001 ETH =", hre.ethers.formatEther(testPCAmount), "PC");

  console.log("\n📝 Add this to your .env file:");
  console.log(`ETH_BRIDGE_ADDRESS=${bridgeAddress}`);
  console.log(`NEXT_PUBLIC_ETH_BRIDGE_ADDRESS=${bridgeAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy failed:", error);
    process.exit(1);
  });