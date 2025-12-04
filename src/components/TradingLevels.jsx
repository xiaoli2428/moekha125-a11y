import React from 'react'

export default function TradingLevels({ levels, loading, error, feature }) {
  if (loading) {
    return <div className="text-xs text-gray-400">Loading levels...</div>
  }

  if (error) {
    return <div className="text-xs text-red-400">{error}</div>
  }

  if (!levels || levels.length === 0) {
    return <div className="text-xs text-gray-400">No levels available</div>
  }

  const isBinaryOptions = feature === 'binary_options'

  return (
    <div className="mt-4 space-y-2 transition-all duration-300 ease-in-out" role="list" aria-label={`${feature.replace('_', ' ')} trading levels`}>
      {levels.map(level => (
        <div key={level.level} className="p-3 bg-white/2 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Level {level.level}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              level.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
              level.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`} aria-label={`Risk level: ${level.riskLevel}`}>
              {level.riskLevel}
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {level.profitPercentage}% {isBinaryOptions ? 'payout' : 'profit'} • Min ${level.minCapital} • {level.duration}
          </div>
          <button className="mt-2 text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded hover:scale-105 transition transform focus:outline-none focus:ring-2 focus:ring-purple-500">
            Start Trading
          </button>
        </div>
      ))}
    </div>
  )
}