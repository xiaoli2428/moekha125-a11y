import express from 'express'
import { register, login, getProfile, walletLogin } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/wallet-login', walletLogin)
router.get('/profile', authenticate, getProfile)

export default router
