import React from 'react'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import CustomerService from './components/CustomerService';
import SideMenu from './components/SideMenu';
import SimpleLogin from './components/SimpleLogin';
import ProfileDropdown from './components/ProfileDropdown';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Market from './pages/Market';
import BinaryTrading from './pages/BinaryTrading';
import AIArbitrage from './pages/AIArbitrage';
import WalletNew from './pages/WalletNew';
import Admin from './pages/Admin';
import About from './pages/About';
import Support from './pages/Support';
import Account from './pages/Account';
import AssetHistory from './pages/AssetHistory';
import Settings from './pages/Settings';
import Referral from './pages/Referral';
import News from './pages/News';
import NewsArticle from './pages/NewsArticle';
import { authAPI } from './services/api';

function AppLayout({ children, onLogout, userRole, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Pages that should use mobile app style (bottom nav)
  const mobileStylePages = ['/dashboard', '/market', '/trade', '/ai-arbitrage', '/wallet'];
  const isMobileStylePage = mobileStylePages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation - Hidden on main app pages for mobile-first design */}
      {!isMobileStylePage && (
        <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-white">
                OnchainWeb
              </Link>
              <div className="flex gap-6 items-center">
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition hidden md:block"
                >
                  Home
                </Link>
                <Link
                  to="/market"
                  className="text-gray-300 hover:text-white transition hidden md:block"
                >
                  Market
                </Link>
                <Link
                  to="/trade"
                  className="text-gray-300 hover:text-white transition hidden md:block"
                >
                  Trade
                </Link>
                <Link
                  to="/news"
                  className="text-gray-300 hover:text-white transition hidden md:block"
                >
                  News
                </Link>
                {/* Hamburger Menu Button */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition md:hidden"
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
                {/* Profile Dropdown */}
                <ProfileDropdown user={user} onLogout={onLogout} />
              </div>
            </div>
          </div>
        </nav>
      )}
      
      {/* Compact Header for main pages */}
      {isMobileStylePage && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="flex justify-between items-center px-4 py-3">
            <Link to="/dashboard" className="text-lg font-bold text-white">
              OnchainWeb
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
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
              <ProfileDropdown user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      )}
      
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Main Content with padding for fixed headers */}
      <main className={`flex-1 ${isMobileStylePage ? 'pt-14' : ''}`}>{children}</main>
      
      {/* Bottom Navigation for main pages */}
      {isMobileStylePage && <BottomNav />}
      
      {(userRole === 'admin' || userRole === 'master') && !isMobileStylePage && (
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
  const [user, setUser] = useState(null);
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
        setUser(profile);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    if (data?.user) {
      setUser(data.user);
      setUserRole(data.user.role || 'user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
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
              <AppLayout onLogout={handleLogout} userRole={userRole} user={user}>
                <Routes>
                  <Route path="/dashboard" element={<Home />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/trade" element={<BinaryTrading />} />
                  <Route path="/ai-arbitrage" element={<AIArbitrage />} />
                  <Route path="/wallet" element={<WalletNew />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/asset-history" element={<AssetHistory />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsArticle />} />
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
