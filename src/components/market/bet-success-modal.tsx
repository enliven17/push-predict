import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface BetSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  betDetails: {
    amount: string;
    option: string;
    shares: string;
    pushTxHash?: string;
    ethTxHash?: string;
    chainUsed: 'push' | 'ethereum' | 'solana';
  };
}

export const BetSuccessModal: React.FC<BetSuccessModalProps> = ({
  open,
  onOpenChange,
  betDetails
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getExplorerUrl = (txHash: string, chain: 'push' | 'ethereum') => {
    if (chain === 'push') {
      return `https://donut.push.network/tx/${txHash}`;
    } else {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Bet Placed Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bet Details */}
          <div className="bg-gray-800/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-[#22c55e] font-bold">{betDetails.amount} PC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Option:</span>
              <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30">
                {betDetails.option}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Shares:</span>
              <span className="text-white font-medium">{betDetails.shares}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Chain Used:</span>
              <Badge className={`${
                betDetails.chainUsed === 'push' 
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                  : betDetails.chainUsed === 'ethereum'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                {betDetails.chainUsed === 'push' ? 'Push Network' : 
                 betDetails.chainUsed === 'ethereum' ? 'Ethereum Sepolia' : 'Solana Devnet'}
              </Badge>
            </div>
          </div>

          {/* Transaction Hashes */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-[#22c55e]" />
              <span>Transaction Details</span>
            </h4>

            {/* Push Network Transaction */}
            {betDetails.pushTxHash && (
              <div className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-lg p-3 border border-pink-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-pink-400">Push Network</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(betDetails.pushTxHash!, 'Push TX Hash')}
                      className="h-6 w-6 p-0 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(betDetails.pushTxHash!, 'push'), '_blank')}
                      className="h-6 w-6 p-0 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <code className="text-xs text-gray-300 font-mono">
                  {formatTxHash(betDetails.pushTxHash)}
                </code>
              </div>
            )}

            {/* Ethereum Transaction */}
            {betDetails.ethTxHash && (
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400">Ethereum Sepolia</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(betDetails.ethTxHash!, 'ETH TX Hash')}
                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(betDetails.ethTxHash!, 'ethereum'), '_blank')}
                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <code className="text-xs text-gray-300 font-mono">
                  {formatTxHash(betDetails.ethTxHash)}
                </code>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="bg-gradient-to-r from-[#22c55e]/10 to-[#16a34a]/10 rounded-xl p-4 border border-[#22c55e]/20 text-center">
            <TrendingUp className="h-6 w-6 text-[#22c55e] mx-auto mb-2" />
            <p className="text-sm text-gray-300">
              Your bet has been successfully placed and recorded on the blockchain. 
              You can track your position in the "My Bets" section.
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white shadow-lg"
          >
            Continue Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};