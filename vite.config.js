import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // Web3Modal uses 'ethers5' internally but we have 'ethers' installed
      'ethers5': 'ethers'
    }
  },
  optimizeDeps: {
    include: ['ethers', '@web3modal/ethers5']
  }
})