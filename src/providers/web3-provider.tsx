"use client";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { pushTestnet } from "@/config/push";
import { sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

// Add safety check for pushTestnet
if (!pushTestnet) {
  console.error("pushTestnet is undefined");
  throw new Error("pushTestnet configuration is missing");
}

console.log("pushTestnet config:", pushTestnet);

const wagmiConfig = getDefaultConfig({
  appName: "PushPredict",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [pushTestnet as any, sepolia], // Add Ethereum Sepolia support
  transports: {
    [pushTestnet.id]: http(pushTestnet.rpcUrls.default.http[0]),
    [sepolia.id]: http("https://gateway.tenderly.co/public/sepolia"),
  },
  ssr: true,
}) as any;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ 
          accentColor: "#e91e63", // Push pembe rengi
          accentColorForeground: "white",
          borderRadius: "medium",
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}