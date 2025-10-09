import { NextRequest, NextResponse } from 'next/server';
import { UniversalSignatureVerifier } from '@/lib/universal/signature-verifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, chainNamespace, originalAddress } = body;

    const signatureData = {
      message,
      signature,
      chainNamespace,
      originalAddress
    };

    const result = await UniversalSignatureVerifier.verifyCrossChainSignature(signatureData);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Signature verification error:', error);
    
    return NextResponse.json(
      { 
        isValid: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}