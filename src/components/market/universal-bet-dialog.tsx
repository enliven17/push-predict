"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Network } from "lucide-react";
import { toast } from "sonner";
import { useUniversalTransactions } from "@/hooks/use-universal-transactions";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";

interface UniversalBetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    market: any;
    option: number;
    optionText: string;
}

export function UniversalBetDialog({
    isOpen,
    onClose,
    market,
    option,
    optionText
}: UniversalBetDialogProps) {
    const [betAmount, setBetAmount] = useState("");
    const [selectedChain, setSelectedChain] = useState("eip155:42101");

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const {
        isLoading,
        supportedChains,
        fetchSupportedChains,
        placeUniversalBet
    } = useUniversalTransactions();

    useEffect(() => {
        fetchSupportedChains();
    }, []);

    const chains = supportedChains.length > 0 ? supportedChains.map(chain => ({
        id: chain.namespace,
        name: chain.name,
        icon: chain.namespace.includes('42101') ? '🍩' :
            chain.namespace.includes('11155111') ? '⟠' : '◎',
        native: chain.native,
        currency: chain.currency
    })) : [
        { id: "eip155:42101", name: "Push Network", icon: "🍩", native: true, currency: "PC" },
        { id: "eip155:11155111", name: "Ethereum Sepolia", icon: "⟠", native: false, currency: "ETH" },
        { id: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", name: "Solana Devnet", icon: "◎", native: false, currency: "SOL" }
    ];

    const selectedChainInfo = chains.find(c => c.id === selectedChain);

    const handleUniversalBet = async () => {
        if (!walletClient || !address) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!betAmount || parseFloat(betAmount) <= 0) {
            toast.error("Please enter a valid bet amount");
            return;
        }

        try {
            // Convert walletClient to ethers signer for compatibility
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            await placeUniversalBet(signer, {
                marketId: market.id,
                option,
                amount: betAmount,
                originChain: selectedChain,
                originAddress: address
            });

            toast.success("Universal bet placed successfully!");
            onClose();
        } catch (error: any) {
            console.error("Universal bet error:", error);
            toast.error(error.message || "Failed to place universal bet");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1A1F2C] border-gray-700 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-pink-400" />
                        Universal Cross-Chain Bet
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Market Info */}
                    <div className="p-4 bg-[#0A0C14] rounded-lg border border-gray-800">
                        <h3 className="font-medium text-sm text-gray-300 mb-2">Betting On:</h3>
                        <p className="text-white font-medium">{optionText}</p>
                        <p className="text-xs text-gray-400 mt-1">{market?.title}</p>
                    </div>

                    {/* Chain Selection */}
                    <div className="space-y-3">
                        <Label className="text-gray-300">Select Source Chain:</Label>
                        <div className="grid gap-2">
                            {chains.map((chain) => (
                                <button
                                    key={chain.id}
                                    onClick={() => setSelectedChain(chain.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${selectedChain === chain.id
                                        ? "border-pink-500 bg-pink-500/10"
                                        : "border-gray-700 hover:border-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{chain.icon}</span>
                                            <div>
                                                <div className="font-medium text-white">{chain.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {chain.native ? "Native" : "Cross-chain"}
                                                </div>
                                            </div>
                                        </div>
                                        {!chain.native && (
                                            <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                                                Universal
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bet Amount */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">
                            Bet Amount ({selectedChainInfo?.native ? "PC" : "ETH/SOL"})
                        </Label>
                        <Input
                            type="number"
                            step="0.001"
                            placeholder="0.01"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            className="bg-[#0A0C14] border-gray-700 text-white"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Min: {market?.minBet} PC</span>
                            <span>Max: {market?.maxBet} PC</span>
                        </div>
                    </div>

                    {/* Universal Flow Indicator */}
                    {!selectedChainInfo?.native && (
                        <div className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-300">Flow:</span>
                                <span className="text-pink-400">{selectedChainInfo?.name}</span>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                <span className="text-pink-400">Push Network</span>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                <span className="text-pink-400">PushPredict</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUniversalBet}
                            disabled={isLoading || !betAmount}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                `Place Universal Bet`
                            )}
                        </Button>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-gray-400 text-center">
                        {selectedChainInfo?.native
                            ? "Native Push Network transaction"
                            : "Universal cross-chain transaction powered by Push Network SDK"
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}