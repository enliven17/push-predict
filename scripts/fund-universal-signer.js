const { ethers } = require('ethers');
require('dotenv').config();

async function fundUniversalSigner() {
  const provider = new ethers.JsonRpcProvider(process.env.PUSH_RPC_URL);
  
  // Main account (has PC)
  const mainSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Universal signer (needs PC)
  const universalSignerAddress = new ethers.Wallet(
    process.env.UNIVERSAL_SIGNER_PRIVATE_KEY
  ).address;
  
  console.log('💰 Funding Universal Signer...');
  console.log('📤 From:', mainSigner.address);
  console.log('📥 To:', universalSignerAddress);
  
  // Check main account balance
  const mainBalance = await provider.getBalance(mainSigner.address);
  console.log('💰 Main Account Balance:', ethers.formatEther(mainBalance), 'PC');
  
  if (mainBalance === 0n) {
    console.log('❌ Main account has no PC balance!');
    return;
  }
  
  // Send 5 PC to universal signer
  const amount = ethers.parseEther('5.0');
  
  const tx = await mainSigner.sendTransaction({
    to: universalSignerAddress,
    value: amount
  });
  
  console.log('📝 Transaction hash:', tx.hash);
  console.log('⏳ Waiting for confirmation...');
  
  const receipt = await tx.wait();
  console.log('✅ Transaction confirmed!');
  
  // Check new balance
  const newBalance = await provider.getBalance(universalSignerAddress);
  console.log('💰 Universal Signer New Balance:', ethers.formatEther(newBalance), 'PC');
}

fundUniversalSigner();