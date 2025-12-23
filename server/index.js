import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import walletRoutes from './routes/wallet.js'
import tradingRoutes from './routes/trading.js'
import supportRoutes from './routes/support.js'
import arbitrageRoutes from './routes/arbitrage.js'
import adminRoutes from './routes/admin.js'
import kycRoutes from './routes/kyc.js'
import telegramRoutes from './routes/telegram.js'
import chatRoutes from './routes/chat.js'
import coinsRoutes from './routes/coins.js'
import marketRoutes from './routes/market.js'
import { settleExpiredTrades } from './controllers/tradingController.js'
import { executeArbitrage } from './controllers/arbitrageController.js'
import supabase from './config/database.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting for auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// CORS - Allow all origins for now (frontend needs access)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/trading', tradingRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/arbitrage', arbitrageRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/kyc', kycRoutes)
app.use('/api/telegram', telegramRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/coins', coinsRoutes)
app.use('/api/market', marketRoutes)

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Root health check (for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'OnchainWeb API',
    version: '1.0.0',
    status: 'running'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// Background jobs
async function startBackgroundJobs() {
  console.log('✓ Background jobs started')

  // Trade settlement: Every 10 seconds
  setInterval(async () => {
    try {
      await settleExpiredTrades()
    } catch (error) {
      // Silent fail - only log if important
      if (error.message && !error.message.includes('Invalid API key')) {
        console.error('Trade settlement error:', error.message)
      }
    }
  }, 10000)

  // Arbitrage execution: Every 30 seconds
  setInterval(async () => {
    try {
      await executeArbitrage()
    } catch (error) {
      // Silent fail - only log if important
      if (error.message && !error.message.includes('Invalid API key')) {
        console.error('Arbitrage error:', error.message)
      }
    }
  }, 30000)
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  startBackgroundJobs()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app