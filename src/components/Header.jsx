import React from 'react'

export default function Header() {
  return (
    <header className="py-6 px-6 md:px-12 flex items-center justify-between bg-transparent" role="banner">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:z-50">
        Skip to main content
      </a>
      <div className="flex items-center space-x-3">
        <a href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg" aria-label="Onchainweb Home">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center ring-1 ring-white/10" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"></path></svg>
          </div>
          <span className="font-bold text-xl">Onchainweb</span>
        </a>
      </div>

      <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-300" aria-label="Main navigation">
        <a className="hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1" href="#app">App</a>
        <a className="hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1" href="#markets">Markets</a>
        <a className="hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1" href="#earn">Earn</a>
        <a className="hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1" href="#docs">Docs</a>
      </nav>

      <div className="flex items-center space-x-3" role="group" aria-label="Wallet actions">
        <button type="button" className="hidden md:inline-block px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900" aria-label="Connect wallet">Connect</button>
        <button type="button" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-sm font-semibold shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900" aria-label="Launch application">Launch App</button>
      </div>
    </header>
  )
}
