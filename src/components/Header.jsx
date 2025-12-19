import React from 'react'

export default function Header() {
  return (
    <header className="py-6 px-6 md:px-12 flex items-center justify-between bg-transparent">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center ring-1 ring-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/></svg>
        </div>
        <span className="font-bold text-xl">Onchainweb</span>
      </div>

      <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
        <a className="hover:text-white" href="#app">App</a>
        <a className="hover:text-white" href="#markets">Markets</a>
        <a className="hover:text-white" href="#earn">Earn</a>
        <a className="hover:text-white" href="#docs">Docs</a>
      </nav>

      <div className="flex items-center space-x-3">
        <button className="hidden md:inline-block px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5">Connect</button>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-sm font-semibold shadow-md hover:opacity-95">Launch App</button>
      </div>
    </header>
  )
}