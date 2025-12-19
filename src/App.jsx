import React from 'react'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import CustomerService from './components/CustomerService';
import SideMenu from './components/SideMenu';
import SimpleLogin from './components/SimpleLogin';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import About from './pages/About';
import Support from './pages/Support';
import { authAPI } from './services/api';

function AppLayout({ children, onLogout, userRole }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-white">
              OnchainWeb
            </Link>
            <div className="flex gap-6 items-center">
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                to="/trade"
                className="text-gray-300 hover:text-white transition"
              >
                Trade
              </Link>
              <Link
                to="/wallet"
                className="text-gray-300 hover:text-white transition"
              >
                Wallet
              </Link>
              <Link
                to="/about"
                className="text-gray-300 hover:text-white transition"
              >
                About
              </Link>
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">{children}</main>
      {(userRole === 'admin' || userRole === 'master') && (
        <footer className="bg-black/30 border-t border-white/10 py-3">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Link
              to="/admin"
              className="text-xs text-gray-500 hover:text-gray-400 transition"
            >
              {userRole === 'master' ? 'Master Control Panel' : 'Admin Panel'}
            </Link>
          </div>
        </footer>
      )}
      {/* Customer Service floating button */}
      <CustomerService />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const profile = await authAPI.getProfile();
        setIsAuthenticated(true);
        setUserRole(profile.role);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <SimpleLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout onLogout={handleLogout} userRole={userRole}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/trade" element={<Trading />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/support" element={<Support />} />
                  {(userRole === 'admin' || userRole === 'master') && (
                    <Route path="/admin" element={<Admin userRole={userRole} />} />
                  )}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}