import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePredictionContract, usePredictionContractRead } from '@/hooks/use-prediction-contract';
import { useUniversalTransactions } from '@/hooks/use-universal-transactions';
import { useBetActivity } from '@/hooks/use-bet-activity';
import { useAccount, useBalance, useChainId, useWalletClient } from 'wagmi';
import { useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, ExternalLink, Copy, Network } from 'lucide-react';

interface BetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: string;
  marketTitle: string;
  selectedSide: 'optionA' | 'optionB';
  optionA: string;
  optionB: string;
  onSuccess?: () => void;
}

export const BetDialog: React.FC<BetDialogProps> = ({ 
  open, 
  onOpenChange, 
  marketId, 
  marketTitle, 
  selectedSide, 
  optionA, 
  optionB,
  onSuccess 
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: string;
    option: string;
    txHash: string;
    shares: string;
  } | null>(null);
  
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { placeBet, isLoading, isSuccess, hash } = usePredictionContract();
  const { placeUniversalBet, isLoading: isUniversalLoading } = useUniversalTransactions();
  const { getMarket } = usePredictionContractRead();
  const { market } = getMarket(marketId);
  const { addBetActivity } = useBetActivity();

  // Determine if we're on Push Network or need universal transaction
  const isPushNetwork = chainId === 42101;
  const chainInfo = getChainInfo(chainId);

  function getChainInfo(id: number) {
    switch (id) {
      case 42101:
        return { id: 42101, name: 'Push Network', currency: 'PC', icon: '🍩' };
      case 11155111:
        return { id: 11155111, name: 'Ethereum Sepolia', currency: 'ETH', icon: '⟠' };
      default:
        return { id, name: 'Unknown Network', currency: 'ETH', icon: '?' };
    }
  }
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  });

  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

  // Show success modal when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && successData && !showSuccess && hash && address) {
      setShowSuccess(true);
      // Update success data with confirmed hash
      setSuccessData(prev => prev ? {
        ...prev,
        txHash: hash
      } : null);
      
      // Record bet activity in Supabase
      addBetActivity({
        market_id: parseInt(marketId),
        user_address: address,
        chain_namespace: isPushNetwork ? 'eip155:42101' : `eip155:${chainId}`,
        original_address: address,
        option: optionIndex,
        amount: successData.amount,
        shares: successData.shares,
        tx_hash: hash,
        block_number: undefined // Will be filled later if needed
      }).catch(err => {
        console.error('Failed to record bet activity:', err);
        // Don't show error to user, it's not critical
      });
    }
  }, [isConfirmed, successData, showSuccess, hash, address, marketId, optionIndex, marketTitle, optionA, optionB, addBetActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Min/Max bet validation
    if (market) {
      const betAmountNum = parseFloat(betAmount);
      const minBetNum = parseFloat(market.minBet);
      const maxBetNum = parseFloat(market.maxBet);
      
      if (betAmountNum < minBetNum) {
        toast.error(`Bet amount too low. Minimum: ${minBetNum} PC`);
        return;
      }
      
      if (betAmountNum > maxBetNum) {
        toast.error(`Bet amount too high. Maximum: ${maxBetNum} PC`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Placing bet:', {
        marketId,
        option: optionIndex,
        amount: betAmount,
        chain: chainInfo.name,
        isPushNetwork
      });

      let result;
      
      if (isPushNetwork) {
        // Native Push Network transaction
        result = await placeBet(marketId, optionIndex as 0 | 1, betAmount);
      } else {
        // Universal cross-chain transaction
        if (!walletClient) {
          toast.error('Wallet client not available');
          return;
        }

        const provider = new ethers.BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();

        result = await placeUniversalBet(signer, {
          marketId,
          option: optionIndex,
          amount: betAmount,
          originChain: `eip155:${chainId}`,
          originAddress: address
        });

        // For universal bets, immediately record in Supabase since we have the result
        if (result?.txHash) {
          addBetActivity({
            market_id: parseInt(marketId),
            user_address: address,
            chain_namespace: `eip155:${chainId}`,
            original_address: address,
            option: optionIndex,
            amount: betAmount,
            shares: betAmount,
            tx_hash: result.txHash,
            block_number: result.blockNumber || undefined
          }).catch(async (err) => {
            console.error('Failed to record universal bet activity:', err);
            
            // If foreign key error, try to sync markets first
            if (err.message?.includes('foreign key constraint')) {
              console.log('🔄 Foreign key error detected, syncing markets...');
              try {
                await fetch('/api/sync/markets', { method: 'POST' });
                console.log('✅ Markets synced, retrying bet activity...');
                
                // Retry adding bet activity
                await addBetActivity({
                  market_id: parseInt(marketId),
                  user_address: address,
                  chain_namespace: `eip155:${chainId}`,
                  original_address: address,
                  option: optionIndex,
                  amount: betAmount,
                  shares: betAmount,
                  tx_hash: result.txHash,
                  block_number: result.blockNumber || undefined
                });
              } catch (retryErr) {
                console.error('Failed to record bet activity after sync:', retryErr);
              }
            }
          });
        }
      }
      
      // Store bet data for success modal (will show when transaction confirms)
      setSuccessData({
        amount: betAmount,
        option: selectedOption,
        txHash: result?.txHash || result || 'pending',
        shares: betAmount // 1:1 ratio for now, could be calculated differently
      });
      
      // Reset form
      setBetAmount('');
      
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      // Error is already handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return parseFloat(formatEther(balance)).toFixed(4);
  };

  const isValidAmount = betAmount && parseFloat(betAmount) > 0;
  // Only check balance for Push Network (native payments)
  const hasInsufficientBalance = isPushNetwork && balance && betAmount && parseEther(betAmount) > balance.value;
  
  // Min/Max validation
  const getBetValidation = () => {
    if (!betAmount || !market) return { isValid: true, error: null };
    
    const betAmountNum = parseFloat(betAmount);
    const minBetNum = parseFloat(market.minBet);
    const maxBetNum = parseFloat(market.maxBet);
    
    if (betAmountNum < minBetNum) {
      return { 
        isValid: false, 
        error: `Bet amount too low (min: ${minBetNum} PC)` 
      };
    }
    
    if (betAmountNum > maxBetNum) {
      return { 
        isValid: false, 
        error: `Bet amount too high (max: ${maxBetNum} PC)` 
      };
    }
    
    return { isValid: true, error: null };
  };
  
  const betValidation = getBetValidation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#22c55e]" />
              <span>Place Bet</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{chainInfo.icon}</span>
              <Badge className={`text-xs ${
                isPushNetwork 
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                {chainInfo.name}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Market Info */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-300">Market</h3>
            <p className="text-white font-medium">{marketTitle}</p>
          </div>

          {/* Selected Option */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-300">Your Prediction</h3>
            <Badge className={`${
              selectedSide === 'optionA' 
                ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30' 
                : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
            } font-medium`}>
              {selectedOption}
            </Badge>
          </div>

          {/* Bet Amount Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="betAmount" className="text-sm font-medium text-gray-300">
                Bet Amount (PC)
              </Label>
              {!isPushNetwork && (
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 mb-3">
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <Network className="h-4 w-4" />
                    <span>Universal Cross-Chain: Sign with your {chainInfo.name} wallet, bet executes on Push Network</span>
                  </div>
                </div>
              )}
              <div className="relative">
                <Input
                  id="betAmount"
                  type="number"
                  step="0.01"
                  min={market ? market.minBet : "0"}
                  max={market ? market.maxBet : undefined}
                  placeholder={market ? `${market.minBet} - ${market.maxBet}` : "0.00"}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#22c55e] focus:ring-[#22c55e]/20 ${
                    !betValidation.isValid ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  disabled={isSubmitting || isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  PC
                </div>
              </div>
              
              {/* Balance Info */}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{isPushNetwork ? 'Available Balance:' : `${chainInfo.currency} Balance:`}</span>
                <span>{formatBalance(balance?.value)} {chainInfo.currency}</span>
              </div>
              {!isPushNetwork && (
                <div className="text-xs text-gray-500 text-center">
                  No {chainInfo.currency} payment required - signature only
                </div>
              )}
              
              {/* Min/Max Info */}
              {market && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Bet Range:</span>
                  <span>{market.minBet} - {market.maxBet} PC</span>
                </div>
              )}
              
              {/* Quick Amount Buttons */}
              <div className="flex space-x-2">
                {['0.1', '0.5', '1.0'].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white text-xs"
                    disabled={isSubmitting || isLoading}
                  >
                    {amount}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isPushNetwork) {
                      setBetAmount(balance ? formatBalance(balance.value) : '0');
                    } else {
                      // For cross-chain, use market max bet (since no payment required)
                      setBetAmount(market ? market.maxBet : '1.0');
                    }
                  }}
                  className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white text-xs"
                  disabled={isSubmitting || isLoading}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Error Messages */}
            {hasInsufficientBalance && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient {chainInfo.currency} balance</span>
              </div>
            )}
            
            {!betValidation.isValid && betValidation.error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <span>{betValidation.error}</span>
              </div>
            )}

            {/* Transaction Status */}
            {hash && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <p className="text-blue-400 text-sm font-medium">Confirming Transaction...</p>
                    </>
                  ) : isConfirmed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <p className="text-green-400 text-sm font-medium">Transaction Confirmed!</p>
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-4 bg-blue-400 rounded-full animate-pulse" />
                      <p className="text-blue-400 text-sm font-medium">Transaction Submitted</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 break-all">
                  Hash: {hash}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white shadow-lg"
                disabled={!isValidAmount || hasInsufficientBalance || !betValidation.isValid || isSubmitting || isLoading || isUniversalLoading || isConfirming || !address}
              >
                {isSubmitting || isLoading || isUniversalLoading || isConfirming ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {isSubmitting || isLoading || isUniversalLoading ? 
                        (isPushNetwork ? 'Placing Bet...' : 'Processing Universal Bet...') : 
                        'Confirming...'
                      }
                    </span>
                  </div>
                ) : (
                  `Place Bet (${betAmount || '0'} PC)`
                )}
              </Button>
            </div>
          </form>

          {/* Success Message - Only show if not showing success modal */}
          {isSuccess && !showSuccess && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
              <p className="text-green-400 text-sm font-medium">
                ✅ Bet placed successfully!
              </p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={(open) => {
        if (!open) {
          setShowSuccess(false);
          setSuccessData(null);
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span>Bet Placed Successfully!</span>
            </DialogTitle>
          </DialogHeader>
          
          {successData && (
            <div className="space-y-6">
              {/* Success Animation */}
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">
                  Your bet has been successfully placed on the blockchain!
                </p>
              </div>

              {/* Bet Details */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-300 mb-3">Bet Details</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Market:</span>
                  <span className="text-white text-sm font-medium truncate ml-2 max-w-[200px]">
                    {marketTitle}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Your Prediction:</span>
                  <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 text-xs">
                    {successData.option}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Bet Amount:</span>
                  <span className="text-white font-bold">{successData.amount} PC</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Shares Received:</span>
                  <span className="text-[#22c55e] font-bold">{successData.shares}</span>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h3 className="font-semibold text-sm text-blue-400 mb-3">Transaction</h3>
                
                {/* Transaction Hash - Shortened */}
                <div className="bg-gray-800/30 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Hash:</span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                        onClick={() => {
                          navigator.clipboard.writeText(successData.txHash);
                          toast.success('Transaction hash copied!');
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                        onClick={() => {
                          window.open(`https://explorer.creditcoin.org/tx/${successData.txHash}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-gray-300 break-all">
                    {successData.txHash.slice(0, 10)}...{successData.txHash.slice(-10)}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400">
                  Click copy to get full hash or view on explorer
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-[#22c55e]/10 to-[#16a34a]/10 rounded-lg p-4 border border-[#22c55e]/20">
                <h3 className="font-semibold text-sm text-[#22c55e] mb-2">What's Next?</h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Your bet is now active on the blockchain</li>
                  <li>• You'll receive rewards if your prediction is correct</li>
                  <li>• Check back when the market resolves to claim winnings</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    setSuccessData(null);
                    // Keep bet dialog open for more trading
                  }}
                  className="flex-1 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white"
                >
                  Continue Trading
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccess(false);
                    setSuccessData(null);
                    onOpenChange(false);
                    // Call success callback when fully closing
                    if (onSuccess) {
                      onSuccess();
                    }
                  }}
                  className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};