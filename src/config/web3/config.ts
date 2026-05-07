import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Wagmi chain definition — must match GENLAYER_CHAIN in useGenLayerChat.ts
export const genlayerStudioChain = defineChain({
  id: 61999,
  name: 'Genlayer Studio Network',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://studio.genlayer.com/api'] },
    public: { http: ['https://studio.genlayer.com/api'] },
  },
  testnet: true,
});

// Wagmi config — used by Web3Provider
export const config = createConfig({
  chains: [genlayerStudioChain],
  connectors: [
    injected(),
  ],
  transports: {
    [genlayerStudioChain.id]: http('https://studio.genlayer.com/api'),
  },
});
