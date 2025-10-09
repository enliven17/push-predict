const { ethers } = require('ethers');
require('dotenv').config();

async function checkUniversalSigner() {
  const provider = new ethers.JsonRpcProvider(process.env.PUSH_RPC_URL);
  
  const universalSigner = new ethers.Wallet(
    process.env.UNIVERSAL_SIGNER_PRIVATE_KEY,
    provider
  );
  
  console.log('🔑 Universal Signer Address:', universalSigner.address);
  
  const balance = await provider.getBalance(universalSigner.address);
  console.log('💰 Universal Signer Balance:', ethers.formatEther(balance), 'PC');
  
  if (balance === 0n) {
    console.log('❌ Universal Signer has no PC balance!');
    console.log('💡 Need to fund the universal signer address');
  } else {
    console.log('✅ Universal Signer has sufficient balance');
  }
}

checkUniversalSigner();