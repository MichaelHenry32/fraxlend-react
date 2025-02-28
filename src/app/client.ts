// lib/services/blockchain/client.ts
import { createPublicClient, http } from 'viem';
import { fraxtal } from 'viem/chains';

// You can adjust the chain based on your needs (mainnet, sepolia, etc.)
export const publicClient = createPublicClient({
    chain: fraxtal,
    transport: http('http://localhost:8545')
});