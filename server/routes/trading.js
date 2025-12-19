import express from 'express'
import { placeTrade, getTrades, getTradeById } from '../controllers/tradingController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/place', authenticate, placeTrade)
router.get('/', authenticate, getTrades)
router.get('/:id', authenticate, getTradeById)

export default router
