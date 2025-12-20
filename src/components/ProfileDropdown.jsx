import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'My Account',
      icon: '👤',
      path: '/account',
      description: 'View and edit your profile'
    },
    {
      label: 'Asset History',
      icon: '📊',
      path: '/asset-history',
      description: 'View transaction history'
    },
    {
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
      description: 'App preferences'
    },
    {
      label: 'Referral',
      icon: '🎁',
      path: '/referral',
      description: 'Invite friends & earn'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-full transition"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
          {user?.username?.charAt(0)?.toUpperCase() || user?.kycName?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {user?.kycName || user?.username || 'User'}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  UID: {user?.id?.slice(0, 8) || user?.shortUid || 'N/A'}
                </div>
              </div>
            </div>
            {user?.kycStatus && (
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.kycStatus === 'verified' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {user.kycStatus === 'verified' ? '✓ KYC Verified' : '⏳ KYC Pending'}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 transition text-left"
            >
              <span className="text-xl">🚪</span>
              <div>
                <div className="text-red-400 font-medium">Logout</div>
                <div className="text-xs text-gray-400">Sign out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
