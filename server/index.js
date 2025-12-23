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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dist-vert-phi.vercel.app',
    'https://moekha125-a11y.vercel.app',
    'https://onchainweb.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Apply rate limiter to auth routes
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Routes
app.use('/api/auth', authRoutes)
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Background jobs
const startBackgroundJobs = () => {
  // Settle expired binary trades every 10 seconds
  setInterval(async () => {
    await settleExpiredTrades()
  }, 10000)

  // Execute arbitrage for active settings every 30 seconds
  setInterval(async () => {
    const { data: activeSettings } = await supabase
      .from('ai_arbitrage_settings')
      .select('id')
      .eq('is_active', true)

    for (const setting of activeSettings || []) {
      await executeArbitrage(setting.id)
    }
  }, 30000)

  console.log('Background jobs started')
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  startBackgroundJobs()
})

export default app
