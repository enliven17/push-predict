// Push Network Universal Client Configuration
import { ethers } from 'ethers';

// Push Network Configuration
export const PUSH_NETWORK_CONFIG = {
  DONUT_TESTNET: {
    chainId: 42101,
    name: 'Push Chain Donut Testnet',
    rpcUrls: [
      'https://evm.rpc-testnet-donut-node1.push.org/',
      'https://evm.rpc-testnet-donut-node2.push.org/'
    ],
    blockExplorer: 'https://donut.push.network',
    nativeCurrency: {
      name: 'Push Coin',
      symbol: 'PC',
      decimals: 18
    }
  },
  UNIVERSAL_CONTRACTS: {
    EXECUTOR_FACTORY: '0x00000000000000000000000000000000000000eA',
    VERIFICATION_PRECOMPILE: '0x00000000000000000000000000000000000000ca'
  },
  GATEWAY_CONTRACTS: {
    ETHEREUM_SEPOLIA: '0x05bD7a3D18324c1F7e216f7fBF2b15985aE5281A',
    SOLANA_DEVNET: 'CFVSincHYbETh2k7w6u1ENEkjbSLtveRCEBupKidw2VS'
  },
  SUPPORTED_CHAINS: {
    PUSH_TESTNET: 'eip155:42101',
    ETHEREUM_SEPOLIA: 'eip155:11155111',
    SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
  }
};

// Create Push Network Provider
export const createPushProvider = () => {
  return new ethers.providers.JsonRpcProvider(
    PUSH_NETWORK_CONFIG.DONUT_TESTNET.rpcUrls[0]
  );
};

// Universal Signer Interface
export interface UniversalSigner {
  address: string;
  chainNamespace: string;
  originalAddress?: string;
  sign: (message: string) => Promise<string>;
  sendTransaction: (tx: any) => Promise<any>;
}

// Create Universal Signer (simplified version)
export const createUniversalSigner = async (
  privateKey: string,
  chainNamespace: string = PUSH_NETWORK_CONFIG.SUPPORTED_CHAINS.PUSH_TESTNET
): Promise<UniversalSigner> => {
  const provider = createPushProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  
  return {
    address: wallet.address,
    chainNamespace,
    sign: async (message: string) => {
      return await wallet.signMessage(message);
    },
    sendTransaction: async (tx: any) => {
      return await wallet.sendTransaction(tx);
    }
  };
};

// Cross-chain signature verification helper
export const verifyCrossChainSignature = async (
  message: string,
  signature: string,
  expectedAddress: string,
  chainNamespace: string
): Promise<boolean> => {
  try {
    // For EVM chains
    if (chainNamespace.startsWith('eip155:')) {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }
    
    // For Solana and other chains, implement specific verification
    // This is a placeholder - implement actual verification logic
    console.warn('Cross-chain verification not fully implemented for:', chainNamespace);
    return false;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

// Helper to get chain ID from namespace
export const getChainIdFromNamespace = (namespace: string): number => {
  const parts = namespace.split(':');
  if (parts[0] === 'eip155') {
    return parseInt(parts[1]);
  }
  return 0; // Non-EVM chains
};

// Helper to format chain namespace
export const formatChainNamespace = (chainId: number): string => {
  return `eip155:${chainId}`;
};

// Contract interaction helpers
export const getPushPredictContract = (
  contractAddress: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  // This would include the actual contract ABI
  // For now, return a placeholder
  return new ethers.Contract(contractAddress, [], signerOrProvider);
};

// Universal transaction builder
export const buildUniversalTransaction = (
  to: string,
  data: string,
  value: string = '0',
  chainNamespace: string = PUSH_NETWORK_CONFIG.SUPPORTED_CHAINS.PUSH_TESTNET
) => {
  return {
    to,
    data,
    value: ethers.utils.parseEther(value),
    chainNamespace,
    gasLimit: 500000, // Default gas limit
  };
};

export default {
  PUSH_NETWORK_CONFIG,
  createPushProvider,
  createUniversalSigner,
  verifyCrossChainSignature,
  getChainIdFromNamespace,
  formatChainNamespace,
  getPushPredictContract,
  buildUniversalTransaction
};