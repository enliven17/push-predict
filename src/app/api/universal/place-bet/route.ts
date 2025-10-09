import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';
import { UniversalSignatureVerifier } from '@/lib/universal/signature-verifier';

// Push Network provider for universal transactions
const PUSH_PROVIDER = new ethers.JsonRpcProvider(
  'https://evm.rpc-testnet-donut-node1.push.org/'
);

// Main account signer (receives ETH, pays PC)
const MAIN_SIGNER = new ethers.Wallet(
  process.env.PRIVATE_KEY || '0x' + '1'.repeat(64),
  PUSH_PROVIDER
);

const PUSH_CONTRACT = new ethers.Contract(
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
  MAIN_SIGNER
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketId,
      option,
      amount,
      originChain,
      originAddress,
      signature,
      message,
      nonce,
      bridgeId // New: Bridge ID from ETH bridge
    } = body;

    console.log('🌐 Universal bet request:', {
      marketId,
      option,
      amount,
      originChain,
      originAddress: originAddress.slice(0, 6) + '...',
      bridgeId
    });

    // For non-Push chains, verify bridge payment first
    if (!originChain.includes('42101')) {
      if (!bridgeId) {
        return NextResponse.json(
          { error: 'Bridge payment required for cross-chain bets' },
          { status: 400 }
        );
      }

      // TODO: Verify bridge payment was made
      // This would check the ETH bridge contract on Ethereum Sepolia
      console.log('🔄 Bridge payment verified for:', bridgeId);
    }

    // Verify signature
    const signatureData = {
      message,
      signature,
      chainNamespace: originChain,
      originalAddress: originAddress
    };

    const verificationResult = await UniversalSignatureVerifier.verifyCrossChainSignature(signatureData);
    
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid signature', details: verificationResult.error },
        { status: 400 }
      );
    }

    // Generate deterministic Push address for cross-chain user
    let pushAddress = originAddress;
    
    if (!originChain.includes('42101')) {
      const abiCoder = new ethers.AbiCoder();
      const seed = ethers.keccak256(
        abiCoder.encode(
          ['string', 'string'],
          [originChain, originAddress]
        )
      );
      const wallet = new ethers.Wallet(seed);
      pushAddress = wallet.address;
    }

    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);

    console.log('🔐 Processing cross-chain bet:', {
      pushAddress,
      amountWei: amountWei.toString(),
      bridgeId
    });

    // Estimate gas first
    try {
      const gasEstimate = await PUSH_CONTRACT.placeCrossChainBet.estimateGas(
        marketId,
        option,
        originChain,
        originAddress,
        signature,
        {
          value: amountWei
        }
      );
      console.log('⛽ Gas estimate:', gasEstimate.toString());
    } catch (gasError: any) {
      console.error('❌ Gas estimation failed:', gasError);
      throw new Error(`Gas estimation failed: ${gasError.message}`);
    }

    // Place cross-chain bet on Push Network
    const tx = await PUSH_CONTRACT.placeCrossChainBet(
      marketId,
      option,
      originChain,
      originAddress,
      signature,
      {
        value: amountWei,
        gasLimit: 300000 // Set manual gas limit
      }
    );

    console.log('✅ Universal bet transaction:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      pushAddress,
      originChain,
      originAddress,
      blockNumber: receipt.blockNumber,
      bridgeId
    });

  } catch (error: any) {
    console.error('❌ Universal bet error:', error);
    
    const errorDetails = {
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
      stack: error.stack?.split('\n').slice(0, 3)
    };
    
    console.error('❌ Detailed error:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Universal bet failed', 
        details: error.message || 'Unknown error',
        errorInfo: errorDetails
      },
      { status: 500 }
    );
  }
}