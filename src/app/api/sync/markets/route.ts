import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting market sync...');

    // Connect to Push Network
    const provider = new ethers.JsonRpcProvider(process.env.PUSH_RPC_URL);
    const contract = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS,
      PREDICTION_MARKET_ABI,
      provider
    );

    // Get all markets from blockchain
    const markets = await contract.getAllMarkets();
    console.log(`📊 Found ${markets.length} markets on blockchain`);

    const syncResults = [];

    // Sync each market to Supabase
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      
      const marketData = {
        id: Number(market[0]),
        title: market[1],
        description: market[2],
        option_a: market[3],
        option_b: market[4],
        category: Number(market[5]),
        creator_address: market[6],
        created_at: new Date(Number(market[7]) * 1000).toISOString(),
        end_time: new Date(Number(market[8]) * 1000).toISOString(),
        min_bet: ethers.formatEther(market[9]),
        max_bet: ethers.formatEther(market[10]),
        status: Number(market[11]),
        outcome: market[13] ? Number(market[12]) : null,
        resolved: market[13],
        total_option_a_shares: ethers.formatEther(market[14]),
        total_option_b_shares: ethers.formatEther(market[15]),
        total_pool: ethers.formatEther(market[16]),
        image_url: market[17] || null,
        supported_chains: ['eip155:42101', 'eip155:11155111', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
        is_universal: true,
        updated_at: new Date().toISOString()
      };

      // Upsert market
      const { error } = await supabase
        .from('markets')
        .upsert(marketData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Error syncing market ${marketData.id}:`, error);
        syncResults.push({ id: marketData.id, success: false, error: error.message });
      } else {
        console.log(`✅ Market ${marketData.id} synced successfully`);
        syncResults.push({ id: marketData.id, success: true });
      }
    }

    // Get final count
    const { data: supabaseMarkets, error: fetchError } = await supabase
      .from('markets')
      .select('id')
      .order('id');

    if (fetchError) {
      throw new Error(`Failed to verify sync: ${fetchError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Markets synced successfully',
      blockchainMarkets: markets.length,
      supabaseMarkets: supabaseMarkets.length,
      syncResults
    });

  } catch (error: any) {
    console.error('❌ Market sync failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Market sync failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}