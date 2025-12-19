import express from 'express'
import {
  getAllUsers,
  getUserById,
  updateUserBalance,
  updateUserCreditScore,
  updateUserStatus,
  getDashboardStats,
  getAllTickets,
  getTradingLevels,
  createTradingLevel,
  updateTradingLevel,
  deleteTradingLevel,
  getAllTrades,
  settleTrade,
  getArbitrageLevels,
  createArbitrageLevel,
  updateArbitrageLevel,
  deleteArbitrageLevel,
  getArbitrageTrades,
  settleArbitrageTrade,
  getAllKYCSubmissions,
  reviewKYC
} from '../controllers/adminController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin)

router.get('/dashboard', getDashboardStats)
router.get('/users', getAllUsers)
router.get('/users/:id', getUserById)
router.patch('/users/:id/balance', updateUserBalance)
router.patch('/users/:id/credit-score', updateUserCreditScore)
router.patch('/users/:id/status', updateUserStatus)
router.get('/tickets', getAllTickets)

// Trading levels
router.get('/trading-levels', getTradingLevels)
router.post('/trading-levels', createTradingLevel)
router.patch('/trading-levels/:id', updateTradingLevel)
router.delete('/trading-levels/:id', deleteTradingLevel)

// AI Arbitrage levels
router.get('/arbitrage-levels', getArbitrageLevels)
router.post('/arbitrage-levels', createArbitrageLevel)
router.patch('/arbitrage-levels/:id', updateArbitrageLevel)
router.delete('/arbitrage-levels/:id', deleteArbitrageLevel)

// Trade management
router.get('/trades', getAllTrades)
router.post('/trades/:id/settle', settleTrade)

// AI Arbitrage trade management
router.get('/arbitrage-trades', getArbitrageTrades)
router.post('/arbitrage-trades/:id/settle', settleArbitrageTrade)

// KYC management
router.get('/kyc', getAllKYCSubmissions)
router.post('/kyc/:id/review', reviewKYC)

export default router
