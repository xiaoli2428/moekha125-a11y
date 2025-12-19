import { useState } from 'react';

export default function CustomerService() {
  const [isOpen, setIsOpen] = useState(false);
  const telegramUsername = 'goblin_niko4';
  const telegramUrl = `https://t.me/${telegramUsername}`;

  const handleOpen = () => {
    setIsOpen(true);
    // Open Telegram in background (new tab)
    window.open(telegramUrl, '_blank');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Customer Service Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-105 z-40 flex items-center gap-2"
        aria-label="Open Customer Service"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="font-semibold">Support</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div
            className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Customer Service</h2>
                <p className="text-gray-400 text-sm mt-1">We're here to help 24/7</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.45 3.61-.52.36-.99.53-1.42.52-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 4-1.74 6.68-2.88 8.03-3.43 3.82-1.59 4.61-1.87 5.13-1.88.11 0 .37.03.54.17.14.11.18.26.2.37.02.09.04.29.02.45z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Telegram Support</div>
                    <div className="text-sm text-gray-400">@{telegramUsername}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Connect with our support team on Telegram for instant assistance with your trades, account, and platform questions.
                </p>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Open Telegram Chat
                </a>
              </div>

              {/* Additional Info */}
              <div className="text-sm text-gray-400 space-y-2">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Average response time: 2 minutes</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>24/7 support available</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Secure and encrypted messaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
