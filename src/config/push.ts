// Export Push Network chain definitions for wagmi/viem
export const pushTestnet = {
  id: 42101,
  name: "Push Chain Donut Testnet",
  nativeCurrency: { name: "Push Coin", symbol: "PC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://evm.rpc-testnet-donut-node1.push.org/",
        "https://evm.rpc-testnet-donut-node2.push.org/"
      ],
    },
    public: {
      http: [
        "https://evm.rpc-testnet-donut-node1.push.org/",
        "https://evm.rpc-testnet-donut-node2.push.org/"
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Push Chain Explorer",
      url: "https://donut.push.network",
    },
  },
  // Universal features
  contracts: {
    universalExecutorFactory: {
      address: "0x00000000000000000000000000000000000000eA",
    },
    universalVerificationPrecompile: {
      address: "0x00000000000000000000000000000000000000ca",
    },
  },
  // Gateway contracts for cross-chain
  gateways: {
    ethereumSepolia: "0x05bD7a3D18324c1F7e216f7fBF2b15985aE5281A",
    solanaDevnet: "CFVSincHYbETh2k7w6u1ENEkjbSLtveRCEBupKidw2VS",
  },
  // Supported chain namespaces
  supportedChains: [
    "eip155:42101", // Push Testnet
    "eip155:11155111", // Ethereum Sepolia
    "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // Solana Devnet
  ],
} as const;

export type PushChain = typeof pushTestnet;

// Legacy export for backward compatibility
export const creditcoinTestnet = pushTestnet;
export type CreditcoinChain = typeof pushTestnet;