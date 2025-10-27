import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { UniversalSignatureVerifier } from '@/lib/universal/signature-verifier';

export interface UniversalBetParams {
  marketId: string;
  option: number;
  amount: string;
  originChain: string;
  originAddress: string;
  bridgeId?: string; // Optional bridge ID for cross-chain payments
}

export const useUniversalTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [supportedChains, setSupportedChains] = useState<any[]>([]);

  // Fetch supported chains
  const fetchSupportedChains = async () => {
    try {
      const response = await fetch('/api/universal/supported-chains');
      const data = await response.json();
      setSupportedChains(data.chains);
      return data.chains;
    } catch (error) {
      console.error('Failed to fetch supported chains:', error);
      return [];
    }
  };

  // Generate universal signature
  const generateUniversalSignature = async (
    signer: ethers.Signer,
    params: UniversalBetParams
  ) => {
    const nonce = Date.now().toString();
    const message = UniversalSignatureVerifier.generateUniversalMessage(
      'PLACE_BET',
      params.marketId,
      params.option,
      params.amount,
      nonce
    );

    const signature = await signer.signMessage(message);
    
    return { message, signature, nonce };
  };

  // Place universal bet
  const placeUniversalBet = async (
    params: UniversalBetParams
  ) => {
    try {
      setIsLoading(true);

      // Generate signature using Push Chain client
      const nonce = Date.now().toString();
      const message = UniversalSignatureVerifier.generateUniversalMessage(
        'PLACE_BET',
        params.marketId,
        params.option,
        params.amount,
        nonce
      );
      
      // For now, we'll use a placeholder signature
      // In a real implementation, this would use Push Chain client to sign
      const signature = `placeholder_signature_${nonce}`;

      // Call universal bet API
      const response = await fetch('/api/universal/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
          message,
          nonce,
          bridgeId: params.bridgeId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', result);
        throw new Error(result.details || result.error || 'Universal bet failed');
      }

      toast.success('Universal bet placed successfully!');
      return result;

    } catch (error: any) {
      console.error('Universal bet error:', error);
      toast.error(error.message || 'Failed to place universal bet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify cross-chain signature
  const verifyCrossChainSignature = async (
    message: string,
    signature: string,
    chainNamespace: string,
    originalAddress: string
  ) => {
    try {
      const response = await fetch('/api/universal/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          chainNamespace,
          originalAddress
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Signature verification error:', error);
      return { isValid: false, error: 'Verification failed' };
    }
  };

  return {
    isLoading,
    supportedChains,
    fetchSupportedChains,
    placeUniversalBet,
    verifyCrossChainSignature,
    generateUniversalSignature
  };
};