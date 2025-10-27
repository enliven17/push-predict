/**
 * Explorer utilities for Push Network
 */

// Default Push Network explorer URL
export const PUSH_EXPLORER_BASE_URL = 'https://donut.push.network';

/**
 * Get transaction URL for Push Network explorer
 */
export const getPushExplorerTxUrl = (txHash: string): string => {
  return `${PUSH_EXPLORER_BASE_URL}/tx/${txHash}`;
};

/**
 * Get address URL for Push Network explorer
 */
export const getPushExplorerAddressUrl = (address: string): string => {
  return `${PUSH_EXPLORER_BASE_URL}/address/${address}`;
};

/**
 * Get block URL for Push Network explorer
 */
export const getPushExplorerBlockUrl = (blockNumber: string | number): string => {
  return `${PUSH_EXPLORER_BASE_URL}/block/${blockNumber}`;
};

/**
 * Open transaction in Push Network explorer
 */
export const openPushExplorerTx = (txHash: string): void => {
  window.open(getPushExplorerTxUrl(txHash), '_blank');
};

/**
 * Open address in Push Network explorer
 */
export const openPushExplorerAddress = (address: string): void => {
  window.open(getPushExplorerAddressUrl(address), '_blank');
};