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
    <div className="mt-4 space-y-2">
      {levels.map(level => (
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
            {level.profitPercentage}% {isBinaryOptions ? 'payout' : 'profit'} • Min ${level.minCapital} • {level.duration}
          </div>
        </div>
      ))}
    </div>
  )
}