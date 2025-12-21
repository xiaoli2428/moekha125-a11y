import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * OPTIMIZED STARTUP:
 * Web3Modal is NO LONGER initialized here
 * It's lazy-loaded in src/web3modal/setup.js only when user clicks "Connect Wallet"
 * This makes the login page load INSTANTLY without downloading ethers chunks
 */

createRoot(document.getElementById('root')).render(<App />)