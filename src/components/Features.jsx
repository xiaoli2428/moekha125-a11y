import React, { useState, useEffect } from 'react'

const items = [
  {
    title: 'AI arbitrage',
    desc: 'Automated cross-pair arbitrage strategies.'
  },
  {
    title: 'Binary options',
    desc: 'Options trading with clear payouts.'
  },
  {
    title: 'Trade',
    desc: 'Spot swaps and limit orders.'
  },
  {
    title: 'C2C',
    desc: 'Peer-to-peer trading tools.'
  },
  {
    title: 'Understand Onchainweb',
    desc: 'Guides and walkthroughs.'
  },
  {
    title: 'Credit score',
    desc: 'On-chain reputation & scoring.'
  },
  {
    title: 'Simulated Trading',
    desc: 'Paper trading sandbox.'
  },
  {
    title: 'Customer service',
    desc: 'Support & helpdesk.'
  }
]

export default function Features() {
  const [arbitrageLevels, setArbitrageLevels] = useState([])
  const [binaryLevels, setBinaryLevels] = useState([])
  const [loadingArbitrage, setLoadingArbitrage] = useState(true)
  const [loadingBinary, setLoadingBinary] = useState(true)
  const [errorArbitrage, setErrorArbitrage] = useState(null)
  const [errorBinary, setErrorBinary] = useState(null)
  const [showArbitrageLevels, setShowArbitrageLevels] = useState(false)
  const [showBinaryLevels, setShowBinaryLevels] = useState(false)

  useEffect(() => {
    // Simulate API fetch for AI arbitrage levels
    const fetchArbitrageLevels = async () => {
      try {
        const mockResponse = {
          feature: 'ai_arbitrage',
          levels: [
            { level: 1, profitPercentage: 5.2, minCapital: 1000, duration: '24h', riskLevel: 'low' },
            { level: 2, profitPercentage: 8.5, minCapital: 5000, duration: '12h', riskLevel: 'medium' },
            { level: 3, profitPercentage: 12.0, minCapital: 10000, duration: '6h', riskLevel: 'high' }
          ]
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        setArbitrageLevels(mockResponse.levels)
        setLoadingArbitrage(false)
      } catch (err) {
        setErrorArbitrage('Failed to load arbitrage levels')
        setLoadingArbitrage(false)
      }
    }

    // Simulate API fetch for Binary options levels
    const fetchBinaryLevels = async () => {
      try {
        const mockResponse = {
          feature: 'binary_options',
          levels: [
            { level: 1, profitPercentage: 75.0, minCapital: 50, duration: '5m', riskLevel: 'low' },
            { level: 2, profitPercentage: 85.0, minCapital: 100, duration: '10m', riskLevel: 'medium' },
            { level: 3, profitPercentage: 95.0, minCapital: 200, duration: '15m', riskLevel: 'high' }
          ]
        }
        await new Promise(resolve => setTimeout(resolve, 1200))
        setBinaryLevels(mockResponse.levels)
        setLoadingBinary(false)
      } catch (err) {
        setErrorBinary('Failed to load binary options levels')
        setLoadingBinary(false)
      }
    }

    fetchArbitrageLevels()
    fetchBinaryLevels()
  }, [])

  return (
    <section id="markets" className="py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">What you can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.title} className="p-5 bg-white/3 rounded-xl hover:scale-[1.02] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5"></path></svg>
                </div>
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-gray-300 text-sm">{it.desc}</div>
                  {it.title === 'AI arbitrage' && (
                    <div className="mt-2">
                      {loadingArbitrage ? (
                        <div className="text-xs text-gray-400">Loading levels...</div>
                      ) : errorArbitrage ? (
                        <div className="text-xs text-red-400">{errorArbitrage}</div>
                      ) : (
                        <div className="text-xs text-green-400">
                          {arbitrageLevels.length} levels available
                        </div>
                      )}
                    </div>
                  )}
                  {it.title === 'Binary options' && (
                    <div className="mt-2">
                      {loadingBinary ? (
                        <div className="text-xs text-gray-400">Loading levels...</div>
                      ) : errorBinary ? (
                        <div className="text-xs text-red-400">{errorBinary}</div>
                      ) : (
                        <div className="text-xs text-green-400">
                          {binaryLevels.length} levels available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button 
                  className="text-sm px-3 py-2 bg-white/6 rounded"
                  onClick={() => {
                    if (it.title === 'AI arbitrage') setShowArbitrageLevels(!showArbitrageLevels)
                    if (it.title === 'Binary options') setShowBinaryLevels(!showBinaryLevels)
                  }}
                >
                  {(it.title === 'AI arbitrage' && showArbitrageLevels) || (it.title === 'Binary options' && showBinaryLevels) ? 'Close' : 'Open'}
                </button>
              </div>
              {it.title === 'AI arbitrage' && showArbitrageLevels && !loadingArbitrage && !errorArbitrage && (
                <div className="mt-4 space-y-2">
                  {arbitrageLevels.map(level => (
                    <div key={level.level} className="p-3 bg-white/2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Level {level.level}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          level.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                          level.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {level.riskLevel}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {level.profitPercentage}% profit • Min ${level.minCapital} • {level.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {it.title === 'Binary options' && showBinaryLevels && !loadingBinary && !errorBinary && (
                <div className="mt-4 space-y-2">
                  {binaryLevels.map(level => (
                    <div key={level.level} className="p-3 bg-white/2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Level {level.level}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          level.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                          level.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {level.riskLevel}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {level.profitPercentage}% payout • Min ${level.minCapital} • {level.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
