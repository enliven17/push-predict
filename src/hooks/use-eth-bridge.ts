import { useState } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';
import { toast } from 'sonner';

const ETH_BRIDGE_ABI = [
  "function bridgeForBet(string memory pushAddress, uint256 marketId, uint8 option) external payable",
  "function calculatePCAmount(uint256 ethAmount) external pure returns (uint256)",
  "function MIN_BRIDGE_AMOUNT() external view returns (uint256)",
  "function ETH_TO_PC_RATE() external view returns (uint256)",
  "event BridgeInitiated(address indexed user, uint256 ethAmount, uint256 pcAmount, string pushAddress, bytes32 indexed bridgeId)"
];

// Bridge receiver address (our main account to collect ETH)
const ETH_BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDRESS as string;
const ETH_TO_PC_RATE = 1000; // 1 ETH = 1000 PC

export interface BridgeParams {
  pcAmount: string;
  marketId: string;
  option: number;
  pushAddress: string;
}

export const useETHBridge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Calculate ETH amount needed for PC amount
  const calculateETHAmount = (pcAmount: string): string => {
    const pc = parseFloat(pcAmount);
    const eth = pc / ETH_TO_PC_RATE;
    return eth.toString();
  };

  // Calculate PC amount from ETH
  const calculatePCAmount = (ethAmount: string): string => {
    const eth = parseFloat(ethAmount);
    const pc = eth * ETH_TO_PC_RATE;
    return pc.toString();
  };

  // Bridge ETH for bet
  const bridgeForBet = async (params: BridgeParams): Promise<string> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);

      // Calculate ETH amount needed
      const ethAmount = calculateETHAmount(params.pcAmount);
      const ethAmountWei = ethers.parseEther(ethAmount);

      console.log('🌉 Bridging ETH for bet:', {
        pcAmount: params.pcAmount,
        ethAmount,
        marketId: params.marketId,
        option: params.option
      });

      // Send ETH payment to our bridge address
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      // Send ETH to our bridge address (simple transfer)
      const tx = await signer.sendTransaction({
        to: ETH_BRIDGE_ADDRESS,
        value: ethAmountWei
      });

      console.log('💰 ETH Bridge transaction:', tx.hash);
      toast.success(`ETH payment sent: ${tx.hash.slice(0, 10)}...`);

      // Don't wait for confirmation to prevent page refresh
      // Return transaction hash immediately as bridge ID
      const bridgeId = tx.hash;
      
      // Optionally wait for confirmation in background (non-blocking)
      tx.wait().then(() => {
        console.log('✅ Bridge transaction confirmed');
        toast.success(`Bridge confirmed: ${ethAmount} ETH → ${params.pcAmount} PC`);
      }).catch((error) => {
        console.error('❌ Bridge confirmation failed:', error);
        toast.error('Bridge confirmation failed');
      });
      
      return bridgeId;

    } catch (error: any) {
      console.error('❌ Bridge failed:', error);
      toast.error(`Bridge failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    calculateETHAmount,
    calculatePCAmount,
    bridgeForBet,
    ETH_TO_PC_RATE
  };
};