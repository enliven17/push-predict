const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const { PREDICTION_MARKET_ABI } = require('../src/lib/contracts/prediction-market.ts');

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncMarketsToSupabase() {
  console.log('🔄 Syncing markets from blockchain to Supabase...');

  // Connect to Push Network
  const provider = new ethers.JsonRpcProvider(process.env.PUSH_RPC_URL);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    PREDICTION_MARKET_ABI,
    provider
  );

  try {
    // Get all markets from blockchain
    console.log('📊 Fetching markets from blockchain...');
    const markets = await contract.getAllMarkets();
    console.log(`✅ Found ${markets.length} markets on blockchain`);

    // Sync each market to Supabase
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      
      const marketData = {
        id: Number(market[0]), // market.id
        title: market[1], // market.title
        description: market[2], // market.description
        option_a: market[3], // market.optionA
        option_b: market[4], // market.optionB
        category: Number(market[5]), // market.category
        creator_address: market[6], // market.creator
        created_at: new Date(Number(market[7]) * 1000).toISOString(), // market.createdAt
        end_time: new Date(Number(market[8]) * 1000).toISOString(), // market.endTime
        min_bet: ethers.formatEther(market[9]), // market.minBet
        max_bet: ethers.formatEther(market[10]), // market.maxBet
        status: Number(market[11]), // market.status
        outcome: market[13] ? Number(market[12]) : null, // market.outcome if resolved
        resolved: market[13], // market.resolved
        total_option_a_shares: ethers.formatEther(market[14]), // market.totalOptionAShares
        total_option_b_shares: ethers.formatEther(market[15]), // market.totalOptionBShares
        total_pool: ethers.formatEther(market[16]), // market.totalPool
        image_url: market[17] || null, // market.imageUrl
        supported_chains: ['eip155:42101', 'eip155:11155111', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
        is_universal: true,
        updated_at: new Date().toISOString()
      };

      console.log(`📝 Syncing Market ${marketData.id}: ${marketData.title}`);

      // Upsert market (insert or update if exists)
      const { error } = await supabase
        .from('markets')
        .upsert(marketData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Error syncing market ${marketData.id}:`, error);
      } else {
        console.log(`✅ Market ${marketData.id} synced successfully`);
      }
    }

    console.log('🎉 All markets synced to Supabase!');

    // Verify sync
    const { data: supabaseMarkets, error: fetchError } = await supabase
      .from('markets')
      .select('id, title')
      .order('id');

    if (fetchError) {
      console.error('❌ Error fetching synced markets:', fetchError);
    } else {
      console.log(`📊 Supabase now has ${supabaseMarkets.length} markets:`);
      supabaseMarkets.forEach(market => {
        console.log(`  - Market ${market.id}: ${market.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

syncMarketsToSupabase();