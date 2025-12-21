import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'OnchainWeb',
        short_name: 'OnchainWeb',
        description: 'Fast DeFi Trading Platform',
        theme_color: '#7c3aed',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          {
            src: '/icons-32/icon-192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/icons-32/icon-512.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ethers': ['ethers'],
          'charts': ['lightweight-charts'],
          'web3modal': ['@web3modal/ethers5']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    include: ['ethers', '@tanstack/react-query']
  }
});
