"use client";

import { MyBets } from "@/components/market/my-bets";
import { usePushWalletContext, usePushChainClient, PushUI } from "@pushchain/ui-kit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Wallet } from "lucide-react";
import Link from "next/link";

export default function MyBetsPage() {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const address = pushChainClient?.universal?.account;
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-2">
                My Betting History
              </h1>
              <p className="text-gray-400 text-lg">
                Track all your prediction market bets and performance
              </p>
            </div>

            {/* Connect Wallet Card */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#22c55e]/20 to-[#16a34a]/20 rounded-full flex items-center justify-center mb-6">
                  <Wallet className="h-8 w-8 text-[#22c55e]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your wallet to view your complete betting history and track your performance across all markets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white"
                  >
                    <Link href="/markets">
                      Browse Markets
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    <Link href="/learn">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-8 w-8 text-[#22c55e]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                My Betting History
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Track all your prediction market bets and performance
            </p>
          </div>

          {/* My Bets Component */}
          <MyBets
            userAddress={address}
            showAllBets={true}
          />
        </div>
      </div>
    </div>
  );
}