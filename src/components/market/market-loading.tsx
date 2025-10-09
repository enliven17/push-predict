import React from "react";

export const MarketLoading: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="h-8 bg-gradient-to-r from-[#e91e63]/20 to-[#ad1457]/20 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-[#e91e63]/10 to-[#ad1457]/10 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-[#e91e63]/20 to-[#ad1457]/20 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gradient-to-br from-[#1A1F2C] to-[#151923] border border-[#e91e63]/20 rounded-xl animate-pulse">
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#e91e63]/20 rounded w-3/4"></div>
                <div className="h-6 bg-[#e91e63]/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Universal loading indicator */}
        <div className="flex justify-center items-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#e91e63]/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#e91e63] rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#e91e63] to-[#ad1457] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gradient-to-br from-[#1A1F2C] to-[#151923] border border-[#e91e63]/10 rounded-xl animate-pulse">
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#e91e63]/20 rounded w-3/4"></div>
                <div className="h-3 bg-[#e91e63]/10 rounded w-full"></div>
                <div className="h-3 bg-[#e91e63]/10 rounded w-2/3"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-[#e91e63]/20 rounded"></div>
                  <div className="h-8 bg-[#e91e63]/20 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading text */}
        <div className="text-center py-8">
          <p className="text-[#e91e63] font-medium animate-pulse">
            Loading universal markets...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Fetching cross-chain prediction data
          </p>
        </div>
      </div>
    </div>
  );
};