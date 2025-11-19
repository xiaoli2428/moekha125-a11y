import React, { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'

export default function Header() {
  const { account, balance, chainId, isConnecting, connectWallet, disconnectWallet, getShortAddress, getChainName, isConnected } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="py-6 px-6 md:px-12 flex items-center justify-between bg-transparent">
      <a href="https://onchainweb.cc" className="flex items-center space-x-3 hover:opacity-90 transition">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center ring-1 ring-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/></svg>
        </div>
        <span className="font-bold text-xl">Onchainweb</span>
      </a>

      <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
        <a className="hover:text-white transition" href="https://onchainweb.cc/app">App</a>
        <a className="hover:text-white transition" href="https://onchainweb.cc/markets">Markets</a>
        <a className="hover:text-white transition" href="https://onchainweb.cc/earn">Earn</a>
        <a className="hover:text-white transition" href="https://onchainweb.cc/docs">Docs</a>
      </nav>

      <div className="flex items-center space-x-3">
        {!isConnected ? (
          <>
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="hidden md:inline-block px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <a href="https://onchainweb.cc/app" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-sm font-semibold shadow-md hover:opacity-95 transition">Launch App</a>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/15 transition"
            >
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="font-mono">{getShortAddress(account)}</span>
              <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Connected Account</div>
                  <div className="font-mono text-sm mb-2">{getShortAddress(account)}</div>
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <div className="text-lg font-semibold">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : '...'}</div>
                  <div className="text-xs text-gray-400 mt-2">Network: {getChainName(chainId)}</div>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet()
                    setShowDropdown(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}