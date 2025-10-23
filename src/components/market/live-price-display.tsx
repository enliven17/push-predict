import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useMarketPrice } from '@/hooks/use-pyth-prices';
import { TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';

interface LivePriceDisplayProps {
  marketTitle: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LivePriceDisplay: React.FC<LivePriceDisplayProps> = ({
  marketTitle,
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const { priceData, isLoading, error, hasPrice, symbol } = useMarketPrice(marketTitle);

  if (!hasPrice) {
    return null; // Don't show anything if no price feed available
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Activity className="h-4 w-4 text-red-400" />
        <span className="text-red-400 text-sm">Price unavailable</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-gray-400 text-sm">Loading price...</span>
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Calculate price change indicator (mock for now, could be enhanced with historical data)
  const isPositive = Math.random() > 0.5; // Mock trend
  const changePercent = (Math.random() * 5).toFixed(2); // Mock change

  return (
    <div className={`bg-gradient-to-r from-[#1A1F2C]/80 to-[#151923]/80 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm ${className}`}>
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          {/* Live Badge and Symbol */}
          <div className="flex items-center space-x-3">
            {showLabel && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Live Price</span>
                </div>
              </Badge>
            )}
            
            {symbol && (
              <div className="text-sm font-medium text-[#22c55e]">
                {symbol}
              </div>
            )}
          </div>

          {/* Price and Trend */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`font-bold text-white ${sizeClasses[size]}`}>
                ${priceData.formattedPrice}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(priceData.publishTime * 1000).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <TrendingUp className={`${iconSizes[size]} text-green-400`} />
              ) : (
                <TrendingDown className={`${iconSizes[size]} text-red-400`} />
              )}
              <div className={`${sizeClasses[size]} font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{isPositive ? changePercent : `-${changePercent}`}%
              </div>
            </div>
          </div>
        </div>

        {/* Powered by Pyth */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-800/30">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Activity className="h-3 w-3" />
            <span>Powered by</span>
            <span className="text-[#22c55e] font-medium">Pyth Network</span>
          </div>
        </div>
      </div>
    </div>
  );
};