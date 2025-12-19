import express from 'express'
import {
  getSupportedCoins,
  getDepositAddresses,
  getAllCoins,
  createCoin,
  updateCoin,
  deleteCoin,
  getUserDepositAddresses,
  setUserDepositAddress,
  deleteUserDepositAddress
} from '../controllers/coinsController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// User routes
router.get('/', getSupportedCoins)  // Public - get active coins
router.get('/deposit-addresses', authenticate, getDepositAddresses)

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllCoins)
router.post('/admin', authenticate, requireAdmin, createCoin)
router.patch('/admin/:id', authenticate, requireAdmin, updateCoin)
router.delete('/admin/:id', authenticate, requireAdmin, deleteCoin)

// Admin - User deposit addresses
router.get('/admin/addresses/:userId', authenticate, requireAdmin, getUserDepositAddresses)
router.post('/admin/addresses/:userId', authenticate, requireAdmin, setUserDepositAddress)
router.delete('/admin/addresses/:addressId', authenticate, requireAdmin, deleteUserDepositAddress)

export default router
