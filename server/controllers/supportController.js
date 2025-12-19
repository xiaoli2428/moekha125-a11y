import supabase from '../config/database.js'

export const createTicket = async (req, res) => {
  try {
    const { subject, message, category = 'general' } = req.body
    const userId = req.user.id

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' })
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        message,
        category,
        status: 'open',
        priority: 'normal'
      })
      .select()
      .single()

    if (error) {
      console.error('Create ticket error:', error)
      return res.status(500).json({ error: 'Failed to create ticket' })
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    })
  } catch (error) {
    console.error('Create ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTickets = async (req, res) => {
  try {
    const userId = req.user.id
    const { status = 'all', limit = 50, offset = 0 } = req.query

    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tickets, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch tickets' })
    }

    res.json({
      tickets,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get tickets error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const isAdmin = req.user.role === 'admin'

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)

    if (!isAdmin) {
      query = query.eq('user_id', userId)
    }

    const { data: ticket, error: ticketError } = await query.single()

    if (ticketError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select(`
        *,
        user:users(username, role)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    if (responsesError) {
      console.error('Failed to fetch responses:', responsesError)
    }

    res.json({
      ticket,
      responses: responses || []
    })
  } catch (error) {
    console.error('Get ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const addResponse = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body
    const userId = req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Check if ticket exists and user has access
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)

    if (!isAdmin) {
      query = query.eq('user_id', userId)
    }

    const { data: ticket, error: ticketError } = await query.single()

    if (ticketError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Add response
    const { data: response, error: responseError } = await supabase
      .from('ticket_responses')
      .insert({
        ticket_id: id,
        user_id: userId,
        message,
        is_staff: isAdmin
      })
      .select()
      .single()

    if (responseError) {
      console.error('Add response error:', responseError)
      return res.status(500).json({ error: 'Failed to add response' })
    }

    // Update ticket status if admin responded
    if (isAdmin && ticket.status === 'open') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', id)
    }

    res.status(201).json({
      message: 'Response added successfully',
      response
    })
  } catch (error) {
    console.error('Add response error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    res.json({
      message: 'Ticket status updated',
      ticket
    })
  } catch (error) {
    console.error('Update ticket status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default { createTicket, getTickets, getTicketById, addResponse, updateTicketStatus }
