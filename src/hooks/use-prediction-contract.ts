import { usePushWalletContext, usePushChainClient } from '@pushchain/ui-kit';
import { ethers } from 'ethers';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';
import { Market } from '@/types/market';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUniversalContractRead } from './use-universal-contract-read';

export const usePredictionContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();

  // Place Bet Function
  const placeBet = async (marketId: string, option: 0 | 1, amount: string) => {
    if (!pushChainClient) {
      throw new Error('Push Chain client not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🎯 Placing bet:', { marketId, option, amount });
      
      // Create contract interface
      const contractInterface = new ethers.Interface(PREDICTION_MARKET_ABI);
      const data = contractInterface.encodeFunctionData('placeBet', [BigInt(marketId), option]);
      
      const tx = await pushChainClient.universal.sendTransaction({
        to: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        data,
        value: BigInt(ethers.parseEther(amount).toString())
      });
      
      console.log('🎯 Transaction hash received:', tx.hash);
      setHash(tx.hash);
      toast.success('Bet transaction submitted!');
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error placing bet:', error);
      setError(error);
      toast.error(error?.message || 'Failed to place bet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve Market (Admin only)
  const resolveMarket = async (marketId: string, outcome: 0 | 1) => {
    if (!pushChainClient) {
      throw new Error('Push Chain client not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('⚖️ Resolving market:', { marketId, outcome });
      
      const contractInterface = new ethers.Interface(PREDICTION_MARKET_ABI);
      const data = contractInterface.encodeFunctionData('resolveMarket', [BigInt(marketId), outcome]);
      
      const tx = await pushChainClient.universal.sendTransaction({
        to: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        data
      });
      
      toast.success('Market resolution submitted!');
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error resolving market:', error);
      setError(error);
      toast.error(error?.message || 'Failed to resolve market');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create Market (Admin only)
  const createMarket = async (marketData: {
    title: string;
    description: string;
    optionA: string;
    optionB: string;
    category: number;
    endTime: number;
    minBet: string;
    maxBet: string;
    imageUrl: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('🏗️ Creating market:', marketData);
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [
          marketData.title,
          marketData.description,
          marketData.optionA,
          marketData.optionB,
          marketData.category,
          BigInt(marketData.endTime),
          parseEther(marketData.minBet),
          parseEther(marketData.maxBet),
          marketData.imageUrl,
        ],
      });
      
      toast.success('Market creation submitted!');
      return result;
    } catch (error: any) {
      console.error('❌ Error creating market:', error);
      toast.error(error?.message || 'Failed to create market');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Claim Winnings Function
  const claimWinnings = async (marketId: string) => {
    try {
      setIsLoading(true);
      console.log('💰 Claiming winnings for market:', marketId);
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
      });
      
      toast.success('Winnings claimed successfully!');
      return result;
    } catch (error: any) {
      console.error('❌ Error claiming winnings:', error);
      toast.error(error?.message || 'Failed to claim winnings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placeBet,
    resolveMarket,
    createMarket,
    claimWinnings,
    isLoading,
    isSuccess: !!hash,
    hash,
    error,
  };
};

// Hook to read contract data - now uses universal contract read
export const usePredictionContractRead = () => {
  // Use universal contract read hook
  const universalRead = useUniversalContractRead();
  
  return {
    allMarkets: universalRead.allMarkets,
    activeMarkets: universalRead.activeMarkets,
    allMarketsLoading: universalRead.allMarketsLoading,
    activeMarketsLoading: universalRead.activeMarketsLoading,
    refetchAllMarkets: universalRead.refetchAllMarkets,
    refetchActiveMarkets: universalRead.refetchActiveMarkets,
    getMarket: universalRead.getMarket,
    getUserPosition: universalRead.getUserPosition,
  };
};