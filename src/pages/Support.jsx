import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supportAPI } from '../services/api'

export default function Support() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', category: 'general' })
  const messagesEndRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchTickets()
  }, [token])

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket.id)
    }
  }, [selectedTicket?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [responses])

  const fetchTickets = async () => {
    try {
      const data = await supportAPI.getTickets('all', 100, 0)
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetails = async (ticketId) => {
    try {
      const data = await supportAPI.getTicketById(ticketId)
      setResponses(data.responses || [])
    } catch (error) {
      console.error('Failed to fetch ticket details:', error)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return

    try {
      const data = await supportAPI.createTicket(newTicket.subject, newTicket.message, newTicket.category)
      setTickets([data.ticket, ...tickets])
      setSelectedTicket(data.ticket)
      setShowNewTicket(false)
      setNewTicket({ subject: '', message: '', category: 'general' })
      setResponses([])
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket) return

    try {
      const data = await supportAPI.addResponse(selectedTicket.id, newMessage)
      setResponses([...responses, data.response])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'resolved': return 'bg-blue-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '🔧'
      case 'billing': return '💳'
      case 'account': return '👤'
      case 'trading': return '📊'
      default: return '💬'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Customer Support
            </h1>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition"
          >
            + New Ticket
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Tickets List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold text-lg">Your Tickets</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p>No tickets yet</p>
                  <p className="text-sm mt-1">Create a new ticket to get help</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition ${selectedTicket?.id === ticket.id ? 'bg-gray-700' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(ticket.category)}</span>
                          <h3 className="font-medium truncate">{ticket.subject}</h3>
                        </div>
                        <p className="text-sm text-gray-400 truncate mt-1">{ticket.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(ticket.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)} text-white`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">{selectedTicket.subject}</h2>
                      <p className="text-sm text-gray-400">
                        {getCategoryIcon(selectedTicket.category)} {selectedTicket.category} • Ticket #{selectedTicket.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedTicket.status)} text-white`}>
                      {selectedTicket.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Initial message */}
                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-purple-600 rounded-2xl rounded-tr-sm px-4 py-3">
                      <p>{selectedTicket.message}</p>
                      <p className="text-xs text-purple-200 mt-1">{formatDate(selectedTicket.created_at)}</p>
                    </div>
                  </div>

                  {/* Responses */}
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`flex ${response.is_staff ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${response.is_staff
                          ? 'bg-gray-700 rounded-tl-sm'
                          : 'bg-purple-600 rounded-tr-sm'
                          }`}
                      >
                        {response.is_staff && (
                          <p className="text-xs text-green-400 mb-1">🛡️ Support Agent</p>
                        )}
                        <p>{response.message}</p>
                        <p className={`text-xs mt-1 ${response.is_staff ? 'text-gray-400' : 'text-purple-200'}`}>
                          {formatDate(response.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {selectedTicket.status !== 'closed' && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="p-4 border-t border-gray-700 text-center text-gray-400">
                    This ticket is closed
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl">Select a ticket to view conversation</p>
                  <p className="text-sm mt-2">Or create a new ticket to get help</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Create New Ticket</h2>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="general">💬 General</option>
                  <option value="technical">🔧 Technical Issue</option>
                  <option value="billing">💳 Billing</option>
                  <option value="account">👤 Account</option>
                  <option value="trading">📊 Trading</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
