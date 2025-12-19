import express from 'express'
import { createTicket, getTickets, getTicketById, addResponse, updateTicketStatus } from '../controllers/supportController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, createTicket)
router.get('/', authenticate, getTickets)
router.get('/:id', authenticate, getTicketById)
router.post('/:id/responses', authenticate, addResponse)
router.patch('/:id/status', authenticate, requireAdmin, updateTicketStatus)

export default router
