import { useState, useEffect } from 'react';
import { PushChain } from '@pushchain/core';
import { ethers } from 'ethers';
import { usePushWalletContext, usePushChainClient } from '@pushchain/ui-kit';
import { toast } from 'sonner';

export interface UniversalBetParams {
  marketId: string;
  option: number;
  amount: string;
}

export const usePushUniversal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [universalSigner, setUniversalSigner] = useState<any>(null);
  
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  
  const address = pushChainClient?.universal?.account;
  const chainId = 42101; // Push Testnet

  // Initialize Universal Signer when wallet changes
  useEffect(() => {
    const initializeUniversal = async () => {
      if (!pushChainClient || !address) {
        setUniversalSigner(null);
        return;
      }

      try {
        console.log('🔄 Initializing Universal Signer...');
        
        // Push UI Kit already provides the universal signer
        setUniversalSigner(pushChainClient.universal);
        
        console.log('✅ Universal Signer initialized for chain:', chainId);
        
      } catch (error: any) {
        console.error('❌ Failed to initialize Universal Signer:', error);
        setUniversalSigner(null);
      }
    };

    initializeUniversal();
  }, [pushChainClient, address, chainId]);

  // Place universal bet
  const placeUniversalBet = async (params: UniversalBetParams) => {
    if (!universalSigner || !address) {
      throw new Error('Universal Signer not initialized');
    }

    try {
      setIsLoading(true);
      
      const { marketId, option, amount } = params;
      
      // Generate universal signature
      const nonce = Date.now().toString();
      const message = `PushPredict Universal Bet
Market ID: ${marketId}
Option: ${option}
Amount: ${amount}
Chain: eip155:${chainId}
Address: ${address}
Nonce: ${nonce}
Timestamp: ${Date.now()}`;

      // Sign message with Push Chain client
      const signature = await pushChainClient!.universal.signMessage(message);

      console.log('✅ Universal signature generated');

      // Prepare cross-chain bet transaction
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
      const contractInterface = new ethers.Interface([
        "function placeCrossChainBet(uint256 marketId, uint8 option, string originChain, address originAddress, bytes signature) payable"
      ]);

      const txData = contractInterface.encodeFunctionData("placeCrossChainBet", [
        marketId,
        option,
        `eip155:${chainId}`,
        address,
        signature
      ]);

      // Send universal transaction to Push Network
      const universalTx = {
        to: contractAddress,
        data: txData,
        value: ethers.parseEther(amount),
        gasLimit: 500000
      };

      console.log('🚀 Sending universal transaction...');
      console.log('Origin Chain:', `eip155:${chainId}`);
      console.log('Target Chain: Push Network (eip155:42101)');

      // Use Push Chain client to send transaction
      const txResponse = await pushChainClient!.universal.sendTransaction(universalTx);

      console.log('✅ Universal bet transaction sent:', txResponse.hash);
      
      // Wait for confirmation
      const receipt = await txResponse.wait();
      console.log('✅ Universal bet confirmed:', receipt.blockNumber);

      toast.success(`Universal bet placed! Origin: ${chainId === 42101 ? 'Push Network' : 'Ethereum Sepolia'}`);
      
      return {
        hash: txResponse.hash,
        receipt,
        originChain: `eip155:${chainId}`,
        targetChain: 'eip155:42101'
      };

    } catch (error: any) {
      console.error('❌ Universal bet failed:', error);
      toast.error(error.message || 'Universal bet failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get chain info
  const getChainInfo = () => {
    switch (chainId) {
      case 42101:
        return { name: 'Push Network', icon: '🍩', native: true };
      case 11155111:
        return { name: 'Ethereum Sepolia', icon: '⟠', native: false };
      default:
        return { name: 'Unknown', icon: '❓', native: false };
    }
  };

  return {
    isLoading,
    universalSigner,
    pushClient: pushChainClient,
    placeUniversalBet,
    chainInfo: getChainInfo(),
    isUniversalReady: !!universalSigner && !!pushChainClient,
    connectedChain: chainId
  };
};