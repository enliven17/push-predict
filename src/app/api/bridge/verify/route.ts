import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Ethereum Sepolia provider
const ETH_PROVIDER = new ethers.JsonRpcProvider('https://gateway.tenderly.co/public/sepolia');
const BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDRESS;

export async function POST(request: NextRequest) {
  try {
    const { bridgeId, userAddress, ethAmount } = await request.json();
    
    // Bridge ID is the transaction hash
    const txHash = bridgeId;

    console.log('🔍 Verifying bridge payment:', {
      bridgeId,
      txHash,
      userAddress,
      ethAmount
    });

    // Get transaction details
    const tx = await ETH_PROVIDER.getTransaction(txHash);
    
    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify transaction details
    const isValid = 
      tx.from?.toLowerCase() === userAddress.toLowerCase() &&
      tx.to?.toLowerCase() === BRIDGE_ADDRESS?.toLowerCase() &&
      tx.value >= ethers.parseEther(ethAmount);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid bridge transaction' },
        { status: 400 }
      );
    }

    // Check if transaction is confirmed
    const receipt = await ETH_PROVIDER.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction not confirmed yet' },
        { status: 202 }
      );
    }

    console.log('✅ Bridge payment verified:', {
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      blockNumber: receipt.blockNumber
    });

    return NextResponse.json({
      success: true,
      verified: true,
      txHash,
      blockNumber: receipt.blockNumber,
      ethAmount: ethers.formatEther(tx.value)
    });

  } catch (error: any) {
    console.error('❌ Bridge verification failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Bridge verification failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}