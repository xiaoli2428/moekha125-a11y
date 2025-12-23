import { handleCors, setCorsHeaders, authenticate, isAdmin } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const user = await authenticate(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // GET /api/chat/messages
        if (req.method === 'GET' && req.url === '/api/chat/messages') {
            return getChatMessages(req, res, user);
        }

        // POST /api/chat/messages
        if (req.method === 'POST' && req.url === '/api/chat/messages') {
            return sendChatMessage(req, res, user);
        }

        // GET /api/chat/unread
        if (req.method === 'GET' && req.url === '/api/chat/unread') {
            return getUnreadCount(req, res, user);
        }

        // Admin routes
        if (!isAdmin(user)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // GET /api/chat/admin/all
        if (req.method === 'GET' && req.url === '/api/chat/admin/all') {
            return getAllChats(req, res);
        }

        // GET /api/chat/admin/[userId]
        if (req.method === 'GET' && req.url.match(/^\/api\/chat\/admin\/[^/]+$/)) {
            const userId = req.url.split('/').pop();
            return getUserChatMessages(req, res, userId);
        }

        // POST /api/chat/admin/[userId]
        if (req.method === 'POST' && req.url.match(/^\/api\/chat\/admin\/[^/]+$/)) {
            const userId = req.url.split('/').pop();
            return sendAdminReply(req, res, user, userId);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getChatMessages(req, res, user) {
    try {
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function sendChatMessage(req, res, user) {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const { data: chatMessage, error } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                message,
                sender: 'user'
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to send message' });
        }

        res.status(201).json({ message: 'Message sent', chatMessage });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUnreadCount(req, res, user) {
    try {
        const { count, error } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) {
            return res.status(500).json({ error: 'Failed to get unread count' });
        }

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllChats(req, res) {
    try {
        const { data: chats, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch chats' });
        }

        res.json({ chats });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUserChatMessages(req, res, userId) {
    try {
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function sendAdminReply(req, res, user, userId) {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const { data: chatMessage, error } = await supabase
            .from('chat_messages')
            .insert({
                user_id: userId,
                message,
                sender: 'admin',
                admin_id: user.id
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to send reply' });
        }

        res.status(201).json({ message: 'Reply sent', chatMessage });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
