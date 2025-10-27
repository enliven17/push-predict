# PushPredict 🌐

The world's first **Universal Cross-Chain Prediction Market** platform powered by Push Network's revolutionary technology and Push UI Kit. Trade on real-world events with seamless universal wallet integration and cross-chain interactions.

## 🌟 Universal Features

- **🌐 Push Universal Wallet** - Seamless multi-chain wallet integration with Push UI Kit
- **🔄 Universal Authentication** - Email, Google, and Web3 wallet login options
- **⚡ Push Chain Client** - Direct integration with Push Network's universal blockchain
- **🎯 Binary Prediction Markets** - Trade on Yes/No outcomes with PC tokens
- **📊 Live Price Feeds** - Real-time crypto prices powered by Pyth Network
- **📈 Real-time Activity** - Live betting tracking and market updates
- **👤 Universal Dashboard** - Complete betting history and portfolio management
- **💬 Comments System** - Market discussions and community engagement
- **🔧 Admin Controls** - Market creation and resolution tools
- **📱 Responsive Design** - Mobile-first UI with Push Network theme

## 🚀 Universal Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Universal Blockchain**: Push Network Donut Testnet
- **Wallet Integration**: Push UI Kit (@pushchain/ui-kit)
- **Universal SDK**: @pushchain/core for blockchain interactions
- **Price Feeds**: Pyth Network (Real-time crypto prices)
- **Smart Contracts**: Solidity with Push Network integration
- **Database**: Supabase (PostgreSQL) with universal schema
- **State Management**: Zustand with Push Wallet Context
- **UI Components**: Radix UI, Lucide Icons with Push Network theme
- **Authentication**: Push Universal Wallet (Email, Google, Web3)

## 🔗 Network Information

### 🍩 Push Network (Primary)
- **Network**: Push Network Donut Testnet (Chain ID: 42101)
- **Token**: PC (Push Coin)
- **RPC**: https://evm.rpc-testnet-donut-node1.push.org/
- **Explorer**: https://donut.push.network
- **Contract**: `0x0fA9052a598799d8ef7061bd74915E92532E5DE9`
- **Wallet Integration**: Push UI Kit with Universal Wallet

### 📊 Pyth Network (Price Feeds)
- **Service**: Real-time price data provider
- **API**: Hermes API (https://hermes.pyth.network)
- **Update Frequency**: Every 5 seconds
- **Supported Assets**: BTC, ETH, SOL, USDC, USDT
- **Integration**: Automatic price detection for crypto markets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Push Universal Wallet (Email, Google, or Web3 wallet)
- **PC tokens** (Push Network) - Primary currency
- Push UI Kit integration for seamless wallet experience

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
# Push Network Configuration
NEXT_PUBLIC_PUSH_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0fA9052a598799d8ef7061bd74915E92532E5DE9
NEXT_PUBLIC_ADMIN_ADDRESS=<admin_wallet_address>
NEXT_PUBLIC_PUSH_CHAIN_ID=42101

# Push UI Kit Configuration
# No additional configuration needed - Push UI Kit handles wallet connections

# Private Keys (Server-side)
PRIVATE_KEY=<main_account_private_key>

# Supabase Database
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
NEXT_PUBLIC_ADMIN_ADDRESS=your_admin_address

# Private variables (server-side only)
PRIVATE_KEY=your_private_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📱 Usage Guide

### 🌐 For Users
1. **Connect with Push Universal Wallet** - Email, Google, or Web3 wallet options
2. **Automatic Push Network Setup** - Seamless connection to Push Chain
3. **Browse Prediction Markets** - Explore available betting opportunities
4. **Place Bets with PC Tokens** - Direct betting on Push Network
5. **Track Performance** - View complete betting history and portfolio
6. **Claim Winnings** - Collect rewards from successful predictions
7. **Join Discussions** - Comment and engage with the community

### 🔧 For Admins
1. **Create Markets** - Set up new prediction markets
2. **Monitor Activity** - Track platform usage and statistics
3. **Resolve Markets** - Determine outcomes and distribute winnings
4. **Manage Platform** - Oversee all market operations

## 🏗️ Universal Smart Contract

### PushPredict Contract Details
- **Address**: `0x0fA9052a598799d8ef7061bd74915E92532E5DE9`
- **Network**: Push Network Donut Testnet
- **Platform Fee**: 2.5%
- **Min Bet**: 0.01 PC
- **Max Bet**: 10 PC

### Push Network Integration Features
- **✅ Push UI Kit Integration** - Seamless wallet connection
- **✅ Universal Authentication** - Multiple login methods
- **✅ Push Chain Client** - Direct blockchain interaction
- **✅ PC Token Betting** - Native Push Network currency
- **✅ Real-time Updates** - Live market data and activity

### Available Scripts
```bash
# Contract Deployment
npx hardhat run scripts/deploy.js --network push_testnet

# Market Management
node scripts/create-eth-market.js    # Create ETH prediction market
node scripts/create-btc-market.js    # Create BTC prediction market
node scripts/resolve-market.js       # Resolve market outcomes

# Push Network Testing
node scripts/test-push-universal.js     # Test Push Network features
node scripts/test-real-universal-bet.js # Test betting functionality

# Database Management
node scripts/sync-markets-to-supabase.js # Sync blockchain to database
node scripts/check-bet-activities.js     # Check bet activity records
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
