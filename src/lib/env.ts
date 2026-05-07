export const env = {
  CONTRACT_ADDRESS: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`,
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '61999'),
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://studio.genlayer.com/api',
};

// Only validate at runtime, not build time
export function validateEnv() {
  if (typeof window === 'undefined') return; // skip on server/build
  
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) 
    missing.push('NEXT_PUBLIC_CONTRACT_ADDRESS');
  if (!process.env.NEXT_PUBLIC_CHAIN_ID) 
    missing.push('NEXT_PUBLIC_CHAIN_ID');
  if (!process.env.NEXT_PUBLIC_RPC_URL) 
    missing.push('NEXT_PUBLIC_RPC_URL');
    
  if (missing.length > 0) {
    console.error('Missing env vars:', missing.join(', '));
    // Do NOT throw — just warn
  }
}
