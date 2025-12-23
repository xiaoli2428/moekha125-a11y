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
const PORT = process.env.PORT || 8000

// Trust proxy for rate limiting (Railway/Vercel sets X-Forwarded-For)
app.set('trust proxy', 1)

// Rate limiting for auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for health check and non-auth endpoints
    return req.path === '/health' || !req.path.includes('/auth/')
  }
})

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// CORS - Allow all origins globally (allows login from any country/region)
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))

// Preflight requests handler
app.options('*', cors())

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
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send('{"status":"ok"}')
})

// Root health check (for Railway)
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send('{"status":"ok"}')
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
  // Only start background jobs if Supabase is configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('⚠️  Background jobs disabled - Supabase not configured')
    return
  }

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
  // Start background jobs without blocking
  startBackgroundJobs().catch(err => {
    console.log('Background jobs skipped:', err.message || 'not configured')
  })
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