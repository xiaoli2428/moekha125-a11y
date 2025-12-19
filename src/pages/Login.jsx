import { useState } from 'react';
import { authAPI } from '../services/api';
import MultiWalletConnect from '../components/MultiWalletConnect';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authAPI.register(formData);
        console.log('Register response:', response);
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        console.log('Login response:', response);
        localStorage.setItem('token', response.token);
        onLogin();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = (data) => {
    console.log('Wallet login successful:', data);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OnchainWeb</h1>
          <p className="text-gray-400">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {/* Login Method Tabs */}
          {!isRegister && (
            <div className="flex mb-6 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setLoginMethod('wallet')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'wallet'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Wallet
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('https://moekha125-a11y.onrender.com/api/health');
                    const data = await res.json();
                    alert(`Connection Test: ${res.ok ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(data)}`);
                  } catch (e) {
                    alert(`Connection Test: ERROR - ${e.message}`);
                  }
                }}
                className="block mt-2 text-xs underline opacity-70"
              >
                Test Connection to Server
              </button>
            </div>
          )}

          {/* Wallet Login */}
          {loginMethod === 'wallet' && !isRegister ? (
            <div className="space-y-4">
              <MultiWalletConnect onWalletLogin={handleWalletLogin} />
              <div className="text-center text-gray-500 text-sm mt-4">
                Connect any Web3 wallet to login instantly
              </div>
            </div>
          ) : (
            /* Email/Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="johndoe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setLoginMethod('email');
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isRegister
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
