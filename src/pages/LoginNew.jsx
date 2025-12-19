import { useState } from 'react';
import { authAPI } from '../services/api';
import MultiWalletConnectV2 from '../components/MultiWalletConnectV2';

export default function LoginNew({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
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
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setFormData({ email: '', password: '', username: '' });
      } else {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.token);
        onLogin();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = (data) => {
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
          {/* Wallet Connect First */}
          {!isRegister && (
            <div className="mb-6">
              <MultiWalletConnectV2 onWalletLogin={handleWalletLogin} />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Email Form */}
          {!isRegister ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="w-full text-sm text-gray-400 hover:text-white transition"
              >
                Don't have an account? Sign up
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
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
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>

              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="w-full text-sm text-gray-400 hover:text-white transition"
              >
                Already have an account? Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
