import { ethers } from 'ethers';
import { UniversalSignatureVerifier } from './signature-verifier';
import { PUSH_NETWORK_CONFIG } from '@/utils/push/client';

export interface UniversalTransaction {
  marketId: string;
  option: number;
  amount: string;
  originChain: string;
  originAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  pushAddress?: string;
  error?: string;
}

export class UniversalTransactionHandler {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(contractAddress: string, contractABI: any[]) {
    this.provider = new ethers.providers.JsonRpcProvider(
      PUSH_NETWORK_CONFIG.DONUT_TESTNET.rpcUrls[0]
    );
    
    // Use admin wallet for executing cross-chain transactions
    const adminWallet = new ethers.Wallet(
      process.env.PRIVATE_KEY!,
      this.provider
    );
    
    this.contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
  }

  /**
   * Process universal cross-chain transaction
   */
  async processUniversalTransaction(
    transaction: UniversalTransaction
  ): Promise<TransactionResult> {
    try {
      // 1. Verify cross-chain signature
      const verificationResult = await UniversalSignatureVerifier.verifyCrossChainSignature({
        message: transaction.message,
        signature: transaction.signature,
        chainNamespace: transaction.originChain,
        originalAddress: transaction.originAddress
      });

      if (!verificationResult.isValid) {
        return {
          success: false,
          error: `Signature verification failed: ${verificationResult.error}`
        };
      }

      // 2. Generate or map Push Network address
      const pushAddress = await this.generatePushAddress(
        transaction.originChain,
        transaction.originAddress
      );

      // 3. Execute cross-chain bet on Push Network
      const txResult = await this.executeCrossChainBet(
        transaction,
        pushAddress
      );

      return {
        success: true,
        txHash: txResult.hash,
        pushAddress
      };

    } catch (error: any) {
      console.error('Universal transaction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate or retrieve Push Network address for cross-chain user
   */
  private async generatePushAddress(
    originChain: string,
    originAddress: string
  ): Promise<string> {
    // In production, this would use Universal Executor Factory
    // For now, we'll create a deterministic address mapping
    
    const seed = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['string', 'string'],
        [originChain, originAddress]
      )
    );

    // Generate deterministic wallet from seed
    const wallet = new ethers.Wallet(seed);
    return wallet.address;
  }

  /**
   * Execute cross-chain bet on Push Network contract
   */
  private async executeCrossChainBet(
    transaction: UniversalTransaction,
    pushAddress: string
  ): Promise<ethers.ContractTransaction> {
    
    // Convert amount to Wei
    const amountWei = ethers.utils.parseEther(transaction.amount);

    // Call placeCrossChainBet function
    const tx = await this.contract.placeCrossChainBet(
      transaction.marketId,
      transaction.option,
      transaction.originChain,
      transaction.originAddress,
      transaction.signature,
      {
        value: amountWei,
        gasLimit: 500000
      }
    );

    await tx.wait();
    return tx;
  }

  /**
   * Get supported chains
   */
  static getSupportedChains() {
    return [
      {
        namespace: 'eip155:42101',
        name: 'Push Network Donut Testnet',
        native: true,
        currency: 'PC'
      },
      {
        namespace: 'eip155:11155111',
        name: 'Ethereum Sepolia',
        native: false,
        currency: 'ETH',
        gateway: PUSH_NETWORK_CONFIG.GATEWAY_CONTRACTS.ETHEREUM_SEPOLIA
      },
      {
        namespace: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        name: 'Solana Devnet',
        native: false,
        currency: 'SOL',
        gateway: PUSH_NETWORK_CONFIG.GATEWAY_CONTRACTS.SOLANA_DEVNET
      }
    ];
  }

  /**
   * Estimate cross-chain transaction fee
   */
  async estimateCrossChainFee(
    originChain: string,
    amount: string
  ): Promise<{ fee: string; currency: string }> {
    const chains = UniversalTransactionHandler.getSupportedChains();
    const chain = chains.find(c => c.namespace === originChain);

    if (!chain) {
      throw new Error(`Unsupported chain: ${originChain}`);
    }

    if (chain.native) {
      // Native Push Network - only gas fee
      return {
        fee: '0.001',
        currency: 'PC'
      };
    }

    // Cross-chain fee (bridge + gas)
    const bridgeFee = parseFloat(amount) * 0.003; // 0.3% bridge fee
    const gasFee = 0.005; // Fixed gas fee

    return {
      fee: (bridgeFee + gasFee).toFixed(6),
      currency: chain.currency
    };
  }
}