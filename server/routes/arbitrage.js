import express from 'express'
import {
  createArbitrageSetting,
  getArbitrageSettings,
  toggleArbitrage,
  getArbitrageTrades
} from '../controllers/arbitrageController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/settings', authenticate, requireAdmin, createArbitrageSetting)
router.get('/settings', authenticate, requireAdmin, getArbitrageSettings)
router.patch('/settings/:id/toggle', authenticate, requireAdmin, toggleArbitrage)
router.get('/trades', authenticate, requireAdmin, getArbitrageTrades)

export default router
