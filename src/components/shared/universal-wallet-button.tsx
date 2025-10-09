"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/constants";

// Supported chains for universal access
const UNIVERSAL_CHAINS = [
  {
    id: "push",
    name: "Push Network",
    namespace: "eip155:42101",
    icon: "🍩",
    color: "bg-pink-500"
  },
  {
    id: "ethereum",
    name: "Ethereum Sepolia", 
    namespace: "eip155:11155111",
    icon: "⟠",
    color: "bg-blue-500"
  },
  {
    id: "solana",
    name: "Solana Devnet",
    namespace: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", 
    icon: "◎",
    color: "bg-purple-500"
  }
];

export function UniversalWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [selectedChain, setSelectedChain] = useState(UNIVERSAL_CHAINS[0]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Chain Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`${selectedChain.color} text-white border-0 hover:opacity-80`}
            >
              <span className="mr-2">{selectedChain.icon}</span>
              <span className="hidden sm:inline">{selectedChain.name}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1F2C] border-gray-700">
            {UNIVERSAL_CHAINS.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                onClick={() => setSelectedChain(chain)}
                className="text-white hover:bg-[#0A0C14] cursor-pointer"
              >
                <span className="mr-2">{chain.icon}</span>
                {chain.name}
                {chain.id === selectedChain.id && (
                  <span className="ml-auto text-pink-400">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Info */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-pink-500/20 text-white hover:bg-pink-500/10">
              <Wallet className="mr-2 h-4 w-4" />
              {formatAddress(address)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1F2C] border-gray-700">
            <DropdownMenuItem 
              onClick={() => disconnect()}
              className="text-white hover:bg-[#0A0C14] cursor-pointer"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Universal Wallet
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1A1F2C] border-gray-700">
        {UNIVERSAL_CHAINS.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => {
              setSelectedChain(chain);
              // Connect to the selected chain
              const connector = connectors[0]; // Use first available connector
              if (connector) {
                connect({ connector });
              }
            }}
            className="text-white hover:bg-[#0A0C14] cursor-pointer"
          >
            <span className="mr-2">{chain.icon}</span>
            Connect via {chain.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}