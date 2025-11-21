import React, { useEffect, useState } from 'react'

// Simple candlestick chart component
function CandlestickChart() {
  const [price, setPrice] = useState(2845.32)
  
  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 10
        return Number((prev + change).toFixed(2))
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mock candlestick data for display
  const candles = [
    { open: 2820, close: 2835, high: 2840, low: 2815, up: true },
    { open: 2835, close: 2828, high: 2838, low: 2825, up: false },
    { open: 2828, close: 2850, high: 2855, low: 2826, up: true },
    { open: 2850, close: 2842, high: 2852, low: 2838, up: false },
    { open: 2842, close: 2858, high: 2860, low: 2840, up: true },
    { open: 2858, close: 2845, high: 2862, low: 2843, up: false },
  ]

  return (
    <div className="bg-gradient-to-b from-white/5 to-white/2 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-400">ETH/USDC Price</div>
          <div className="font-bold text-2xl text-green-400">${price.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">24h Change</div>
          <div className="font-semibold text-green-400">+2.4%</div>
        </div>
      </div>
      
      {/* Accessible Candlestick Chart */}
      <figure>
        <svg
          role="img"
          aria-label="ETH/USDC candlestick chart showing recent price movements"
          width="100%"
          height="128"
          viewBox="0 0 180 128"
          className="w-full h-32"
        >
          <title>ETH/USDC candlestick chart showing recent price movements</title>
          {candles.map((candle, i) => {
            // Chart dimensions
            const chartHeight = 120
            const chartBottom = 124
            const candleWidth = 20
            const gap = 10
            const x = i * (candleWidth + gap) + 10
            // Normalize values to chart height
            const minPrice = Math.min(...candles.map(c => c.low))
            const maxPrice = Math.max(...candles.map(c => c.high))
            const priceRange = maxPrice - minPrice
            const scale = priceRange === 0 ? 1 : chartHeight / priceRange
            const yHigh = chartBottom - (candle.high - minPrice) * scale
            const yLow = chartBottom - (candle.low - minPrice) * scale
            const yOpen = chartBottom - (candle.open - minPrice) * scale
            const yClose = chartBottom - (candle.close - minPrice) * scale
            const bodyY = Math.min(yOpen, yClose)
            const bodyHeight = Math.abs(yClose - yOpen) || 4
            const color = candle.up ? "#4ade80" : "#f87171" // Tailwind green-400/red-400
            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  x2={x + candleWidth / 2}
                  y1={yHigh}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="2"
                  aria-label={`Candle ${i + 1} wick: high ${candle.high}, low ${candle.low}`}
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight < 4 ? 4 : bodyHeight}
                  fill={color}
                  rx="2"
                  aria-label={`Candle ${i + 1} body: open ${candle.open}, close ${candle.close}`}
                />
              </g>
            )
          })}
        </svg>
        <figcaption className="sr-only">
          Candlestick chart showing recent ETH/USDC price movements. Each candle represents open, close, high, and low prices for a time period.
        </figcaption>
      </figure>
      
      <div className="mt-3 text-xs text-gray-500 text-center">Live price updates every 3s</div>
    </div>
  )
}

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
            <a href="https://onchainweb.cc/app" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold shadow-md hover:opacity-95 transition">
              Launch App
            </a>
            <a href="https://onchainweb.cc/docs" className="inline-flex items-center gap-2 px-5 py-3 border border-white/10 rounded-lg text-sm hover:bg-white/3 transition">Documentation</a>
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

            {/* Candlestick Chart with live price */}
            <CandlestickChart />

            <div className="mt-4 bg-gradient-to-b from-white/5 to-white/2 p-4 rounded-lg">
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