import supabase from '../config/database.js'

// Trading Levels Management
export const getTradingLevels = async (req, res) => {
  try {
    const { data: levels, error } = await supabase
      .from('trading_levels')
      .select('*')
      .order('min_amount', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trading levels' })
    }

    res.json(levels)
  } catch (error) {
    console.error('Get trading levels error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// AI Arbitrage Levels Management
export const getArbitrageLevels = async (req, res) => {
  try {
    const { data: levels, error } = await supabase
      .from('ai_arbitrage_levels')
      .select('*')
      .order('min_amount', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch AI arbitrage levels' })
    }

    res.json(levels)
  } catch (error) {
    console.error('Get AI arbitrage levels error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createArbitrageLevel = async (req, res) => {
  try {
    const { name, min_amount, max_amount, duration_seconds, profit_percentage, loss_percentage, is_active } = req.body

    if (!name || !min_amount || !max_amount || !duration_seconds || profit_percentage === undefined || loss_percentage === undefined) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const { data: level, error } = await supabase
      .from('ai_arbitrage_levels')
      .insert({
        name,
        min_amount: parseFloat(min_amount),
        max_amount: parseFloat(max_amount),
        duration_seconds: parseInt(duration_seconds),
        profit_percentage: parseFloat(profit_percentage),
        loss_percentage: parseFloat(loss_percentage),
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create AI arbitrage level' })
    }

    res.json({ message: 'AI arbitrage level created', level })
  } catch (error) {
    console.error('Create AI arbitrage level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateArbitrageLevel = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data: level, error } = await supabase
      .from('ai_arbitrage_levels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update AI arbitrage level' })
    }

    res.json({ message: 'AI arbitrage level updated', level })
  } catch (error) {
    console.error('Update AI arbitrage level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteArbitrageLevel = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('ai_arbitrage_levels')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Failed to delete AI arbitrage level' })
    }

    res.json({ message: 'AI arbitrage level deleted' })
  } catch (error) {
    console.error('Delete AI arbitrage level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getArbitrageTrades = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query

    const { data: trades, error } = await supabase
      .from('ai_arbitrage_trades')
      .select(`
        *,
        ai_arbitrage_levels(name),
        ai_arbitrage_settings(name)
      `)
      .order('executed_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch AI arbitrage trades' })
    }

    res.json(trades)
  } catch (error) {
    console.error('Get AI arbitrage trades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const settleArbitrageTrade = async (req, res) => {
  try {
    const { id } = req.params
    const { result } = req.body

    if (!['profit', 'loss'].includes(result)) {
      return res.status(400).json({ error: 'Result must be profit or loss' })
    }

    const { data: trade, error: tradeError } = await supabase
      .from('ai_arbitrage_trades')
      .select('*')
      .eq('id', id)
      .single()

    if (tradeError || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    const profitLoss = result === 'profit' 
      ? parseFloat(trade.profit)
      : -parseFloat(trade.profit)

    const { error: updateError } = await supabase
      .from('ai_arbitrage_trades')
      .update({
        result,
        profit: profitLoss,
        admin_controlled: true
      })
      .eq('id', id)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update trade' })
    }

    res.json({ message: `AI arbitrage trade settled as ${result}`, profitLoss })
  } catch (error) {
    console.error('Settle AI arbitrage trade error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createTradingLevel = async (req, res) => {
  try {
    const { name, min_amount, max_amount, payout_percentage, is_active } = req.body

    if (!name || !min_amount || !max_amount || !payout_percentage) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const { data: level, error } = await supabase
      .from('trading_levels')
      .insert({
        name,
        min_amount: parseFloat(min_amount),
        max_amount: parseFloat(max_amount),
        payout_percentage: parseFloat(payout_percentage),
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create trading level' })
    }

    res.json({ message: 'Trading level created', level })
  } catch (error) {
    console.error('Create trading level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTradingLevel = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data: level, error } = await supabase
      .from('trading_levels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update trading level' })
    }

    res.json({ message: 'Trading level updated', level })
  } catch (error) {
    console.error('Update trading level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteTradingLevel = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('trading_levels')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Failed to delete trading level' })
    }

    res.json({ message: 'Trading level deleted' })
  } catch (error) {
    console.error('Delete trading level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Trade Management
export const getAllTrades = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query

    const { data: trades, error } = await supabase
      .from('binary_trades')
      .select(`
        *,
        users!inner(email, username)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trades' })
    }

    const formattedTrades = trades.map(trade => ({
      ...trade,
      user_email: trade.users.email,
      user_username: trade.users.username
    }))

    res.json(formattedTrades)
  } catch (error) {
    console.error('Get all trades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const settleTrade = async (req, res) => {
  try {
    const { id } = req.params
    const { result } = req.body

    if (!['win', 'loss'].includes(result)) {
      return res.status(400).json({ error: 'Result must be win or loss' })
    }

    // Get trade details
    const { data: trade, error: tradeError } = await supabase
      .from('binary_trades')
      .select('*')
      .eq('id', id)
      .single()

    if (tradeError || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    if (trade.result !== 'pending') {
      return res.status(400).json({ error: 'Trade already settled' })
    }

    // Calculate profit/loss
    const profitLoss = result === 'win' 
      ? parseFloat(trade.amount) * (parseFloat(trade.payout_percentage) / 100)
      : -parseFloat(trade.amount)

    // Update trade
    const { error: updateError } = await supabase
      .from('binary_trades')
      .update({
        result,
        profit_loss: profitLoss,
        exit_price: trade.entry_price * (result === 'win' ? 1.01 : 0.99),
        settled_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update trade' })
    }

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', trade.user_id)
      .single()

    const balanceBefore = parseFloat(user.balance)
    const balanceAfter = balanceBefore + profitLoss

    // Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: balanceAfter })
      .eq('id', trade.user_id)

    if (balanceError) {
      return res.status(500).json({ error: 'Failed to update balance' })
    }

    // Log transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: trade.user_id,
        type: result === 'win' ? 'trade_win' : 'trade_loss',
        amount: profitLoss,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_id: id,
        description: `Binary trade ${result} on ${trade.pair}`
      })

    res.json({ message: `Trade settled as ${result}`, profitLoss })
  } catch (error) {
    console.error('Settle trade error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = 'all' } = req.query

    let query = supabase
      .from('users')
      .select('id, email, username, role, balance, credit_score, status, created_at', { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' })
    }

    res.json({
      users,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, balance, credit_score, status, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user statistics
    const { data: tradeStats } = await supabase
      .from('binary_trades')
      .select('result, amount')
      .eq('user_id', id)

    const { data: transactionStats } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', id)

    const stats = {
      totalTrades: tradeStats?.length || 0,
      winningTrades: tradeStats?.filter(t => t.result === 'win').length || 0,
      totalTransactions: transactionStats?.length || 0
    }

    res.json({ user, stats })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUserBalance = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, action } = req.body // action: 'add' or 'subtract'

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    if (!['add', 'subtract'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "add" or "subtract"' })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', id)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const balanceBefore = parseFloat(user.balance)
    const balanceAfter = action === 'add' 
      ? balanceBefore + parseFloat(amount)
      : balanceBefore - parseFloat(amount)

    if (balanceAfter < 0) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: balanceAfter })
      .eq('id', id)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update balance' })
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: id,
      type: action === 'add' ? 'deposit' : 'withdraw',
      amount: parseFloat(amount),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Admin ${action} balance`,
      status: 'completed'
    })

    res.json({
      message: 'Balance updated successfully',
      balance: balanceAfter
    })
  } catch (error) {
    console.error('Update user balance error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUserCreditScore = async (req, res) => {
  try {
    const { id } = req.params
    const { credit_score } = req.body

    if (credit_score < 10 || credit_score > 100) {
      return res.status(400).json({ error: 'Credit score must be between 10 and 100' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ credit_score: parseInt(credit_score) })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update credit score' })
    }

    res.json({ message: 'Credit score updated', user })
  } catch (error) {
    console.error('Update credit score error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select('id, email, username, status')
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'User status updated',
      user
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get active users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total trades
    const { count: totalTrades } = await supabase
      .from('binary_trades')
      .select('*', { count: 'exact', head: true })

    // Get pending trades
    const { count: pendingTrades } = await supabase
      .from('binary_trades')
      .select('*', { count: 'exact', head: true })
      .eq('result', 'pending')

    // Get total transactions
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Get open support tickets
    const { count: openTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress'])

    // Get total platform balance
    const { data: balances } = await supabase
      .from('users')
      .select('balance')

    const totalBalance = balances?.reduce((sum, user) => sum + parseFloat(user.balance || 0), 0) || 0

    // Get recent activities
    const { data: recentActivities } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        created_at,
        user:users(username)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTrades: totalTrades || 0,
        pendingTrades: pendingTrades || 0,
        totalTransactions: totalTransactions || 0,
        openTickets: openTickets || 0,
        totalBalance: totalBalance.toFixed(2)
      },
      recentActivities: recentActivities || []
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllTickets = async (req, res) => {
  try {
    const { status = 'all', limit = 50, offset = 0 } = req.query

    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:users(username, email)
      `, { count: 'exact' })

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
    console.error('Get all tickets error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Export KYC functions
export { getAllKYCSubmissions, reviewKYC } from './kycController.js'

export default {
  getAllUsers,
  getUserById,
  updateUserBalance,
  updateUserCreditScore,
  updateUserStatus,
  getDashboardStats,
  getAllTickets
}
