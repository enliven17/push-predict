# PushPredict Architecture Diagrams

This document contains Mermaid diagrams that visualize the architecture and flows of the PushPredict universal cross-chain prediction market platform.

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        WC[Wallet Connectors]
        UH[Universal Hooks]
    end
    
    subgraph "Backend APIs"
        API[Next.js API Routes]
        SB[Supabase Database]
    end
    
    subgraph "Push Network"
        PC[PredictionMarket Contract]
        PN[Push Network Donut Testnet]
    end
    
    subgraph "Ethereum Sepolia"
        EB[ETH Bridge Contract]
        ES[Ethereum Sepolia Network]
    end
    
    subgraph "Solana Devnet"
        SD[Solana Devnet]
        SW[Solana Wallet]
    end
    
    UI --> WC
    WC --> UH
    UH --> API
    API --> SB
    API --> PC
    PC --> PN
    
    UH --> EB
    EB --> ES
    
    UH --> SD
    SD --> SW
    
    PC --> SB
    EB --> PC
```

## 2. Universal Cross-Chain Betting Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant W as Wallet
    participant B as ETH Bridge
    participant P as Push Contract
    participant S as Supabase
    
    U->>F: Select market & bet option
    F->>U: Show universal bet dialog
    U->>F: Choose chain (ETH/SOL/Push)
    
    alt Ethereum Sepolia
        F->>W: Connect to Ethereum
        U->>W: Approve ETH payment
        W->>B: Send ETH to bridge
        B->>P: Bridge ETH to PC tokens
        P->>P: Execute bet with PC
    else Solana Devnet
        F->>W: Connect to Solana
        U->>W: Sign cross-chain message
        F->>P: Submit signature to Push
        P->>P: Verify & execute sponsored bet
    else Push Network
        F->>W: Connect to Push
        U->>W: Direct PC token payment
        W->>P: Execute bet directly
    end
    
    P->>S: Sync bet activity
    S->>F: Update UI with new bet
    F->>U: Show success confirmation
```

## 3. ETH Bridge Architecture

```mermaid
graph LR
    subgraph "Ethereum Sepolia"
        U[User Wallet]
        EB[ETH Bridge Contract]
        ETH[ETH Payment]
    end
    
    subgraph "Push Network"
        US[Universal Signer]
        PC[PredictionMarket Contract]
        PCT[PC Tokens]
    end
    
    subgraph "Backend"
        API[Bridge API]
        DB[Database]
    end
    
    U -->|1. Pay ETH| EB
    EB -->|2. Emit Event| API
    API -->|3. Verify Payment| DB
    API -->|4. Trigger Bridge| US
    US -->|5. Send PC Tokens| PC
    PC -->|6. Execute Bet| PCT
```

## 4. Database Schema Relationships

```mermaid
erDiagram
    MARKETS {
        string id PK
        string title
        string description
        string creator
        timestamp created_at
        timestamp end_time
        int status
        string option_a
        string option_b
    }
    
    BET_ACTIVITIES {
        string id PK
        string market_id FK
        string user_address
        decimal amount
        decimal shares
        int option
        string tx_hash
        timestamp created_at
    }
    
    COMMENTS {
        string id PK
        int market_id FK
        string user_address
        text content
        timestamp created_at
    }
    
    BRIDGE_TRANSACTIONS {
        string id PK
        string eth_tx_hash
        string push_tx_hash
        string user_address
        decimal eth_amount
        decimal pc_amount
        string status
        timestamp created_at
    }
    
    MARKETS ||--o{ BET_ACTIVITIES : "has many"
    MARKETS ||--o{ COMMENTS : "has many"
    BET_ACTIVITIES }o--|| BRIDGE_TRANSACTIONS : "may have"
```

## 5. Universal Wallet Connection Flow

```mermaid
flowchart TD
    A[User Clicks Connect] --> B{Detect Available Wallets}
    
    B --> C[MetaMask/Rainbow - Ethereum]
    B --> D[Phantom/Solflare - Solana]
    B --> E[Push Wallet - Push Network]
    
    C --> F[Connect to Ethereum Sepolia]
    D --> G[Connect to Solana Devnet]
    E --> H[Connect to Push Network]
    
    F --> I[Check ETH Balance]
    G --> J[Check SOL Balance]
    H --> K[Check PC Balance]
    
    I --> L[Enable ETH Bridge Betting]
    J --> M[Enable Cross-Chain Signing]
    K --> N[Enable Direct PC Betting]
    
    L --> O[Universal Interface Ready]
    M --> O
    N --> O
```

## 6. Market Resolution Process

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> PendingResolution : Market End Time Reached
    Active --> Resolved : Admin Resolves Early
    PendingResolution --> Resolved : Admin Resolves Market
    
    state Active {
        [*] --> AcceptingBets
        AcceptingBets --> UpdatingPrices : New Bet Placed
        UpdatingPrices --> AcceptingBets : Prices Updated
    }
    
    state Resolved {
        [*] --> WinnersCalculated
        WinnersCalculated --> PayoutsAvailable
        PayoutsAvailable --> ClaimingWinnings
        ClaimingWinnings --> [*] : All Claims Processed
    }
    
    Resolved --> [*]
```

## 7. Cross-Chain Transaction Verification

```mermaid
graph TD
    A[Cross-Chain Transaction Initiated] --> B{Transaction Type}
    
    B -->|ETH Bridge| C[Verify ETH Payment on Sepolia]
    B -->|Solana Signature| D[Verify Signature on Push]
    B -->|Direct Push| E[Verify PC Payment on Push]
    
    C --> F[Check Bridge Contract Event]
    D --> G[Validate Cross-Chain Signature]
    E --> H[Confirm Push Transaction]
    
    F --> I{Payment Verified?}
    G --> I
    H --> I
    
    I -->|Yes| J[Execute Bet on Push Contract]
    I -->|No| K[Reject Transaction]
    
    J --> L[Update Database]
    K --> M[Return Error to User]
    
    L --> N[Sync with Frontend]
    M --> O[Show Error Message]
```

## 8. Universal Hook System Architecture

```mermaid
graph TB
    subgraph "Universal Hooks Layer"
        UCR[useUniversalContractRead]
        UT[useUniversalTransactions]
        UEB[useEthBridge]
        UP[usePushUniversal]
    end
    
    subgraph "Chain-Specific Hooks"
        PC[usePredictionContract]
        WH[Wagmi Hooks]
        SH[Solana Hooks]
    end
    
    subgraph "Transaction Handler"
        TH[TransactionHandler]
        SV[SignatureVerifier]
    end
    
    subgraph "Network Detection"
        ND[Network Detection]
        CS[Chain Switching]
    end
    
    UCR --> PC
    UCR --> WH
    UT --> TH
    UEB --> WH
    UP --> SH
    
    TH --> SV
    TH --> ND
    ND --> CS
    
    PC --> WH
```

## 9. Real-Time Data Synchronization

```mermaid
sequenceDiagram
    participant BC as Blockchain
    participant API as Backend API
    participant DB as Supabase
    participant FE as Frontend
    participant U as User
    
    BC->>API: New transaction event
    API->>DB: Store transaction data
    DB->>API: Confirm storage
    API->>FE: Real-time update via polling
    FE->>U: Update UI with new data
    
    Note over API,DB: Auto-refresh every 30s
    
    U->>FE: Manual refresh action
    FE->>API: Fetch latest data
    API->>DB: Query recent activities
    DB->>API: Return fresh data
    API->>FE: Send updated information
    FE->>U: Display current state
```

## 10. Security & Verification Flow

```mermaid
flowchart TD
    A[User Transaction] --> B[Input Validation]
    B --> C{Valid Input?}
    C -->|No| D[Reject & Return Error]
    C -->|Yes| E[Signature Verification]
    
    E --> F{Valid Signature?}
    F -->|No| D
    F -->|Yes| G[Cross-Chain Verification]
    
    G --> H{Chain Verified?}
    H -->|No| D
    H -->|Yes| I[Balance Check]
    
    I --> J{Sufficient Balance?}
    J -->|No| D
    J -->|Yes| K[Execute Transaction]
    
    K --> L[Update State]
    L --> M[Emit Events]
    M --> N[Success Response]
    
    D --> O[Log Security Event]
```

## 11. Pyth Network Price Feed Integration

```mermaid
graph TB
    subgraph "Pyth Network"
        PH[Pyth Hermes API]
        PF[Price Feeds]
        PD[Price Data]
    end
    
    subgraph "PushPredict Frontend"
        PC[Price Client]
        PH_HOOK[usePythPrices Hook]
        PD_COMP[Price Display Components]
        MD[Market Detail Page]
        MP[Markets Page]
    end
    
    subgraph "Price Feed IDs"
        BTC[BTC/USD Feed]
        ETH[ETH/USD Feed]
        SOL[SOL/USD Feed]
        USDC[USDC/USD Feed]
        USDT[USDT/USD Feed]
    end
    
    PH --> PC
    PF --> PH
    PD --> PF
    
    PC --> PH_HOOK
    PH_HOOK --> PD_COMP
    PD_COMP --> MD
    PD_COMP --> MP
    
    BTC --> PF
    ETH --> PF
    SOL --> PF
    USDC --> PF
    USDT --> PF
    
    Note1[Real-time updates every 5 seconds]
    Note2[Automatic price detection for crypto markets]
    Note3[Professional-grade financial data]
```

## 12. Live Price Display Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant PH as Pyth Hook
    participant PA as Pyth API
    participant PC as Price Component
    
    U->>F: Visit Markets Page
    F->>PH: Initialize useCryptoPrices()
    PH->>PA: Fetch latest prices
    PA->>PH: Return price data
    PH->>PC: Update price components
    PC->>U: Display live prices
    
    loop Every 5 seconds
        PH->>PA: Refetch prices
        PA->>PH: Return updated data
        PH->>PC: Update displays
        PC->>U: Show new prices
    end
    
    U->>F: View Market Detail
    F->>PH: Check market title for crypto
    PH->>PA: Fetch specific price feed
    PA->>PH: Return market price
    PH->>PC: Display market-specific price
    PC->>U: Show live price for market asset
```

---

*These diagrams provide a comprehensive overview of the PushPredict universal cross-chain prediction market architecture, including Pyth Network integration for real-time price feeds, showing how different components interact to enable seamless betting across Ethereum Sepolia, Solana Devnet, and Push Network.*