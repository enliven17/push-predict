const { ethers } = require('ethers');
require('dotenv').config();

const { PREDICTION_MARKET_ABI } = require('../src/lib/contracts/prediction-market.ts');

async function checkMarkets() {
  const provider = new ethers.JsonRpcProvider(process.env.PUSH_RPC_URL);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    PREDICTION_MARKET_ABI,
    provider
  );
  
  try {
    console.log('📊 Checking markets...');
    const markets = await contract.getAllMarkets();
    console.log('📈 Total markets:', markets.length);
    
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      console.log(`Market ${market[0]}: ${market[1]} (Status: ${market[11]})`);
    }
    
    // Check specific market 5
    try {
      const market5 = await contract.getMarket(5);
      console.log('✅ Market 5 exists:', market5[1]);
      console.log('📊 Status:', market5[11].toString());
      console.log('⏰ End time:', new Date(Number(market5[8]) * 1000));
      console.log('💰 Min bet:', ethers.formatEther(market5[9]), 'PC');
      console.log('💰 Max bet:', ethers.formatEther(market5[10]), 'PC');
    } catch (e) {
      console.log('❌ Market 5 does not exist:', e.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMarkets();