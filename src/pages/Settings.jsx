import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      trades: true,
      news: false
    },
    display: {
      theme: 'dark',
      language: 'en',
      currency: 'USD'
    },
    trading: {
      confirmTrades: true,
      defaultAmount: 100,
      riskLevel: 'medium'
    }
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const handleSelect = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In production, save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-4 mb-6">
            ✓ Settings saved successfully
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔔 Notifications
          </h2>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Get alerts on your device' },
              { key: 'trades', label: 'Trade Alerts', desc: 'Notifications for trade outcomes' },
              { key: 'news', label: 'News Updates', desc: 'Daily crypto news digest' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-400">{item.desc}</div>
                </div>
                <button
                  onClick={() => handleToggle('notifications', item.key)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notifications[item.key] ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎨 Display
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Theme</label>
              <div className="flex gap-2">
                {['dark', 'light', 'auto'].map(theme => (
                  <button
                    key={theme}
                    onClick={() => handleSelect('display', 'theme', theme)}
                    className={`px-4 py-2 rounded-lg capitalize transition ${
                      settings.display.theme === theme
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) => handleSelect('display', 'language', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Currency</label>
              <select
                value={settings.display.currency}
                onChange={(e) => handleSelect('display', 'currency', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trading */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📈 Trading
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Confirm Trades</div>
                <div className="text-sm text-gray-400">Show confirmation before placing trades</div>
              </div>
              <button
                onClick={() => handleToggle('trading', 'confirmTrades')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.trading.confirmTrades ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.trading.confirmTrades ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Trade Amount</label>
              <input
                type="number"
                value={settings.trading.defaultAmount}
                onChange={(e) => handleSelect('trading', 'defaultAmount', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => handleSelect('trading', 'riskLevel', level)}
                    className={`px-4 py-2 rounded-lg capitalize transition flex-1 ${
                      settings.trading.riskLevel === level
                        ? level === 'low' ? 'bg-green-500 text-white' :
                          level === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
