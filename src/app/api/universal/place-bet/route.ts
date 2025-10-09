import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';
import { UniversalSignatureVerifier } from '@/lib/universal/signature-verifier';

// Push Network provider for universal transactions
const PUSH_PROVIDER = new ethers.JsonRpcProvider(
  'https://evm.rpc-testnet-donut-node1.push.org/'
);

// Universal signer (in production, use secure key management)
const UNIVERSAL_SIGNER = new ethers.Wallet(
  process.env.UNIVERSAL_SIGNER_PRIVATE_KEY || '0x' + '1'.repeat(64),
  PUSH_PROVIDER
);

const PUSH_CONTRACT = new ethers.Contract(
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
  UNIVERSAL_SIGNER
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
      nonce
    } = body;

    console.log('🌐 Universal bet request:', {
      marketId,
      option,
      amount,
      originChain,
      originAddress: originAddress.slice(0, 6) + '...'
    });

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

    console.log('🔐 Signature details:', {
      original: signature,
      length: signature.length,
      isHex: signature.startsWith('0x')
    });

    // Place cross-chain bet on Push Network
    const tx = await PUSH_CONTRACT.placeCrossChainBet(
      marketId,
      option,
      originChain,
      originAddress,
      signature, // Pass signature as hex string
      {
        value: amountWei // Pay with PC tokens
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
      blockNumber: receipt.blockNumber
    });

  } catch (error: any) {
    console.error('❌ Universal bet error:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
      stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
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