import express from 'express'
import { deposit, withdraw, transfer, getTransactions } from '../controllers/walletController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/deposit', authenticate, deposit)
router.post('/withdraw', authenticate, withdraw)
router.post('/transfer', authenticate, transfer)
router.get('/transactions', authenticate, getTransactions)

export default router
