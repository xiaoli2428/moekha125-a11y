// Telegram Bot Service for Customer Support
// Forwards customer messages to admin Telegram account

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

const sendToTelegram = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.log('Telegram not configured, skipping notification')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        }),
      }
    )

    const result = await response.json()
    if (!result.ok) {
      console.error('Telegram API error:', result)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
    return false
  }
}

export const notifyNewTicket = async (ticket, user) => {
  const message = `🆕 <b>New Support Ticket</b>

📋 <b>Ticket ID:</b> ${ticket.id.slice(0, 8)}
👤 <b>User:</b> ${user.username || user.email}
📧 <b>Email:</b> ${user.email}
📂 <b>Category:</b> ${ticket.category}
📌 <b>Subject:</b> ${ticket.subject}

💬 <b>Message:</b>
${ticket.message}

⏰ <b>Time:</b> ${new Date().toLocaleString()}`

  return sendToTelegram(message)
}

export const notifyNewMessage = async (ticketId, message, user, isFromAdmin = false) => {
  if (isFromAdmin) return // Don't notify admin of their own messages

  const telegramMessage = `💬 <b>New Customer Reply</b>

📋 <b>Ticket ID:</b> ${ticketId.slice(0, 8)}
👤 <b>From:</b> ${user.username || user.email}

💬 <b>Message:</b>
${message}

⏰ <b>Time:</b> ${new Date().toLocaleString()}`

  return sendToTelegram(telegramMessage)
}

export const notifyTicketStatusChange = async (ticket, newStatus) => {
  const statusEmoji = {
    'open': '🟢',
    'in_progress': '🟡',
    'resolved': '✅',
    'closed': '🔴'
  }

  const message = `${statusEmoji[newStatus] || '📋'} <b>Ticket Status Updated</b>

📋 <b>Ticket ID:</b> ${ticket.id.slice(0, 8)}
📌 <b>Subject:</b> ${ticket.subject}
📊 <b>New Status:</b> ${newStatus.toUpperCase()}

⏰ <b>Time:</b> ${new Date().toLocaleString()}`

  return sendToTelegram(message)
}

export default {
  notifyNewTicket,
  notifyNewMessage,
  notifyTicketStatusChange,
  sendToTelegram
}
