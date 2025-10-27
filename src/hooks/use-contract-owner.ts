import { useState, useEffect } from "react";
import { usePushWalletContext, usePushChainClient, PushUI } from "@pushchain/ui-kit";

export const useContractOwner = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const address = pushChainClient?.universal?.account;
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnership = () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!address || !isConnected) {
          setIsOwner(false);
          setIsLoading(false);
          return;
        }

        const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

        if (!adminAddress) {
          setError("Admin address not configured");
          setIsOwner(false);
          setIsLoading(false);
          return;
        }

        const userWalletAddress = address;
        const isContractOwner =
          userWalletAddress.toLowerCase() === adminAddress.toLowerCase();

        setIsOwner(isContractOwner);
      } catch (err) {
        console.error("Error checking contract ownership:", err);
        setError(
          err instanceof Error ? err.message : "Failed to check ownership"
        );
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();
  }, [address, isConnected]);

  return {
    isOwner,
    isLoading,
    error,
    contractAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "",
    userAddress: address || "",
  };
};