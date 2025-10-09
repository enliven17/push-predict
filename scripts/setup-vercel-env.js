#!/usr/bin/env node

/**
 * Script to set up Vercel environment variables
 * Run this after deploying to Vercel for the first time
 */

const { execSync } = require('child_process');
require('dotenv').config();

const envVars = [
  // Public variables
  'NEXT_PUBLIC_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_ADMIN_ADDRESS', 
  'NEXT_PUBLIC_PUSH_RPC_URL',
  'NEXT_PUBLIC_PUSH_CHAIN_ID',
  'NEXT_PUBLIC_BLOCK_EXPLORER',
  'NEXT_PUBLIC_ETHEREUM_SEPOLIA_GATEWAY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_UNIVERSAL_SIGNER_ADDRESS',
  'NEXT_PUBLIC_ETH_BRIDGE_ADDRESS',
  
  // Private variables
  'PRIVATE_KEY',
  'CONTRACT_ADDRESS',
  'PUSH_RPC_URL',
  'PUSH_RPC_URL_ALT',
  'PUSH_CHAIN_ID',
  'PUSH_EXPLORER',
  'ETHEREUM_SEPOLIA_GATEWAY',
  'SOLANA_DEVNET_GATEWAY',
  'UNIVERSAL_EXECUTOR_FACTORY',
  'UNIVERSAL_VERIFICATION_PRECOMPILE',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UNIVERSAL_SIGNER_PRIVATE_KEY',
  'ETH_BRIDGE_ADDRESS'
];

console.log('🚀 Setting up Vercel environment variables...\n');

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    try {
      const command = `vercel env add ${varName} production`;
      console.log(`Setting ${varName}...`);
      execSync(command, { 
        input: value + '\n',
        stdio: ['pipe', 'inherit', 'inherit']
      });
    } catch (error) {
      console.error(`Failed to set ${varName}:`, error.message);
    }
  } else {
    console.warn(`⚠️  ${varName} not found in .env file`);
  }
});

console.log('\n✅ Environment variables setup complete!');
console.log('🔄 Redeploy your project for changes to take effect:');
console.log('   vercel --prod');