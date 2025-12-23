import React, { Suspense, lazy } from 'react'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { authAPI } from './services/api';

// Lazy load all other pages to speed up initial homepage
const CustomerService = lazy(() => import('./components/CustomerService'));
const SideMenu = lazy(() => import('./components/SideMenu'));
const DappPage = lazy(() => import('./pages/DappPage'));
const ProfileDropdown = lazy(() => import('./components/ProfileDropdown'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const Home = lazy(() => import('./pages/Home'));
const Market = lazy(() => import('./pages/Market'));
const BinaryTrading = lazy(() => import('./pages/BinaryTrading'));
const AIArbitrage = lazy(() => import('./pages/AIArbitrage'));
const WalletNew = lazy(() => import('./pages/WalletNew'));
const Admin = lazy(() => import('./pages/Admin'));
const About = lazy(() => import('./pages/About'));
const Support = lazy(() => import('./pages/Support'));
const Account = lazy(() => import('./pages/Account'));
const AssetHistory = lazy(() => import('./pages/AssetHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const Referral = lazy(() => import('./pages/Referral'));
const News = lazy(() => import('./pages/News'));
const NewsArticle = lazy(() => import('./pages/NewsArticle'));

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="animate-pulse text-white text-xl">Loading...</div>
  </div>
);

/**
 * OPTIMIZED ROUTING STRUCTURE:
 * 
 * "/" → LoginPage (FAST - no web3)
 * "/app" → DappPage (HEAVY - all web3, balances, RPC calls)
 * "/dashboard/*" → AppLayout with existing pages
 */

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Instant check from localStorage - no API call blocking
    return !!localStorage.getItem('token');
  });
  const [userRole, setUserRole] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached).role || 'user' : 'user';
  });
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    // Validate token in background - don't block initial render
    if (isAuthenticated) {
      validateToken();
    }
  }, []);

  const validateToken = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUserRole(profile.role);
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      // Token invalid - clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    if (data?.user) {
      setUser(data.user);
      setUserRole(data.user.role || 'user');
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* HOME PAGE - DIRECT TO DAPP (wallet-first flow like ddefi3.com) */}
          <Route path="/" element={<DappPage />} />

          {/* Legacy routes for backwards compatibility */}
          <Route path="/app" element={<DappPage />} />
          <Route path="/login" element={<DappPage />} />

          {/* LEGACY DASHBOARD ROUTES (for backwards compatibility) */}
          <Route
            path="/dashboard/*"
            element={
              isAuthenticated ? (
                <AppLayout onLogout={handleLogout} userRole={userRole} user={user}>
                  <Routes>
                    <Route path="/" element={<Home />} />
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
                <Navigate to="/" />
              )
            }
          />

          {/* Catch-all: redirect to login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>    </BrowserRouter>
  );
}