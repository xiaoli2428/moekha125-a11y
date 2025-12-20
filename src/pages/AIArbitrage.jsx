import { useState, useEffect } from 'react';
import demoAccountService from '../services/demoAccountService';

const STRATEGIES = [
  { id: 'conservative', name: 'Conservative', risk: 'Low', return: '5-10%', description: 'Safe trading with minimal risk' },
  { id: 'balanced', name: 'Balanced', risk: 'Medium', return: '10-20%', description: 'Balanced risk-reward ratio' },
  { id: 'aggressive', name: 'Aggressive', risk: 'High', return: '20-50%', description: 'High risk, high reward strategy' },
];

const BOT_STATS = {
  conservative: { winRate: 72, trades: 1248, profit: 8.5 },
  balanced: { winRate: 65, trades: 2156, profit: 15.2 },
  aggressive: { winRate: 58, trades: 3421, profit: 32.8 },
};

export default function AIArbitrage() {
  const [accountMode, setAccountMode] = useState('demo');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [investAmount, setInvestAmount] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [botData, setBotData] = useState({
    currentProfit: 0,
    trades: 0,
    wins: 0,
    runtime: 0,
  });
  const [notification, setNotification] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);

  useEffect(() => {
    setAccountMode(demoAccountService.getAccountMode());
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && selectedStrategy) {
      interval = setInterval(() => {
        // Simulate bot trading
        const stats = BOT_STATS[selectedStrategy.id];
        const isWin = Math.random() < (stats.winRate / 100);
        const tradeAmount = investAmount * 0.02; // 2% of investment per trade
        const profit = isWin ? tradeAmount * 0.85 : -tradeAmount;

        setBotData(prev => ({
          currentProfit: prev.currentProfit + profit,
          trades: prev.trades + 1,
          wins: prev.wins + (isWin ? 1 : 0),
          runtime: prev.runtime + 5,
        }));

        // Add to trade history
        setTradeHistory(prev => [{
          id: Date.now(),
          pair: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'][Math.floor(Math.random() * 3)],
          profit: profit,
          isWin,
          time: new Date().toLocaleTimeString(),
        }, ...prev.slice(0, 19)]);

        // Update demo balance
        if (accountMode === 'demo') {
          demoAccountService.updateDemoBalance(profit);
        }
      }, 5000); // Trade every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedStrategy, investAmount, accountMode]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStart = () => {
    if (!selectedStrategy) {
      showNotification('Please select a strategy first', 'error');
      return;
    }

    const balance = demoAccountService.getDemoBalance();
    if (accountMode === 'demo' && investAmount > balance) {
      showNotification('Insufficient demo balance', 'error');
      return;
    }

    setIsRunning(true);
    setBotData({ currentProfit: 0, trades: 0, wins: 0, runtime: 0 });
    setTradeHistory([]);
    showNotification(`AI Bot started with ${selectedStrategy.name} strategy`, 'success');
  };

  const handleStop = () => {
    setIsRunning(false);
    showNotification(`Bot stopped. Total profit: $${botData.currentProfit.toFixed(2)}`, 'info');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-center ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AI Arbitrage</h1>
            <p className="text-sm text-gray-400">Automated trading bot</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            accountMode === 'demo' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {accountMode === 'demo' ? 'Demo' : 'Real'}
          </div>
        </div>
      </div>

      {/* Bot Status Card */}
      {isRunning && (
        <div className="m-4 p-4 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">Bot Running</span>
            </div>
            <span className="text-sm text-gray-400">{formatTime(botData.runtime)}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${botData.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {botData.currentProfit >= 0 ? '+' : ''}${botData.currentProfit.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{botData.trades}</div>
              <div className="text-xs text-gray-400">Trades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {botData.trades > 0 ? ((botData.wins / botData.trades) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Selection */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Select Strategy</h2>
        <div className="space-y-3">
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => !isRunning && setSelectedStrategy(strategy)}
              disabled={isRunning}
              className={`w-full p-4 rounded-xl text-left transition ${
                selectedStrategy?.id === strategy.id
                  ? 'bg-purple-500/20 border-2 border-purple-500'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{strategy.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  strategy.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                  strategy.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {strategy.risk} Risk
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-2">{strategy.description}</div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Expected Return: <span className="text-green-400">{strategy.return}</span></span>
                <span>Win Rate: <span className="text-blue-400">{BOT_STATS[strategy.id].winRate}%</span></span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Investment Amount */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Investment Amount</h2>
        <div className="flex gap-2 mb-4">
          {[100, 500, 1000, 5000].map((val) => (
            <button
              key={val}
              onClick={() => !isRunning && setInvestAmount(val)}
              disabled={isRunning}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                investAmount === val
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              } disabled:opacity-50`}
            >
              ${val}
            </button>
          ))}
        </div>
        {accountMode === 'demo' && (
          <div className="text-xs text-gray-500 text-center">
            Demo Balance: ${demoAccountService.getDemoBalance().toFixed(2)}
          </div>
        )}
      </div>

      {/* Start/Stop Button */}
      <div className="px-4 pb-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!selectedStrategy}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl font-bold text-lg transition hover:opacity-90 disabled:opacity-50"
          >
            Start AI Bot
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-lg transition"
          >
            Stop Bot
          </button>
        )}
      </div>

      {/* Trade History */}
      {tradeHistory.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Live Trade Feed</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tradeHistory.map((trade) => (
              <div 
                key={trade.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  trade.isWin ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{trade.isWin ? '✅' : '❌'}</span>
                  <div>
                    <div className="text-sm font-medium">{trade.pair}</div>
                    <div className="text-xs text-gray-500">{trade.time}</div>
                  </div>
                </div>
                <div className={`font-medium ${trade.isWin ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mx-4 mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="text-blue-400 font-medium mb-2">ℹ️ How AI Arbitrage Works</div>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Our AI analyzes market patterns in real-time</li>
          <li>• Executes trades automatically based on your strategy</li>
          <li>• Profits are added to your balance instantly</li>
          <li>• You can stop the bot at any time</li>
        </ul>
      </div>
    </div>
  );
}
