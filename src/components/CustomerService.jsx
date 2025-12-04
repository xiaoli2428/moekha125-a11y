import React, { useState, useEffect, useRef } from 'react'

export default function CustomerService({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! Welcome to Onchainweb Customer Support. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate backend processing and response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay 1-3 seconds
  }

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    let response = ''

    if (input.includes('arbitrage') || input.includes('ai')) {
      response = 'For AI arbitrage questions, our automated strategies help maximize profits across multiple trading pairs. Would you like me to explain the risk levels or help you get started?'
    } else if (input.includes('binary') || input.includes('options')) {
      response = 'Binary options trading offers fixed payouts with clear timeframes. We have levels from 5 minutes to 15 minutes. Which level interests you?'
    } else if (input.includes('trade') || input.includes('spot')) {
      response = 'Spot trading includes instant swaps and limit orders. Our platform supports multiple pairs with competitive fees. Need help placing an order?'
    } else if (input.includes('wallet') || input.includes('connect')) {
      response = 'Wallet connection is coming soon! We support MetaMask, WalletConnect, and other popular wallets. Stay tuned for updates.'
    } else if (input.includes('help') || input.includes('support')) {
      response = 'I\'m here to help! You can ask about trading features, account setup, or technical issues. What specific assistance do you need?'
    } else if (input.includes('contact') || input.includes('email')) {
      response = 'For complex issues, you can reach our support team at support@onchainweb.com. We typically respond within 24 hours.'
    } else {
      response = 'Thanks for your message! Our team is here to help with all your DeFi trading needs. Could you please provide more details about what you\'re looking for?'
    }

    return {
      id: messages.length + 2,
      type: 'bot',
      content: response,
      timestamp: new Date()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Onchainweb Support</h3>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close customer service chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white'
                  : 'bg-white/10 text-gray-100'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Our support team is here 24/7. For urgent issues, mention "urgent" in your message.
          </p>
        </div>
      </div>
    </div>
  )
}