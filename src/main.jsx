import React from 'react'
import { createRoot } from 'react-dom/client'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import App from './App'
import './index.css'

// Project ID for Web3Modal
const projectId = '8e351899f7e19103239159c134bd210b'

// Support multiple chains for better wallet compatibility
const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  },
  {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  }
]

const metadata = {
  name: 'OnchainWeb',
  description: 'OnchainWeb DeFi Platform',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ 
    metadata,
    // Improve mobile/iPhone support
    infuraId: undefined,
    alchemyId: undefined
  }),
  chains,
  projectId,
  enableAnalytics: false, // Disable for privacy
  enableOnramp: false,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '971e689d0a5be527bac3b88bf325c41f6f552e852e2dd96147586620f185365a', // Coinbase
    '4622a2b2d6af1c9844944291e5e8d3930b7b4b3a5f1f3f8c5e2d9a6b3c0f5e2', // Trust Wallet
    'ecc4036f814562b41a5268adc86270fea1e1dfb2b6e3355ead3aacd1cedffb2f'  // Phantom
  ]
})

createRoot(document.getElementById('root')).render(<App />)