import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCryptoPrices } from '@/hooks/use-pyth-prices';
import { TrendingUp, TrendingDown, Activity, Loader2, DollarSign, Zap } from 'lucide-react';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: string;
  publishTime?: number;
  isLoading?: boolean;
  className?: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ 
  symbol, 
  name, 
  price, 
  publishTime,
  isLoading, 
  className = '' 
}) => {
  // Mock trend data (in real app, you'd calculate from historical data)
  const isPositive = Math.random() > 0.5;
  const changePercent = (Math.random() * 5).toFixed(2);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className={`bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 hover:border-[#22c55e]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/10 ${className}`}>
      <CardContent className="p-4">
        {/* Header with Live Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-1">
              Live Price
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></div>
            <Zap className="h-3 w-3 text-[#22c55e]" />
          </div>
        </div>

        {/* Price Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-lg text-gray-400">Loading...</span>
                </div>
              ) : (
                `$${price}`
              )}
            </div>
            {!isLoading && (
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{isPositive ? changePercent : `-${changePercent}`}%
                </span>
              </div>
            )}
          </div>

          {/* Symbol and Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#22c55e] text-sm">{symbol}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          </div>

          {/* Timestamp */}
          {publishTime && (
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Updated: {formatTime(publishTime)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const CryptoPricesDashboard: React.FC = () => {
  const { data: cryptoData, isLoading: cryptoLoading } = useCryptoPrices();

  return (
    <div className="bg-gradient-to-br from-[#1A1F2C]/50 to-[#151923]/50 rounded-2xl border border-gray-800/50 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#22c55e]/20 rounded-lg">
            <Activity className="h-6 w-6 text-[#22c55e]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Crypto Prices</h2>
            <p className="text-sm text-gray-400">Real-time cryptocurrency data powered by Pyth Network</p>
          </div>
        </div>
        <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 px-3 py-1">
          <Zap className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Crypto Prices */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-6 bg-[#22c55e] rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">Top Cryptocurrencies</h3>
          <Badge className="bg-gray-700/50 text-gray-300 text-xs">
            {cryptoData?.length || 5} assets
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cryptoData?.map((crypto) => (
            <PriceCard
              key={crypto.priceId}
              symbol={crypto.symbol}
              name={crypto.name}
              price={crypto.formattedPrice}
              publishTime={crypto.publishTime}
              isLoading={cryptoLoading}
            />
          )) || (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <PriceCard
                key={i}
                symbol="..."
                name="Loading..."
                price="0.00"
                isLoading={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};