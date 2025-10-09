require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    push_testnet: {
      url: process.env.PUSH_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/',
      chainId: 42101,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    push_testnet_alt: {
      url: process.env.PUSH_RPC_URL_ALT || 'https://evm.rpc-testnet-donut-node2.push.org/',
      chainId: 42101,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Keep Ethereum Sepolia for cross-chain testing
    ethereum_sepolia: {
      url: 'https://gateway.tenderly.co/public/sepolia',
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};