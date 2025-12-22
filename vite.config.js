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
  build: {
    rollupOptions: {
      output: {
        // Code splitting for faster initial load
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ethers': ['ethers'],
          'vendor-web3modal': ['@web3modal/ethers5']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Don't pre-bundle heavy web3 deps - load on demand
    exclude: ['ethers', '@web3modal/ethers5']
  }
})