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

  const handleClose = () => {
    if (messages.length > 1) {
      const confirmClose = window.confirm('Are you sure you want to close the chat? Your conversation will be saved, but you might miss important updates from our support team.')
      if (!confirmClose) return
    }
    onClose()
  }

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

    try {
      // Simulate backend API call
      const response = await simulateBackendCall(inputMessage)
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      const errorResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: 'Sorry, I\'m experiencing technical difficulties. Please try again or contact support@onchainweb.com',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const simulateBackendCall = async (message) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate backend processing - in real app, this would be an API call
    const input = message.toLowerCase()

    if (input.includes('urgent') || input.includes('emergency')) {
      return '🚨 URGENT REQUEST DETECTED 🚨\n\nI\'ve flagged this for immediate attention. A human support agent will contact you within 5 minutes. Please stay online.\n\nFor immediate assistance, you can also call our hotline: +1-800-ONCHAIN'
    }

    if (input.includes('arbitrage') || input.includes('ai')) {
      return '🤖 AI Arbitrage Support:\n\nOur AI arbitrage system automatically scans multiple exchanges for price discrepancies. Current success rate: 94.2%\n\nAvailable levels:\n• Low Risk (5.2% profit, 24h duration)\n• Medium Risk (8.5% profit, 12h duration)  \n• High Risk (12.0% profit, 6h duration)\n\nWould you like me to help you start a position?'
    }

    if (input.includes('binary') || input.includes('options')) {
      return '📈 Binary Options Support:\n\nFixed-payout trading with clear timeframes. No margin calls, fixed risk.\n\nAvailable levels:\n• Quick Trade (75% payout, 5min)\n• Standard (85% payout, 10min)\n• Premium (95% payout, 15min)\n\nAll trades are settled automatically. Ready to place a trade?'
    }

    if (input.includes('wallet') || input.includes('connect')) {
      return '🔗 Wallet Integration:\n\nWe support:\n• MetaMask\n• WalletConnect\n• Coinbase Wallet\n• Trust Wallet\n\nIntegration launching Q1 2026. Join our waitlist for early access!\n\nFor now, you can practice with our simulated trading environment.'
    }

    if (input.includes('kyc') || input.includes('verification')) {
      return '🆔 KYC Verification:\n\nRequired for:\n• Withdrawals over $1000\n• Advanced trading features\n• Higher position limits\n\nProcess takes 5-10 minutes. Start verification now?'
    }

    if (input.includes('deposit') || input.includes('withdraw')) {
      return '💰 Deposits & Withdrawals:\n\n• Deposits: Instant (crypto)\n• Withdrawals: 1-24 hours\n• Minimum: $10\n• Maximum: $100,000/day\n\nNeed help with a transaction?'
    }

    // Default responses
    const defaultResponses = [
      'Thanks for your question! Our DeFi platform is designed for maximum security and profitability. What specific feature would you like to learn more about?',
      'I\'m here to help! Onchainweb offers AI-powered trading, binary options, and spot trading. Which interests you most?',
      'Great question! Our platform uses advanced algorithms to maximize your returns while minimizing risk. Would you like details on any specific trading strategy?',
      'Thanks for reaching out! We\'re committed to providing 24/7 support. Is there anything specific about our trading features you\'d like to know?'
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
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
            onClick={handleClose}
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
          <div className="flex gap-2 mb-2">
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
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const emailBody = messages.map(m => `${m.type === 'user' ? 'You' : 'Support'}: ${m.content}`).join('\n\n')
                window.open(`mailto:support@onchainweb.com?subject=Support Chat Transcript&body=${encodeURIComponent(emailBody)}`)
              }}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Escalate to human support
            </button>
            <p className="text-xs text-gray-400">
              24/7 support • Avg response: 2min
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}