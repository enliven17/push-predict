import { NextResponse } from 'next/server';

export async function GET() {
  const supportedChains = [
    {
      namespace: 'eip155:42101',
      name: 'Push Network Donut Testnet',
      native: true,
      currency: 'PC',
      rpcUrl: 'https://evm.rpc-testnet-donut-node1.push.org/',
      explorerUrl: 'https://donut.push.network/'
    },
    {
      namespace: 'eip155:11155111',
      name: 'Ethereum Sepolia',
      native: false,
      currency: 'ETH',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
      explorerUrl: 'https://sepolia.etherscan.io/'
    },
    {
      namespace: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      name: 'Solana Devnet',
      native: false,
      currency: 'SOL',
      rpcUrl: 'https://api.devnet.solana.com',
      explorerUrl: 'https://explorer.solana.com/?cluster=devnet'
    }
  ];

  return NextResponse.json({
    success: true,
    chains: supportedChains
  });
}