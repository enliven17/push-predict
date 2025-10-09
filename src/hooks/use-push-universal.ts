import { useState, useEffect } from 'react';
import { PushChain } from '@pushchain/core';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { toast } from 'sonner';

export interface UniversalBetParams {
  marketId: string;
  option: number;
  amount: string;
}

export const usePushUniversal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [universalSigner, setUniversalSigner] = useState<any>(null);
  const [pushClient, setPushClient] = useState<any>(null);
  
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Initialize Universal Signer when wallet changes
  useEffect(() => {
    const initializeUniversal = async () => {
      if (!walletClient || !address) {
        setUniversalSigner(null);
        setPushClient(null);
        return;
      }

      try {
        console.log('🔄 Initializing Universal Signer...');
        
        // Convert wallet client to ethers signer
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const ethersSigner = await provider.getSigner();
        
        // Create Universal Signer with Push Chain SDK
        const universal = await PushChain.utils.signer.toUniversal(ethersSigner);
        setUniversalSigner(universal);
        
        // Initialize Push Chain client
        const client = await PushChain.initialize({
          signer: universal,
          env: 'testnet'
        });
        setPushClient(client);
        
        console.log('✅ Universal Signer initialized for chain:', chainId);
        
      } catch (error: any) {
        console.error('❌ Failed to initialize Universal Signer:', error);
        setUniversalSigner(null);
        setPushClient(null);
      }
    };

    initializeUniversal();
  }, [walletClient, address, chainId]);

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

      // Sign message with current chain's signer
      const provider = new ethers.BrowserProvider(walletClient!.transport);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

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

      // Use Push Chain client or fallback to direct transaction
      let txResponse;
      
      if (pushClient && pushClient.tx && pushClient.tx.send) {
        // Use Push Chain client
        txResponse = await pushClient.tx.send(universalTx);
      } else {
        // Fallback: Send directly to Push Network
        const pushProvider = new ethers.JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
        const pushWallet = new ethers.Wallet(process.env.PRIVATE_KEY!, pushProvider);
        const pushContract = new ethers.Contract(
          contractAddress,
          ["function placeCrossChainBet(uint256 marketId, uint8 option, string originChain, address originAddress, bytes signature) payable"],
          pushWallet
        );
        
        txResponse = await pushContract.placeCrossChainBet(
          marketId,
          option,
          `eip155:${chainId}`,
          address,
          signature,
          { value: ethers.parseEther(amount), gasLimit: 500000 }
        );
      }

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
    pushClient,
    placeUniversalBet,
    chainInfo: getChainInfo(),
    isUniversalReady: !!universalSigner,
    connectedChain: chainId
  };
};