import { useLocation, Link } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/market', label: 'Market', icon: MarketIcon },
    { path: '/trade', label: 'Trade', icon: TradeIcon },
    { path: '/ai-arbitrage', label: 'AI', icon: AIIcon },
    { path: '/wallet', label: 'Wallet', icon: WalletIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || 
            (item.path === '/dashboard' && currentPath === '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive 
                  ? 'text-purple-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon isActive={isActive} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-purple-400' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ isActive }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={isActive ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function MarketIcon({ isActive }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={isActive ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function TradeIcon({ isActive }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={isActive ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function AIIcon({ isActive }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={isActive ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function WalletIcon({ isActive }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={isActive ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
