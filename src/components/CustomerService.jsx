import React from 'react'

export default function CustomerService({ onClose }) {
  const handleContactSupport = () => {
    // Backend redirect to Telegram
    window.open('https://t.me/goblin_niko4', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/70 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Service</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Live Chat Support</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get instant help from our support team. We're here to assist you with any questions or issues.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-sm shadow-md hover:opacity-90 transition"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Support Hours</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-white">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Weekend:</span>
                <span className="text-white">10:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#docs" className="block text-purple-400 hover:text-purple-300 transition">
                📚 Documentation
              </a>
              <a href="#faq" className="block text-purple-400 hover:text-purple-300 transition">
                ❓ FAQ
              </a>
              <a href="#guides" className="block text-purple-400 hover:text-purple-300 transition">
                📖 Guides & Tutorials
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
