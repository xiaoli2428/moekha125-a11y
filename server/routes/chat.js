import express from 'express'
import {
  getChatMessages,
  sendChatMessage,
  getUnreadCount,
  getAllChats,
  getUserChatMessages,
  sendAdminReply
} from '../controllers/chatController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// User routes
router.get('/messages', authenticate, getChatMessages)
router.post('/messages', authenticate, sendChatMessage)
router.get('/unread', authenticate, getUnreadCount)

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllChats)
router.get('/admin/:userId', authenticate, requireAdmin, getUserChatMessages)
router.post('/admin/:userId', authenticate, requireAdmin, sendAdminReply)

export default router
