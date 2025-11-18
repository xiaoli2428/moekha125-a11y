import React from 'react'

export default function Hero() {
  return (
    <section id="app" className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 text-sm text-white/90 px-3 py-1 rounded-full mb-4">
            <span className="bg-green-400/20 text-green-300 px-2 py-0.5 rounded">NEW</span>
            Multi-chain AMM live on testnet
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Build, swap and earn across chains — with a sleek UI.
          </h1>

          <p className="mt-4 text-gray-300 max-w-xl">
            Simple, secure, and fast. Trade liquidity pools, provide assets, and stake with low fees. A modern DeFi interface designed for builders and traders.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#app" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold shadow-md">
              Launch App
            </a>
            <a href="#docs" className="inline-flex items-center gap-2 px-5 py-3 border border-white/10 rounded-lg text-sm hover:bg-white/3">Documentation</a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm text-sm">
            <div className="p-3 bg-white/3 rounded-lg">
              <div className="text-xs text-gray-200">TVL</div>
              <div className="mt-1 font-bold">• • • •</div>
            </div>
            <div className="p-3 bg-white/3 rounded-lg">
              <div className="text-xs text-gray-200">24h Volume</div>
              <div className="mt-1 font-bold">• • • •</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
              <div>Pool: ETH / USDC</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-medium">+0.13%</span>
                <span className="bg-white/6 px-2 py-1 rounded">v1.2</span>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/5 to-white/2 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Your Share</div>
                  <div className="font-bold text-xl">0.01234</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">TVL</div>
                  <div className="font-semibold">5.3M</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="px-3 py-2 rounded bg-white/6 text-sm">Add Liquidity</button>
                <button className="px-3 py-2 rounded border border-white/8 text-sm">Swap</button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">Preview: mock data</div>
          </div>

          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-400/10 blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  )
}