import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BetSuccessModal } from '@/components/market/bet-success-modal';
import { usePredictionContract, usePredictionContractRead } from '@/hooks/use-prediction-contract';
import { useUniversalTransactions } from '@/hooks/use-universal-transactions';
import { useETHBridge } from '@/hooks/use-eth-bridge';
import { useBetActivity } from '@/hooks/use-bet-activity';
import { usePushWalletContext, usePushChainClient } from '@pushchain/ui-kit';
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
  const [bridgeStep, setBridgeStep] = useState<'idle' | 'bridging' | 'bridged' | 'signing' | 'completed'>('idle');
  const [pushStep, setPushStep] = useState<'idle' | 'confirming' | 'completed'>('idle');
  const [bridgeData, setBridgeData] = useState<{ bridgeId: string; ethTxHash: string } | null>(null);
  const [successData, setSuccessData] = useState<{
    amount: string;
    option: string;
    shares: string;
    pushTxHash?: string;
    ethTxHash?: string;
    chainUsed: 'push' | 'ethereum' | 'solana';
  } | null>(null);

  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  
  const address = pushChainClient?.universal?.account;
  const chainId = 42101; // Push Testnet chain ID
  const balance = undefined; // Balance will be fetched separately if needed
  
  const { placeBet, isLoading } = usePredictionContract();
  const { market } = usePredictionContractRead().getMarket(marketId);
  const { placeUniversalBet, isLoading: isUniversalLoading } = useUniversalTransactions();
  const { bridgeForBet, isLoading: isBridgeLoading } = useETHBridge();
  const { addBetActivity } = useBetActivity(marketId);

  // Chain detection
  const isPushNetwork = chainId === 42101;
  const chainInfo = {
    name: isPushNetwork ? 'Push Network' : 'Ethereum Sepolia',
    currency: isPushNetwork ? 'PC' : 'ETH'
  };

  // Selected option details
  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

  // Validation
  const isValidAmount = betAmount && parseFloat(betAmount) > 0 && !isNaN(parseFloat(betAmount));
  const hasInsufficientBalance = false; // TODO: Implement balance check with Push Chain client
  
  // Market-specific validation
  const marketValidation = market ? {
    tooLow: isValidAmount && parseFloat(betAmount) < parseFloat(market.minBet),
    tooHigh: isValidAmount && parseFloat(betAmount) > parseFloat(market.maxBet)
  } : { tooLow: false, tooHigh: false };

  const betValidation = {
    isValid: isValidAmount && !hasInsufficientBalance && !marketValidation.tooLow && !marketValidation.tooHigh,
    message: !betAmount ? '' : // Don't show error if input is empty
             !isValidAmount ? 'Enter a valid amount' : 
             hasInsufficientBalance ? 'Insufficient balance' :
             marketValidation.tooLow ? `Minimum bet: ${market?.minBet} PC` :
             marketValidation.tooHigh ? `Maximum bet: ${market?.maxBet} PC` : ''
  };

  // ETH amount calculation for bridge
  const calculateETHAmount = (pcAmount: string) => {
    // 1 PC = 0.001 ETH (example rate)
    return (parseFloat(pcAmount) * 0.001).toFixed(6);
  };

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

      let result: any;
      
      if (isPushNetwork) {
        // Native Push Network transaction
        console.log('🔥 Starting Push Network bet...');
        setPushStep('confirming');
        toast.info('Please confirm the transaction in your wallet...');
        
        result = await placeBet(marketId, optionIndex as 0 | 1, betAmount);
        console.log('🔥 Push bet result:', result);
        
        if (result) {
          console.log('🔥 Push bet successful, setting up success modal...');
          setPushStep('completed');
          toast.success('Bet placed successfully!');
          
          // Prepare success data for Push Network bets
          const successDataObj = {
            amount: betAmount,
            option: selectedOption,
            shares: betAmount,
            pushTxHash: result, // Now we have the real transaction hash
            chainUsed: 'push' as const
          };
          console.log('🔥 Success data:', successDataObj);
          
          setSuccessData(successDataObj);
          setShowSuccess(true);
          console.log('🔥 Success modal should be showing now');
          
          // Record bet activity with real transaction hash
          addBetActivity({
            market_id: parseInt(marketId),
            user_address: address,
            chain_namespace: 'eip155:42101',
            original_address: address,
            option: optionIndex,
            amount: betAmount,
            shares: betAmount,
            tx_hash: result, // Real transaction hash
            block_number: undefined
          }).catch(err => {
            console.error('Failed to record bet activity:', err);
          });
          
          // Don't reset form here - wait for success modal to be closed
        } else {
          console.log('🔥 Push bet result is null/undefined');
        }
      } else {
        // Cross-chain transaction with ETH bridge
        if (!pushChainClient) {
          toast.error('Push Chain client not available');
          return;
        }

        try {
          // Step 1: Bridge ETH to PC
          setBridgeStep('bridging');
          toast.info('Step 1/2: Paying ETH...');
          
          const bridgeId = await bridgeForBet({
            pcAmount: betAmount,
            marketId,
            option: optionIndex,
            pushAddress: address
          });

          setBridgeData({ bridgeId, ethTxHash: bridgeId });
          setBridgeStep('bridged');
          toast.success('Step 1/2: ETH payment sent!');

          // Small delay to prevent UI issues
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 2: Sign for universal bet
          setBridgeStep('signing');
          toast.info('Step 2/2: Please sign the bet transaction...');

          result = await placeUniversalBet({
            marketId,
            option: optionIndex,
            amount: betAmount,
            originChain: `eip155:${chainId}`,
            originAddress: address || '',
            bridgeId
          });

          setBridgeStep('completed');
          toast.success('Step 2/2: Universal bet placed!');
          
          // Prepare success data for cross-chain bets
          setSuccessData({
            amount: betAmount,
            option: selectedOption,
            shares: betAmount,
            pushTxHash: result?.txHash,
            ethTxHash: bridgeData?.ethTxHash,
            chainUsed: 'ethereum'
          });
          setShowSuccess(true);
          
        } catch (bridgeError: any) {
          console.error('❌ Bridge process failed:', bridgeError);
          setBridgeStep('idle');
          throw bridgeError;
        }

        // Record bet activity for universal bets
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
      
      // Don't reset form here - only reset after success modal is closed
      // Don't call onSuccess immediately to prevent page refresh
      // Data will be refreshed when user closes the success modal
      
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setIsSubmitting(false);
      setBridgeStep('idle');
      setPushStep('idle');
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return parseFloat(formatEther(balance)).toFixed(4);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-[#22c55e]" />
              <span>Place Your Bet</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Market Info */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2 line-clamp-2">{marketTitle}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Betting on:</span>
                <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30">
                  {selectedOption}
                </Badge>
              </div>
            </div>

            {/* Chain Info */}
            <div className="flex items-center justify-between bg-gray-800/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Network:</span>
              </div>
              <Badge className={isPushNetwork ? 
                'bg-pink-500/20 text-pink-400 border-pink-500/30' : 
                'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }>
                {chainInfo.name}
              </Badge>
            </div>

            {/* Bet Amount Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="betAmount" className="text-sm font-medium text-gray-300">
                  Bet Amount
                </Label>
                
                {/* Bridge Steps Indicator */}
                {!isPushNetwork && bridgeStep !== 'idle' && (
                  <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          bridgeStep === 'bridging' ? 'bg-yellow-400 animate-pulse' :
                          ['bridged', 'signing', 'completed'].includes(bridgeStep) ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <span className={bridgeStep === 'bridging' ? 'text-yellow-400' : 
                                       ['bridged', 'signing', 'completed'].includes(bridgeStep) ? 'text-green-400' : 'text-gray-400'}>
                          Step 1: Pay {calculateETHAmount(betAmount || '0')} ETH
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          bridgeStep === 'signing' ? 'bg-yellow-400 animate-pulse' :
                          bridgeStep === 'completed' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <span className={bridgeStep === 'signing' ? 'text-yellow-400' : 
                                       bridgeStep === 'completed' ? 'text-green-400' : 'text-gray-400'}>
                          Step 2: Sign bet transaction
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Push Network Steps Indicator */}
                {isPushNetwork && pushStep !== 'idle' && (
                  <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        pushStep === 'confirming' ? 'bg-yellow-400 animate-pulse' :
                        pushStep === 'completed' ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      <span className={pushStep === 'confirming' ? 'text-yellow-400' : 
                                     pushStep === 'completed' ? 'text-green-400' : 'text-gray-400'}>
                        {pushStep === 'confirming' ? 'Confirming transaction...' : 'Transaction confirmed!'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    id="betAmount"
                    type="number"
                    step="0.01"
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

                {/* Quick Bet Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-300">Quick Amounts:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1, 5].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        onClick={() => setBetAmount(amount.toString())}
                        className={`h-10 px-4 text-sm font-medium bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 text-gray-200 hover:from-[#22c55e]/20 hover:to-[#16a34a]/20 hover:border-[#22c55e]/60 hover:text-[#22c55e] transition-all duration-200 hover:scale-105 ${
                          betAmount === amount.toString() ? 'from-[#22c55e]/30 to-[#16a34a]/30 border-[#22c55e]/80 text-[#22c55e]' : ''
                        }`}
                        disabled={isSubmitting || isLoading}
                      >
                        {amount} PC
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Balance Info */}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{isPushNetwork ? 'Available Balance:' : `${chainInfo.currency} Balance:`}</span>
                  <span>-- {chainInfo.currency}</span>
                </div>
                {!isPushNetwork && (
                  <div className="text-xs text-gray-500 text-center">
                    Bridge: {calculateETHAmount(betAmount || '0')} {chainInfo.currency} → {betAmount || '0'} PC
                  </div>
                )}
                
                {/* Min/Max Info */}
                {market && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Bet Range:</span>
                    <span>{market.minBet} - {market.maxBet} PC</span>
                  </div>
                )}
                
                {/* Validation Error */}
                {!betValidation.isValid && betValidation.message && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{betValidation.message}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  disabled={isSubmitting || isLoading || bridgeStep === 'bridging' || bridgeStep === 'signing'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white shadow-lg"
                  disabled={!isValidAmount || hasInsufficientBalance || !betValidation.isValid || isSubmitting || isLoading || isUniversalLoading || isBridgeLoading || pushStep === 'confirming' || !address}
                >
                  {isSubmitting || isLoading || isUniversalLoading || isBridgeLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {bridgeStep === 'bridging' ? 'Step 1/2: Paying ETH...' :
                         bridgeStep === 'signing' ? 'Step 2/2: Sign transaction...' :
                         pushStep === 'confirming' ? 'Confirming transaction...' :
                         isBridgeLoading ? 'Bridging ETH...' :
                         isSubmitting || isLoading || isUniversalLoading ? 
                          (isPushNetwork ? 'Placing Bet...' : 'Processing Universal Bet...') : 
                          'Processing...'
                        }
                      </span>
                    </div>
                  ) : (
                    `Place Bet (${betAmount || '0'} PC)`
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      {successData && (
        <>
          {console.log('🔥 Rendering success modal with data:', successData, 'showSuccess:', showSuccess)}
          <BetSuccessModal
            open={showSuccess}
            onOpenChange={(open) => {
              console.log('🔥 Success modal onOpenChange:', open);
              if (!open) {
                setShowSuccess(false);
                setSuccessData(null);
                // Reset form when success modal is closed
                setBetAmount('');
                // Refresh data when success modal is closed
                if (onSuccess) {
                  onSuccess();
                }
              }
            }}
            betDetails={successData}
          />
        </>
      )}
    </>
  );
};