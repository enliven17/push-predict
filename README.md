# PushPredict 🌐

The world's first **Universal Cross-Chain Prediction Market** platform powered by Push Network's revolutionary technology. Trade on real-world events from any supported blockchain with seamless cross-chain interactions.

## 🌟 Universal Features

- **🌐 Universal Cross-Chain** - Bet from Ethereum, Solana, or Push Network
- **🔄 Real Cross-Chain Bridge** - Pay ETH, bet with PC tokens automatically
- **⚡ Universal Signer** - Sign once, execute anywhere with Push Network SDK
- **🎯 Binary Prediction Markets** - Trade on Yes/No outcomes across chains
- **📊 Live Price Feeds** - Real-time crypto prices powered by Pyth Network
- **📈 Real-time Activity** - Live cross-chain bet tracking and updates
- **👤 Universal Dashboard** - Complete multi-chain betting history
- **💬 Comments System** - Market discussions and community engagement
- **🔧 Admin Controls** - Universal market creation and resolution
- **📱 Responsive Design** - Mobile-first UI with Push Network theme

## 🚀 Universal Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Universal Blockchain**: Push Network Donut Testnet (Primary)
- **Price Feeds**: Pyth Network (Real-time crypto prices)
- **Cross-Chain Support**: Ethereum Sepolia, Solana Devnet
- **Universal SDK**: @pushchain/core for cross-chain interactions
- **Smart Contracts**: Solidity with Universal Cross-Chain features
- **Wallet**: RainbowKit + wagmi (Multi-chain compatibility)
- **Database**: Supabase (PostgreSQL) with cross-chain schema
- **State Management**: Zustand with universal state
- **UI Components**: Radix UI, Lucide Icons with Push Network theme

## 🔗 Universal Network Links

### 🍩 Push Network (Primary)
- **Network**: Push Network Donut Testnet (Chain ID: 42101)
- **Token**: PC (Push Coin)
- **RPC**: https://evm.rpc-testnet-donut-node1.push.org/
- **Explorer**: https://donut.push.network
- **Contract**: `0x0fA9052a598799d8ef7061bd74915E92532E5DE9`

### ⟠ Ethereum Sepolia (Cross-Chain)
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Token**: ETH (Testnet Ether)
- **Bridge**: ETH → PC automatic conversion
- **Explorer**: https://sepolia.etherscan.io

### ◎ Solana Devnet (Cross-Chain)
- **Network**: Solana Devnet
- **Token**: SOL (Testnet Solana)
- **Bridge**: SOL → PC automatic conversion
- **Explorer**: https://explorer.solana.com/?cluster=devnet

