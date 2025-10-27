import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePushWalletContext, usePushChainClient } from '@pushchain/ui-kit';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';
import { Market } from '@/types/market';
const formatEther = (value: bigint) => ethers.formatEther(value);

// Always read from Push Network regardless of connected chain
const PUSH_PROVIDER = new ethers.JsonRpcProvider(
  'https://evm.rpc-testnet-donut-node1.push.org/'
);

const PUSH_CONTRACT = new ethers.Contract(
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
  PUSH_PROVIDER
);

export const useUniversalContractRead = () => {
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [activeMarkets, setActiveMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  
  const chainId = 42101; // Always use Push Network
  const chain = { id: 42101, name: 'Push Network Donut Testnet' };

  // Transform contract data to Market type
  const transformContractMarket = (contractMarket: any): Market => {
    return {
      id: contractMarket.id.toString(),
      title: contractMarket.title,
      description: contractMarket.description,
      category: Number(contractMarket.category),
      optionA: contractMarket.optionA,
      optionB: contractMarket.optionB,
      creator: contractMarket.creator,
      createdAt: contractMarket.createdAt.toString(),
      endTime: contractMarket.endTime.toString(),
      minBet: formatEther(contractMarket.minBet),
      maxBet: formatEther(contractMarket.maxBet),
      status: Number(contractMarket.status),
      outcome: contractMarket.resolved ? Number(contractMarket.outcome) : null,
      resolved: contractMarket.resolved,
      totalOptionAShares: formatEther(contractMarket.totalOptionAShares),
      totalOptionBShares: formatEther(contractMarket.totalOptionBShares),
      totalPool: formatEther(contractMarket.totalPool),
      imageURI: contractMarket.imageUrl,
    };
  };

  // Fetch markets from Push Network (universal)
  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🌐 Fetching universal markets from Push Network (connected to: ${chain.name})`);

      // Always read from Push Network contract
      const [allMarketsData, activeMarketsData] = await Promise.all([
        PUSH_CONTRACT.getAllMarkets(),
        PUSH_CONTRACT.getActiveMarkets()
      ]);

      const transformedAllMarkets = allMarketsData.map(transformContractMarket);
      const transformedActiveMarkets = activeMarketsData.map(transformContractMarket);

      setAllMarkets(transformedAllMarkets);
      setActiveMarkets(transformedActiveMarkets);

      console.log(`✅ Loaded ${transformedAllMarkets.length} total markets, ${transformedActiveMarkets.length} active`);

    } catch (err: any) {
      console.error('❌ Error fetching universal markets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get single market (universal)
  const getMarket = (marketId: string) => {
    const [marketData, setMarketData] = useState<Market | null>(null);
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);

    useEffect(() => {
      const fetchMarket = async () => {
        try {
          setIsLoadingMarket(true);
          const data = await PUSH_CONTRACT.getMarket(marketId);
          setMarketData(transformContractMarket(data));
        } catch (error) {
          console.error('Error fetching market:', error);
        } finally {
          setIsLoadingMarket(false);
        }
      };

      if (marketId) {
        fetchMarket();
      }
    }, [marketId]);

    const fetchMarket = async () => {
      try {
        setIsLoadingMarket(true);
        const data = await PUSH_CONTRACT.getMarket(marketId);
        setMarketData(transformContractMarket(data));
      } catch (error) {
        console.error('Error fetching market:', error);
      } finally {
        setIsLoadingMarket(false);
      }
    };

    return {
      market: marketData,
      isLoading: isLoadingMarket,
      refetch: fetchMarket
    };
  };

  // Get user position (universal - requires Push Network address mapping)
  const getUserPosition = (userAddress: string, marketId: string) => {
    const [positionData, setPositionData] = useState<any>(null);
    const [isLoadingPosition, setIsLoadingPosition] = useState(false);

    useEffect(() => {
      if (userAddress && marketId) {
        fetchPosition();
      }
    }, [userAddress, marketId, chain.id]);

    const fetchPosition = async () => {
      try {
        setIsLoadingPosition(true);
        
        // If user is on different chain, use universal signer address
        let pushAddress = userAddress;
        
        if (chain.id !== 42101) {
          // For cross-chain bets, we need to check both:
          // 1. Main account address (where bets are actually stored)
          // 2. User's cross-chain mapping (for future implementation)
          
          // For now, use main account address since all cross-chain bets go there
          const mainAccountAddress = process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDRESS || 
                                   '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123';
          pushAddress = mainAccountAddress;
          
          // TODO: Implement proper cross-chain position mapping
          // This is a limitation - all cross-chain users see the same position
          console.log('⚠️ Cross-chain position: showing aggregated position from main account');
        }

        const data = await PUSH_CONTRACT.getUserPosition(pushAddress, marketId);
        
        setPositionData({
          optionAShares: formatEther(data.optionAShares),
          optionBShares: formatEther(data.optionBShares),
          totalInvested: formatEther(data.totalInvested),
          marketId: Number(marketId),
          currentValue: '0',
          profitLoss: '0',
        });
      } catch (error) {
        console.error('Error fetching user position:', error);
      } finally {
        setIsLoadingPosition(false);
      }
    };

    return {
      position: positionData,
      isLoading: isLoadingPosition,
      refetch: fetchPosition
    };
  };

  // Auto-fetch on mount and chain change
  useEffect(() => {
    fetchMarkets();
  }, [chain.id]); // Refetch when chain changes

  return {
    allMarkets,
    activeMarkets,
    allMarketsLoading: isLoading,
    activeMarketsLoading: isLoading,
    error,
    refetchAllMarkets: fetchMarkets,
    refetchActiveMarkets: fetchMarkets,
    getMarket,
    getUserPosition,
    connectedChain: chain,
    isPushNetwork: chain.id === 42101
  };
};