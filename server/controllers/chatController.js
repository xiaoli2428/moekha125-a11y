import supabase from '../config/database.js'
import { notifyNewMessage } from '../services/telegramService.js'

// Get chat messages for a user
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 50, offset = 0 } = req.query

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      console.error('Get chat messages error:', error)
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_from_admin', true)
      .eq('is_read', false)

    res.json({ messages: messages || [] })
  } catch (error) {
    console.error('Get chat messages error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Send a chat message
export const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Get user info for notification
    const { data: user } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', userId)
      .single()

    // Insert message
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message.trim(),
        is_from_admin: false
      })
      .select()
      .single()

    if (error) {
      console.error('Send message error:', error)
      return res.status(500).json({ error: 'Failed to send message' })
    }

    // Send Telegram notification to admin
    await notifyNewMessage(userId.slice(0, 8), message, user || { email: 'Unknown', username: 'Unknown' }, false)

    res.status(201).json({ message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_from_admin', true)
      .eq('is_read', false)

    if (error) {
      return res.status(500).json({ error: 'Failed to get unread count' })
    }

    res.json({ unread: count || 0 })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Get all chats with users
export const getAllChats = async (req, res) => {
  try {
    // Get unique users with their last message
    const { data: chats, error } = await supabase
      .from('chat_messages')
      .select(`
        user_id,
        message,
        is_from_admin,
        created_at,
        users(id, username, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get all chats error:', error)
      return res.status(500).json({ error: 'Failed to fetch chats' })
    }

    // Group by user and get last message
    const userChats = {}
    for (const chat of chats || []) {
      if (!userChats[chat.user_id]) {
        userChats[chat.user_id] = {
          user_id: chat.user_id,
          user: chat.users,
          last_message: chat.message,
          is_from_admin: chat.is_from_admin,
          last_message_at: chat.created_at
        }
      }
    }

    // Get unread counts
    const { data: unreadData } = await supabase
      .from('chat_messages')
      .select('user_id')
      .eq('is_from_admin', false)
      .eq('is_read', false)

    const unreadCounts = {}
    for (const item of unreadData || []) {
      unreadCounts[item.user_id] = (unreadCounts[item.user_id] || 0) + 1
    }

    const result = Object.values(userChats).map(chat => ({
      ...chat,
      unread_count: unreadCounts[chat.user_id] || 0
    }))

    res.json({ chats: result })
  } catch (error) {
    console.error('Get all chats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Get chat messages for a specific user
export const getUserChatMessages = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }

    // Mark customer messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_from_admin', false)

    res.json({ messages: messages || [] })
  } catch (error) {
    console.error('Get user chat messages error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Send reply to user
export const sendAdminReply = async (req, res) => {
  try {
    const { userId } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message.trim(),
        is_from_admin: true
      })
      .select()
      .single()

    if (error) {
      console.error('Send admin reply error:', error)
      return res.status(500).json({ error: 'Failed to send message' })
    }

    res.status(201).json({ message: newMessage })
  } catch (error) {
    console.error('Send admin reply error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  getChatMessages,
  sendChatMessage,
  getUnreadCount,
  getAllChats,
  getUserChatMessages,
  sendAdminReply
}