### 📊 Pyth Network (Price Feeds)
- **Service**: Real-time price data provider
- **API**: Hermes API (https://hermes.pyth.network)
- **Update Frequency**: Every 5 seconds
- **Supported Assets**: BTC, ETH, SOL, USDC, USDT
- **Integration**: Automatic price detection for crypto markets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- **PC tokens** (Push Network) - Primary currency
- **ETH** (Ethereum Sepolia) - For cross-chain betting
- **SOL** (Solana Devnet) - For cross-chain betting

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd push-predict
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Configure your environment variables
```

4. **Run development server**
```bash
npm run dev
```

5. **Open application**
```
http://localhost:3000
```

### Environment Variables
```env
# Push Network (Primary)
NEXT_PUBLIC_PUSH_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0fA9052a598799d8ef7061bd74915E92532E5DE9
NEXT_PUBLIC_ADMIN_ADDRESS=<admin_wallet_address>
NEXT_PUBLIC_PUSH_CHAIN_ID=42101

# Universal Cross-Chain Bridge
NEXT_PUBLIC_ETH_BRIDGE_ADDRESS=<bridge_address>
NEXT_PUBLIC_UNIVERSAL_SIGNER_ADDRESS=<universal_signer_address>

# Private Keys (Server-side)
PRIVATE_KEY=<main_account_private_key>
UNIVERSAL_SIGNER_PRIVATE_KEY=<universal_signer_private_key>

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_project_id>

# Supabase (Universal Database)
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pyth Network (Price Feeds)
# No API key required - uses public Hermes API
# Automatic integration for crypto price feeds
```

## 🌐 Deployment

### Live Demo
🚀 **Production URL**: https://push-predict.vercel.app


### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy the project**
```bash
vercel --prod
```

4. **Set environment variables in Vercel Dashboard**
- Go to your project settings in Vercel
- Add all environment variables from `.env.example`
- Make sure to set production values

5. **Redeploy after setting environment variables**
```bash
vercel --prod
```

### Environment Variables for Production

Required environment variables for Vercel deployment:

```bash
# Public variables (safe to expose)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0fA9052a598799d8ef7061bd74915E92532E5DE9
NEXT_PUBLIC_PUSH_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_PUSH_CHAIN_ID=42101
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Private variables (server-side only)
PRIVATE_KEY=your_private_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
UNIVERSAL_SIGNER_PRIVATE_KEY=your_universal_signer_private_key
```

## 📱 Universal Usage

### 🌐 For Cross-Chain Users
1. **Connect Any Wallet** - MetaMask, Phantom, or any Web3 wallet
2. **Choose Your Chain** - Push Network, Ethereum Sepolia, or Solana Devnet
3. **Browse Universal Markets** - Explore cross-chain prediction markets
4. **Place Universal Bets** - 
   - **Push Network**: Direct PC token betting
   - **Ethereum Sepolia**: Pay ETH → Auto-bridge to PC
   - **Solana Devnet**: Pay SOL → Auto-bridge to PC
5. **Track Multi-Chain Performance** - View universal betting history
6. **Claim Universal Winnings** - Collect rewards across all chains
7. **Join Global Discussions** - Comment from any supported chain

### 🔧 For Admins
1. **Create Universal Markets** - Set up cross-chain prediction markets
2. **Manage Multi-Chain Activity** - Monitor all supported networks
3. **Resolve Universal Markets** - Determine outcomes for all participants
4. **Track Universal Statistics** - Platform-wide cross-chain analytics

## 🏗️ Universal Smart Contract

### PushPredict Contract Details
- **Address**: `0x0fA9052a598799d8ef7061bd74915E92532E5DE9`
- **Network**: Push Network Donut Testnet
- **Platform Fee**: 2.5%
- **Min Bet**: 0.01 PC
- **Max Bet**: 10 PC

### Universal Cross-Chain Features
- **✅ Cross-Chain Bet Placement** - `placeCrossChainBet()`
- **✅ Universal Signature Verification** - Push Network SDK integration
- **✅ Multi-Chain User Mapping** - Automatic address mapping
- **✅ Universal Market Creation** - `createUniversalMarket()`
- **✅ Cross-Chain Event Emission** - Universal activity tracking

### Available Scripts
```bash
# Universal Contract Deployment
npx hardhat run scripts/deploy.js --network push_testnet

# Universal Market Management
node scripts/create-eth-market.js    # Create ETH prediction market
node scripts/create-btc-market.js    # Create BTC prediction market
node scripts/resolve-market.js       # Resolve market outcomes

# Universal Cross-Chain Testing
node scripts/test-push-universal.js     # Test Push Network universal features
node scripts/test-real-universal-bet.js # Test real cross-chain betting
node scripts/fund-universal-signer.js   # Fund universal signer

# Database Management
node scripts/sync-markets-to-supabase.js # Sync blockchain to database
node scripts/check-bet-activities.js     # Check bet activity records

# Universal Bridge Testing
node scripts/check-universal-signer.js   # Check signer balance
node scripts/check-markets.js            # Verify market data
```

## 🗄️ Universal Database Schema

The application uses Supabase for cross-chain data storage:
- **🌐 Universal Markets** - Cross-chain market information
- **🔄 Cross-Chain Bet Activities** - Multi-blockchain betting history
- **👥 Universal Users** - Cross-chain user profiles and mapping
- **💬 Universal Comments** - Multi-chain market discussions
- **📊 Cross-Chain Analytics** - Universal platform statistics

### Setup Universal Database:
```sql
-- Execute supabase-schema.sql in your Supabase SQL Editor
-- Includes cross-chain tables with foreign key relationships
-- Supports multi-blockchain user activities and positions
```

### Key Universal Tables:
- `markets` - Universal market data with supported_chains
- `bet_activities` - Cross-chain betting records with chain_namespace
- `user_positions` - Multi-chain user positions with original_address
- `users` - Universal user profiles with chain mapping

## 🎨 Architecture

See [diagrams.md](./diagrams.md) for detailed system architecture and flow diagrams.

## 🛠️ Development

### Project Structure
```
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── providers/          # Context providers
│   └── types/              # TypeScript definitions
├── contracts/              # Solidity smart contracts
├── scripts/               # Deployment and utility scripts
└── public/               # Static assets
```

### Key Components
- **Market Cards** - Display market information
- **Bet Dialog** - Handle bet placement with validation
- **Activity Feed** - Show real-time betting activity
- **Comments System** - Enable market discussions
- **Admin Dashboard** - Market management tools

## 🔐 Security

- **Smart Contract Audited** - Comprehensive security review
- **Input Validation** - Client and server-side validation
- **Rate Limiting** - API protection against abuse
- **Wallet Security** - Non-custodial, user-controlled funds
- **Region Restrictions** - Compliance with local regulations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Universal Cross-Chain Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Ethereum       │    │  Push Network   │    │  Solana         │
│  Sepolia        │    │  (Primary)      │    │  Devnet         │
│                 │    │                 │    │                 │
│  ETH Payment    │───▶│  PC Betting     │◀───│  SOL Payment    │
│  User Signs     │    │  Contract Exec  │    │  User Signs     │
│  Bridge Auto    │    │  Universal SDK  │    │  Bridge Auto    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Universal      │
                    │  Database       │
                    │  (Supabase)     │
                    └─────────────────┘
```

## 🙏 Universal Acknowledgments

- **🍩 Push Network Team** - For revolutionary universal blockchain technology
- **⟠ Ethereum Foundation** - For robust cross-chain infrastructure  
- **◎ Solana Labs** - For high-performance blockchain integration
- **🌈 RainbowKit** - For excellent multi-chain wallet UX
- **🗄️ Supabase** - For reliable universal database and real-time features
- **⚡ Vercel** - For seamless deployment and hosting

## 📞 Universal Support

- **🌐 Universal Documentation**: [Learn Page](http://localhost:3000/learn)
- **🔧 Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **💬 Community**: [Push Network Discord](https://discord.gg/pushnetwork)
- **🍩 Push Network**: [Official Website](https://push.network)

---

**🌐 Built with ❤️ for the Universal Cross-Chain Future**  
**Powered by Push Network's Revolutionary Technology**
enliven 2025
