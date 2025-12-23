import { useState, useEffect } from 'react';
import LiveChat from './LiveChat';
import { chatAPI } from '../services/api';

export default function CustomerService() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      // Check for unread messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const data = await chatAPI.getUnreadCount();
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Customer Service Floating Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-105 z-40"
        aria-label="Open Customer Service"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Live Chat Component */}
      <LiveChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
