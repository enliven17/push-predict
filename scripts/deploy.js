const hre = require("hardhat");

async function main() {
  console.log("🍩 Deploying PushPredict contract to Push Network Donut Testnet...");

  // Get the contract factory
  const PushPredict = await hre.ethers.getContractFactory("PushPredict");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const pushPredict = await PushPredict.deploy();

  await pushPredict.deployed();

  console.log("✅ PushPredict deployed to:", pushPredict.address);
  console.log("📝 Transaction hash:", pushPredict.deployTransaction.hash);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await pushPredict.deployTransaction.wait(2);

  console.log("🎉 Contract deployed and confirmed!");
  console.log("\n📋 Contract Details:");
  console.log("Contract Address:", pushPredict.address);
  console.log("Network: Push Chain Donut Testnet");
  console.log("Chain ID: 42101");
  console.log("Owner:", await pushPredict.owner());

  // Display universal features
  console.log("\n🌐 Universal Features Enabled:");
  console.log("✓ Cross-chain betting support");
  console.log("✓ Universal Executor Factory:", "0x00000000000000000000000000000000000000eA");
  console.log("✓ Universal Verification Precompile:", "0x00000000000000000000000000000000000000ca");
  console.log("✓ Supported Chains:");
  console.log("  - Push Testnet (eip155:42101)");
  console.log("  - Ethereum Sepolia (eip155:11155111)");
  console.log("  - Solana Devnet (solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1)");

  // Add to .env file instructions
  console.log("\n🔧 Add this to your .env file:");
  console.log(`CONTRACT_ADDRESS=${pushPredict.address}`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${pushPredict.address}`);
  console.log(`NEXT_PUBLIC_ADMIN_ADDRESS=${await pushPredict.owner()}`);

  // Verify contract on Push Chain explorer
  if (hre.network.name === "push_testnet" || hre.network.name === "push_testnet_alt") {
    console.log("\n🔍 Verifying contract on Push Chain explorer...");
    try {
      await hre.run("verify:verify", {
        address: pushPredict.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Push Chain explorer");
      console.log(`🔗 View at: https://donut.push.network/address/${pushPredict.address}`);
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("💡 You can verify manually at: https://donut.push.network/");
    }
  }

  console.log("\n🚀 Next Steps:");
  console.log("1. Update your .env file with the contract address");
  console.log("2. Create some prediction markets using the admin functions");
  console.log("3. Test cross-chain betting functionality");
  console.log("4. Set up Push Network SDK integration in your frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });