import express from 'express'
import supabase from '../config/database.js'

const router = express.Router()

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

// Webhook endpoint for Telegram bot
router.post('/webhook', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.text) {
      return res.status(200).json({ ok: true })
    }

    // Only process messages from admin chat
    if (String(message.chat.id) !== TELEGRAM_ADMIN_CHAT_ID) {
      console.log('Message from unknown chat:', message.chat.id)
      return res.status(200).json({ ok: true })
    }

    const text = message.text

    // Check if this is a chat command: /chat <user_id> <message>
    if (text.startsWith('/chat ')) {
      const parts = text.slice(6).split(' ')
      const userIdPrefix = parts[0]
      const chatMessage = parts.slice(1).join(' ')

      if (!userIdPrefix || !chatMessage) {
        await sendTelegramMessage('❌ Usage: /chat <user_id> <message>\n\nExample: /chat abc123 Hello, how can I help you?')
        return res.status(200).json({ ok: true })
      }

      // Find user by ID prefix
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .ilike('id', `${userIdPrefix}%`)
        .limit(1)

      if (userError || !users || users.length === 0) {
        await sendTelegramMessage(`❌ User not found with ID starting with: ${userIdPrefix}`)
        return res.status(200).json({ ok: true })
      }

      const user = users[0]

      // Add chat message
      const { error: chatError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: chatMessage,
          is_from_admin: true
        })

      if (chatError) {
        console.error('Failed to send chat message:', chatError)
        await sendTelegramMessage(`❌ Failed to send message: ${chatError.message}`)
        return res.status(200).json({ ok: true })
      }

      await sendTelegramMessage(`✅ Message sent to user ${userIdPrefix}`)
      return res.status(200).json({ ok: true })
    }

    // Check if this is a reply command: /reply <ticket_id> <message>
    if (text.startsWith('/reply ')) {
      const parts = text.slice(7).split(' ')
      const ticketIdPrefix = parts[0]
      const replyMessage = parts.slice(1).join(' ')

      if (!ticketIdPrefix || !replyMessage) {
        await sendTelegramMessage('❌ Usage: /reply <ticket_id> <message>\n\nExample: /reply abc123 Your issue has been resolved.')
        return res.status(200).json({ ok: true })
      }

      // Find ticket by ID prefix
      const { data: tickets, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .ilike('id', `${ticketIdPrefix}%`)
        .limit(1)

      if (ticketError || !tickets || tickets.length === 0) {
        await sendTelegramMessage(`❌ Ticket not found with ID starting with: ${ticketIdPrefix}`)
        return res.status(200).json({ ok: true })
      }

      const ticket = tickets[0]

      // Get admin user (first admin in database)
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (!adminUser) {
        await sendTelegramMessage('❌ No admin user found in database')
        return res.status(200).json({ ok: true })
      }

      // Add response to ticket
      const { error: responseError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticket.id,
          user_id: adminUser.id,
          message: replyMessage,
          is_staff: true
        })

      if (responseError) {
        console.error('Failed to add response:', responseError)
        await sendTelegramMessage(`❌ Failed to send reply: ${responseError.message}`)
        return res.status(200).json({ ok: true })
      }

      // Update ticket status to in_progress if it was open
      if (ticket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', ticket.id)
      }

      await sendTelegramMessage(`✅ Reply sent successfully to ticket ${ticketIdPrefix}`)
      return res.status(200).json({ ok: true })
    }

    // Check if this is a close command: /close <ticket_id>
    if (text.startsWith('/close ')) {
      const ticketIdPrefix = text.slice(7).trim()

      const { data: tickets, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .ilike('id', `${ticketIdPrefix}%`)
        .limit(1)

      if (ticketError || !tickets || tickets.length === 0) {
        await sendTelegramMessage(`❌ Ticket not found with ID starting with: ${ticketIdPrefix}`)
        return res.status(200).json({ ok: true })
      }

      const ticket = tickets[0]

      await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticket.id)

      await sendTelegramMessage(`✅ Ticket ${ticketIdPrefix} has been closed`)
      return res.status(200).json({ ok: true })
    }

    // Check if this is a resolve command: /resolve <ticket_id>
    if (text.startsWith('/resolve ')) {
      const ticketIdPrefix = text.slice(9).trim()

      const { data: tickets, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .ilike('id', `${ticketIdPrefix}%`)
        .limit(1)

      if (ticketError || !tickets || tickets.length === 0) {
        await sendTelegramMessage(`❌ Ticket not found with ID starting with: ${ticketIdPrefix}`)
        return res.status(200).json({ ok: true })
      }

      const ticket = tickets[0]

      await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', ticket.id)

      await sendTelegramMessage(`✅ Ticket ${ticketIdPrefix} has been marked as resolved`)
      return res.status(200).json({ ok: true })
    }

    // Show help for unknown commands
    if (text.startsWith('/')) {
      await sendTelegramMessage(`📋 Available Commands:

/chat <user_id> <message>
Reply to live chat message

/reply <ticket_id> <message>
Reply to a support ticket

/resolve <ticket_id>
Mark ticket as resolved

/close <ticket_id>
Close a ticket

IDs are shown in notifications (first 8 characters)`)
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    res.status(200).json({ ok: true }) // Always return 200 to Telegram
  }
})

async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    })
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
  }
}

// Health check for Telegram integration
router.get('/status', (req, res) => {
  res.json({
    telegram_configured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID),
    timestamp: new Date().toISOString()
  })
})

export default router
