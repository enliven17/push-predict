const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBetActivities() {
  console.log('🔍 Checking bet activities in Supabase...');
  
  try {
    // Get all bet activities
    const { data: allBets, error: allError } = await supabase
      .from('bet_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all bets:', allError);
      return;
    }

    console.log(`📊 Total bet activities: ${allBets.length}`);
    
    if (allBets.length > 0) {
      console.log('\n📝 Recent bet activities:');
      allBets.slice(0, 5).forEach((bet, index) => {
        console.log(`${index + 1}. Market ${bet.market_id} - ${bet.user_address.slice(0, 8)}... - ${bet.amount} PC - Option ${bet.option}`);
        console.log(`   Chain: ${bet.chain_namespace || 'N/A'} - Original: ${bet.original_address?.slice(0, 8) || 'N/A'}...`);
        console.log(`   TX: ${bet.tx_hash.slice(0, 10)}... - ${new Date(bet.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // Check for specific user address
    const testAddress = '0x71197e7a1CA5A2cb2AD82432B924F69b1E3dB123';
    console.log(`🔍 Checking bets for address: ${testAddress}`);
    
    const { data: userBets, error: userError } = await supabase
      .from('bet_activities')
      .select('*')
      .or(`user_address.eq.${testAddress},original_address.eq.${testAddress}`)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('❌ Error fetching user bets:', userError);
      return;
    }

    console.log(`👤 User bets found: ${userBets.length}`);
    
    if (userBets.length > 0) {
      console.log('\n📝 User bet details:');
      userBets.forEach((bet, index) => {
        console.log(`${index + 1}. Market ${bet.market_id} - ${bet.amount} PC - Option ${bet.option}`);
        console.log(`   User Address: ${bet.user_address}`);
        console.log(`   Original Address: ${bet.original_address || 'N/A'}`);
        console.log(`   Chain: ${bet.chain_namespace || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No bets found for this user address');
      
      // Check if there are any bets with similar addresses
      const { data: similarBets, error: similarError } = await supabase
        .from('bet_activities')
        .select('user_address, original_address, market_id, amount')
        .ilike('user_address', '%71197e7a%');
        
      if (!similarError && similarBets.length > 0) {
        console.log('\n🔍 Found similar addresses:');
        similarBets.forEach(bet => {
          console.log(`- User: ${bet.user_address}, Original: ${bet.original_address || 'N/A'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBetActivities();