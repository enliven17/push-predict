# PushPredict Architecture Diagrams

This document contains Mermaid diagrams that visualize the architecture and flows of the PushPredict universal cross-chain prediction market platform with Push UI Kit integration.

## 1. System Architecture Overview (Updated with Push UI Kit)

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        PUK[Push UI Kit]
        PWP[PushUniversalWalletProvider]
        PUB[PushUniversalAccountButton]
        UH[Universal Hooks]
    end
    
    subgraph "Push UI Kit Components"
        PWC[usePushWalletContext]
        PCC[usePushChainClient]
        PUC[Push Universal Client]
    end
    
    subgraph "Backend APIs"
        API[Next.js API Routes]
        SB[Supabase Database]
        QC[QueryClient Provider]
    end
    
    subgraph "Push Network"
        PC[PredictionMarket Contract]
        PN[Push Network Donut Testnet]
        PCS[Push Chain SDK]
    end
    
    subgraph "Cross-Chain Support"
        EB[ETH Bridge Contract]
        ES[Ethereum Sepolia Network]
        SD[Solana Devnet]
    end
    
    UI --> PUK
    PUK --> PWP
    PWP --> PUB
    PWP --> PWC
    PWC --> PCC
    PCC --> PUC
    PUC --> PCS
    
    UH --> PWC
    UH --> PCC
    UH --> API
    API --> QC
    API --> SB
    
    PCS --> PC
    PC --> PN
    
    UH --> EB
    EB --> ES
    UH --> SD
    
    PC --> SB
```

## 2. Push UI Kit Wallet Connection Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PUB as PushUniversalAccountButton
    participant PWP as PushUniversalWalletProvider
    participant PCC as usePushChainClient
    participant PCS as Push Chain SDK
    participant PN as Push Network
    
    U->>PUB: Click Connect Wallet
    PUB->>PWP: Trigger connection modal
    PWP->>U: Show wallet options (Email, Google, Wallet)
    U->>PWP: Select connection method
    
    alt Email/Google Login
        PWP->>PCS: Create universal account
        PCS->>PN: Initialize Push account
        PN->>PCS: Return account details
    else External Wallet
        PWP->>PCS: Connect external wallet
        PCS->>PN: Create universal signer
        PN->>PCS: Return signer details
    end
    
    PCS->>PCC: Initialize Push Chain client
    PCC->>PWP: Update connection status
    PWP->>PUB: Update button state
    PUB->>U: Show connected state
```

## 3. Push UI Kit Transaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant BD as BetDialog
    participant PWC as usePushWalletContext
    participant PCC as usePushChainClient
    participant PCS as Push Chain SDK
    participant PC as Push Contract
    participant SB as Supabase
    
    U->>BD: Place bet
    BD->>PWC: Check connection status
    PWC->>BD: Return CONNECTED status
    BD->>PCC: Get Push Chain client
    PCC->>BD: Return client instance
    
    BD->>PCS: Prepare transaction
    PCS->>U: Request transaction approval
    U->>PCS: Approve transaction
    PCS->>PC: Send transaction to contract
    PC->>PCS: Return transaction hash
    
    PCS->>BD: Transaction confirmed
    BD->>SB: Record bet activity
    SB->>BD: Confirm storage
    BD->>U: Show success modal
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

## 5. Push UI Kit Universal Connection Flow

```mermaid
flowchart TD
    A[User Clicks PushUniversalAccountButton] --> B[Push UI Kit Modal Opens]
    
    B --> C{Login Method Selection}
    
    C --> D[Email Login]
    C --> E[Google OAuth]
    C --> F[External Wallet]
    
    D --> G[Email Verification]
    E --> H[Google Authentication]
    F --> I{Wallet Type Detection}
    
    I --> J[MetaMask/Ethereum]
    I --> K[Phantom/Solana]
    I --> L[Other Web3 Wallets]
    
    G --> M[Create Push Universal Account]
    H --> M
    J --> N[Connect External Wallet]
    K --> N
    L --> N
    
    M --> O[Initialize Push Chain Client]
    N --> P[Create Universal Signer]
    
    O --> Q[usePushChainClient Ready]
    P --> Q
    
    Q --> R[Update usePushWalletContext]
    R --> S[Enable Betting Interface]
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

## 8. Push UI Kit Hook System Architecture

```mermaid
graph TB
    subgraph "Push UI Kit Hooks"
        PWC[usePushWalletContext]
        PCC[usePushChainClient]
        PUC[Push Universal Client]
    end
    
    subgraph "Application Hooks"
        UCR[useUniversalContractRead]
        UT[useUniversalTransactions]
        UEB[useEthBridge]
        UPC[usePredictionContract]
        UCO[useContractOwner]
    end
    
    subgraph "Push Chain SDK"
        PCS[Push Chain SDK]
        US[Universal Signer]
        ST[Send Transaction]
        SM[Sign Message]
    end
    
    subgraph "Legacy Support (Removed)"
        WH[Wagmi Hooks - REMOVED]
        RK[RainbowKit - REMOVED]
        VM[Viem - REMOVED]
    end
    
    PWC --> PCC
    PCC --> PUC
    PUC --> PCS
    
    UCR --> PWC
    UCR --> PCC
    UT --> PWC
    UT --> PCC
    UEB --> PWC
    UEB --> PCC
    UPC --> PWC
    UPC --> PCC
    UCO --> PWC
    UCO --> PCC
    
    PCS --> US
    PCS --> ST
    PCS --> SM
    
    style WH fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style RK fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style VM fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
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

## 13. Push UI Kit Integration Summary

```mermaid
graph TB
    subgraph "Before: Wagmi + RainbowKit"
        OWP[Web3Provider with Wagmi]
        ORK[RainbowKit ConnectButton]
        OWH[Wagmi Hooks]
        OV[Viem for transactions]
    end
    
    subgraph "After: Push UI Kit"
        NWP[Web3Provider with Push UI Kit]
        NPB[PushUniversalAccountButton]
        NPH[Push UI Kit Hooks]
        NPS[Push Chain SDK]
    end
    
    subgraph "Migration Benefits"
        UE[Universal Experience]
        SM[Simplified Management]
        NW[Native Push Network]
        CC[Cross-Chain Ready]
    end
    
    OWP -.->|Replaced by| NWP
    ORK -.->|Replaced by| NPB
    OWH -.->|Replaced by| NPH
    OV -.->|Replaced by| NPS
    
    NWP --> UE
    NPB --> SM
    NPH --> NW
    NPS --> CC
    
    style OWP fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style ORK fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style OWH fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style OV fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    
    style NWP fill:#ccffcc,stroke:#00ff00
    style NPB fill:#ccffcc,stroke:#00ff00
    style NPH fill:#ccffcc,stroke:#00ff00
    style NPS fill:#ccffcc,stroke:#00ff00
```

---

*These diagrams provide a comprehensive overview of the PushPredict universal cross-chain prediction market architecture, now fully integrated with Push UI Kit for seamless wallet management and native Push Network support. The migration from Wagmi/RainbowKit to Push UI Kit enables better user experience with universal account creation, cross-chain compatibility, and simplified wallet management.*