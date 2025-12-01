import React from 'react'

export default function Hero() {
  return (
    <section id="app" className="py-16 px-6 md:px-12" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 text-sm text-white/90 px-3 py-1 rounded-full mb-4" role="status" aria-label="New feature announcement">
            <span className="bg-green-400/20 text-green-300 px-2 py-0.5 rounded" aria-hidden="true">NEW</span>
            <span>Multi-chain AMM live on testnet</span>
          </div>

          <h1 id="hero-heading" className="text-4xl md:text-5xl font-extrabold leading-tight">
            Build, swap and earn across chains — with a sleek UI.
          </h1>

          <p className="mt-4 text-gray-300 max-w-xl">
            Simple, secure, and fast. Trade liquidity pools, provide assets, and stake with low fees. A modern DeFi interface designed for builders and traders.
          </p>

          <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Call to action links">
            <a
              href="#app"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Launch the application"
            >
              Launch App
            </a>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 px-5 py-3 border border-white/10 rounded-lg text-sm hover:bg-white/3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="View documentation"
            >
              Documentation
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm text-sm" role="region" aria-label="Platform statistics">
            <div className="p-3 bg-white/3 rounded-lg">
              <dt className="text-xs text-gray-200">TVL</dt>
              <dd className="mt-1 font-bold" aria-label="Total Value Locked: Loading">• • • •</dd>
            </div>
            <div className="p-3 bg-white/3 rounded-lg">
              <dt className="text-xs text-gray-200">24h Volume</dt>
              <dd className="mt-1 font-bold" aria-label="24 hour volume: Loading">• • • •</dd>
            </div>
          </div>
        </div>

        <div className="relative" role="region" aria-labelledby="pool-preview-heading">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 rounded-2xl p-6 shadow-2xl">
            <h2 id="pool-preview-heading" className="sr-only">Liquidity Pool Preview</h2>
            <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
              <span aria-label="Pool pair">Pool: ETH / USDC</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-medium" aria-label="24 hour change: positive 0.13 percent">+0.13%</span>
                <span className="bg-white/6 px-2 py-1 rounded" aria-label="Version 1.2">v1.2</span>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/5 to-white/2 p-4 rounded-lg">
              <dl className="flex items-center justify-between">
                <div>
                  <dt className="text-xs text-gray-400">Your Share</dt>
                  <dd className="font-bold text-xl">0.01234</dd>
                </div>
                <div className="text-right">
                  <dt className="text-xs text-gray-400">TVL</dt>
                  <dd className="font-semibold">5.3M</dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Pool actions">
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-white/6 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Add liquidity to pool"
                >
                  Add Liquidity
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Swap tokens"
                >
                  Swap
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400" role="note">Preview: mock data</p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-400/10 blur-3xl pointer-events-none" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  )
}
