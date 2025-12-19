import express from 'express'
import { submitKYC, getUserKYC, getKYCStatus } from '../controllers/kycController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All KYC routes require authentication
router.use(authenticate)

router.post('/submit', submitKYC)
router.get('/my-submissions', getUserKYC)
router.get('/status', getKYCStatus)

export default router
