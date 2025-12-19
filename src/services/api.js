const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Helper to get auth token
const getToken = () => localStorage.getItem('token')

// Helper to handle API calls
async function apiCall(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Auth API
export const authAPI = {
  register: (data) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getProfile: () => apiCall('/auth/profile'),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// Wallet API
export const walletAPI = {
  deposit: (amount) =>
    apiCall('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  withdraw: (amount) =>
    apiCall('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  transfer: (toUsername, amount) =>
    apiCall('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ toUsername, amount })
    }),

  getTransactions: (limit = 50, offset = 0) =>
    apiCall(`/wallet/transactions?limit=${limit}&offset=${offset}`)
}

// Trading API
export const tradingAPI = {
  placeTrade: (pair, direction, amount, duration) =>
    apiCall('/trading/place', {
      method: 'POST',
      body: JSON.stringify({ pair, direction, amount, duration })
    }),

  getTrades: (status = 'all', limit = 50, offset = 0) =>
    apiCall(`/trading?status=${status}&limit=${limit}&offset=${offset}`),

  getTradeById: (id) => apiCall(`/trading/${id}`)
}

// Support API
export const supportAPI = {
  createTicket: (subject, message, category = 'general') =>
    apiCall('/support', {
      method: 'POST',
      body: JSON.stringify({ subject, message, category })
    }),

  getTickets: (status = 'all', limit = 50, offset = 0) =>
    apiCall(`/support?status=${status}&limit=${limit}&offset=${offset}`),

  getTicketById: (id) => apiCall(`/support/${id}`),

  addResponse: (ticketId, message) =>
    apiCall(`/support/${ticketId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
}

// Admin API
export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),

  getAllUsers: (status = 'all', limit = 50, offset = 0) =>
    apiCall(`/admin/users?status=${status}&limit=${limit}&offset=${offset}`),

  getUserById: (id) => apiCall(`/admin/users/${id}`),

  updateUserBalance: (id, amount, action) =>
    apiCall(`/admin/users/${id}/balance`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, action })
    }),

  updateUserCreditScore: (id, credit_score) =>
    apiCall(`/admin/users/${id}/credit-score`, {
      method: 'PATCH',
      body: JSON.stringify({ credit_score })
    }),

  updateUserStatus: (id, status) =>
    apiCall(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getAllTickets: (status = 'all', limit = 50, offset = 0) =>
    apiCall(`/admin/tickets?status=${status}&limit=${limit}&offset=${offset}`),

  // Trading levels management
  getTradingLevels: () => apiCall('/admin/trading-levels'),

  createTradingLevel: (data) =>
    apiCall('/admin/trading-levels', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTradingLevel: (id, data) =>
    apiCall(`/admin/trading-levels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteTradingLevel: (id) =>
    apiCall(`/admin/trading-levels/${id}`, {
      method: 'DELETE'
    }),

  // AI Arbitrage levels management
  getArbitrageLevels: () => apiCall('/admin/arbitrage-levels'),

  createArbitrageLevel: (data) =>
    apiCall('/admin/arbitrage-levels', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateArbitrageLevel: (id, data) =>
    apiCall(`/admin/arbitrage-levels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteArbitrageLevel: (id) =>
    apiCall(`/admin/arbitrage-levels/${id}`, {
      method: 'DELETE'
    }),

  // Trade management
  getAllTrades: (limit = 100, offset = 0) =>
    apiCall(`/admin/trades?limit=${limit}&offset=${offset}`),

  settleTrade: (id, result) =>
    apiCall(`/admin/trades/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify({ result })
    }),

  // AI Arbitrage trade management
  getArbitrageTrades: (limit = 100, offset = 0) =>
    apiCall(`/admin/arbitrage-trades?limit=${limit}&offset=${offset}`),

  settleArbitrageTrade: (id, result) =>
    apiCall(`/admin/arbitrage-trades/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify({ result })
    }),

  // KYC management
  getAllKYCSubmissions: (status = 'all', limit = 50, offset = 0) =>
    apiCall(`/admin/kyc?status=${status}&limit=${limit}&offset=${offset}`),

  reviewKYC: (id, status, admin_notes = '') =>
    apiCall(`/admin/kyc/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, admin_notes })
    }),

  // Arbitrage
  createArbitrageSetting: (settings) =>
    apiCall('/arbitrage/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    }),

  getArbitrageSettings: () => apiCall('/arbitrage/settings'),

  toggleArbitrage: (id, isActive) =>
    apiCall(`/arbitrage/settings/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    }),

  getArbitrageTrades: (settingId, limit = 100, offset = 0) => {
    const params = new URLSearchParams({ limit, offset })
    if (settingId) params.append('settingId', settingId)
    return apiCall(`/arbitrage/trades?${params}`)
  }
}

// KYC API
export const kycAPI = {
  submitKYC: (data) =>
    apiCall('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMySubmissions: () => apiCall('/kyc/my-submissions'),

  getStatus: () => apiCall('/kyc/status')
};

export default {
  auth: authAPI,
  wallet: walletAPI,
  trading: tradingAPI,
  support: supportAPI,
  admin: adminAPI
}
