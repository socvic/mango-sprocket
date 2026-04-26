export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || 'SP2V3QE7H5D09N108CJ4QPS281Z3XAZVD87R8FJ27'
export const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME || 'daily-streaks'
export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}` as const

export const STACKS_API_BASE = import.meta.env.VITE_STACKS_API_BASE || 'https://api.hiro.so'
export const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'
