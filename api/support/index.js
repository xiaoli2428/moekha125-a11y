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

        // Route: POST /api/support (create ticket)
        if (req.method === 'POST') {
            return createTicket(req, res, user);
        }

        // Route: GET /api/support (list tickets)
        if (req.method === 'GET' && !req.url.includes('/')) {
            return getTickets(req, res, user);
        }

        // Route: GET /api/support/[id] (get ticket details)
        if (req.method === 'GET' && req.url.match(/^\/api\/support\/[^/]+$/)) {
            const ticketId = req.url.split('/').pop();
            return getTicketById(req, res, user, ticketId);
        }

        // Route: POST /api/support/[id]/responses (add response)
        if (req.method === 'POST' && req.url.includes('/responses')) {
            const ticketId = req.url.split('/')[3];
            return addResponse(req, res, user, ticketId);
        }

        // Route: PATCH /api/support/[id]/status (update status - admin only)
        if (req.method === 'PATCH' && req.url.includes('/status')) {
            if (!isAdmin(user)) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            const ticketId = req.url.split('/')[3];
            return updateTicketStatus(req, res, user, ticketId);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Support error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createTicket(req, res, user) {
    try {
        const { subject, message, category = 'general' } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject,
                message,
                category,
                status: 'open',
                priority: 'normal'
            })
            .select()
            .single();

        if (error) {
            console.error('Create ticket error:', error);
            return res.status(500).json({ error: 'Failed to create ticket' });
        }

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTickets(req, res, user) {
    try {
        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch tickets' });
        }

        res.json({ tickets, total: tickets.length });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTicketById(req, res, user, ticketId) {
    try {
        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();

        if (error || !ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json({ ticket });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function addResponse(req, res, user, ticketId) {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const { data: response, error } = await supabase
            .from('support_responses')
            .insert({
                ticket_id: ticketId,
                user_id: user.id,
                message
            })
            .select()
            .single();

        if (error) {
            console.error('Add response error:', error);
            return res.status(500).json({ error: 'Failed to add response' });
        }

        res.status(201).json({
            message: 'Response added successfully',
            response
        });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateTicketStatus(req, res, user, ticketId) {
    try {
        const { status } = req.body;

        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update status' });
        }

        res.json({
            message: 'Ticket status updated',
            ticket
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
