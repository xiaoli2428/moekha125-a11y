import supabase from '../config/database.js'

// Mock price data for simulation
const MOCK_PRICES = {
  'BTC/USDT': 43500,
  'ETH/USDT': 2300,
  'BNB/USDT': 320,
  'SOL/USDT': 98
}

const getPriceMovement = (pair) => {
  // Simulate random price movement between -2% to +2%
  const basePrice = MOCK_PRICES[pair] || 100
  const movement = (Math.random() - 0.5) * 0.04 // -2% to +2%
  return basePrice * (1 + movement)
}

export const placeTrade = async (req, res) => {
  try {
    const { pair, direction, amount, duration } = req.body
    const userId = req.user.id

    if (!pair || !direction || !amount || !duration) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ error: 'Direction must be "up" or "down"' })
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' })
    }

    if (duration < 60 || duration > 3600) {
      return res.status(400).json({ error: 'Duration must be between 60 and 3600 seconds' })
    }

    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (parseFloat(user.balance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Deduct amount from balance
    const newBalance = parseFloat(user.balance) - parseFloat(amount)
    await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)

    // Get entry price
    const entryPrice = getPriceMovement(pair)
    const expiresAt = new Date(Date.now() + duration * 1000)

    // Create trade
    const { data: trade, error: tradeError } = await supabase
      .from('binary_trades')
      .insert({
        user_id: userId,
        pair,
        direction,
        amount: parseFloat(amount),
        entry_price: entryPrice,
        duration,
        payout_percentage: 85.00,
        result: 'pending',
        expires_at: expiresAt
      })
      .select()
      .single()

    if (tradeError) {
      console.error('Trade creation error:', tradeError)
      return res.status(500).json({ error: 'Failed to create trade' })
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'trade_loss',
      amount: parseFloat(amount),
      balance_before: parseFloat(user.balance),
      balance_after: newBalance,
      reference_id: trade.id,
      description: `Binary trade placed: ${pair} ${direction}`,
      status: 'completed'
    })

    res.json({
      message: 'Trade placed successfully',
      trade: {
        id: trade.id,
        pair: trade.pair,
        direction: trade.direction,
        amount: trade.amount,
        entryPrice: trade.entry_price,
        expiresAt: trade.expires_at,
        result: trade.result
      }
    })
  } catch (error) {
    console.error('Place trade error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const settleTrade = async (tradeId) => {
  try {
    // Get trade details
    const { data: trade, error: tradeError } = await supabase
      .from('binary_trades')
      .select('*')
      .eq('id', tradeId)
      .single()

    if (tradeError || !trade) {
      console.error('Trade not found:', tradeId)
      return
    }

    if (trade.result !== 'pending') {
      return // Already settled
    }

    // Get exit price
    const exitPrice = getPriceMovement(trade.pair)

    // Determine win/loss
    let result
    if (trade.direction === 'up') {
      result = exitPrice > trade.entry_price ? 'win' : 'loss'
    } else {
      result = exitPrice < trade.entry_price ? 'win' : 'loss'
    }

    const profitLoss = result === 'win' 
      ? parseFloat(trade.amount) * (1 + parseFloat(trade.payout_percentage) / 100)
      : 0

    // Update trade
    await supabase
      .from('binary_trades')
      .update({
        exit_price: exitPrice,
        result,
        profit_loss: profitLoss,
        settled_at: new Date()
      })
      .eq('id', tradeId)

    // If win, update user balance
    if (result === 'win') {
      const { data: user } = await supabase
        .from('users')
        .select('balance')
        .eq('id', trade.user_id)
        .single()

      if (user) {
        const newBalance = parseFloat(user.balance) + profitLoss

        await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('id', trade.user_id)

        // Create transaction record
        await supabase.from('transactions').insert({
          user_id: trade.user_id,
          type: 'trade_win',
          amount: profitLoss,
          balance_before: parseFloat(user.balance),
          balance_after: newBalance,
          reference_id: tradeId,
          description: `Binary trade win: ${trade.pair}`,
          status: 'completed'
        })
      }
    }

    console.log(`Trade ${tradeId} settled: ${result}`)
  } catch (error) {
    console.error('Settle trade error:', error)
  }
}

export const getTrades = async (req, res) => {
  try {
    const userId = req.user.id
    const { status = 'all', limit = 50, offset = 0 } = req.query

    let query = supabase
      .from('binary_trades')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (status !== 'all') {
      query = query.eq('result', status)
    }

    const { data: trades, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trades' })
    }

    res.json({
      trades,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get trades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTradeById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: trade, error } = await supabase
      .from('binary_trades')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    res.json({ trade })
  } catch (error) {
    console.error('Get trade error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Background job to settle expired trades
export const settleExpiredTrades = async () => {
  try {
    const { data: expiredTrades, error } = await supabase
      .from('binary_trades')
      .select('id')
      .eq('result', 'pending')
      .lte('expires_at', new Date().toISOString())

    if (error) {
      console.error('Failed to fetch expired trades:', error)
      return
    }

    for (const trade of expiredTrades || []) {
      await settleTrade(trade.id)
    }
  } catch (error) {
    console.error('Settle expired trades error:', error)
  }
}

export default { placeTrade, getTrades, getTradeById, settleTrade, settleExpiredTrades }
