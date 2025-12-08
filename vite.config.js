import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig( {
  base: '/moekha125-a11y/',
  plugins: [ react() ],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
} )
