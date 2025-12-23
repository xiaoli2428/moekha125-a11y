import { handleCors, setCorsHeaders } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // POST /api/telegram/webhook
        if (req.method === 'POST' && req.url === '/api/telegram/webhook') {
            return handleWebhook(req, res);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Telegram error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleWebhook(req, res) {
    try {
        const { message } = req.body;

        if (!message || !message.text) {
            return res.status(200).json({ ok: true });
        }

        // Only process messages from admin chat
        if (String(message.chat.id) !== TELEGRAM_ADMIN_CHAT_ID) {
            console.log('Message from unknown chat:', message.chat.id);
            return res.status(200).json({ ok: true });
        }

        const text = message.text;

        // Check if this is a chat command: /chat <user_id> <message>
        if (text.startsWith('/chat ')) {
            const parts = text.slice(6).split(' ');
            const userIdPrefix = parts[0];
            const chatMessage = parts.slice(1).join(' ');

            // Find user by email prefix or ID
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .or(`email.ilike.${userIdPrefix}%,id.eq.${userIdPrefix}`)
                .limit(1)
                .single();

            if (user) {
                // Save message to chat
                await supabase
                    .from('chat_messages')
                    .insert({
                        user_id: user.id,
                        message: chatMessage,
                        sender: 'admin'
                    });

                return res.status(200).json({ ok: true });
            }
        }

        // Echo back (simple response)
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ ok: true });
    }
}
