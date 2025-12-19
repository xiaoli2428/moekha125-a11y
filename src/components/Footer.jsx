import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 px-6 md:px-12 bg-transparent border-t border-white/6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">O</div>
          <div>
            <div className="font-semibold">Onchainweb</div>
            <div className="text-xs text-gray-400">User-friendly DeFi UI</div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Onchainweb. Built with ❤️
        </div>
      </div>
    </footer>
  )
}