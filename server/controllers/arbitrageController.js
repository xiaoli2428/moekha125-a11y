import supabase from '../config/database.js'

const MOCK_PRICES = {
  'ETH/USDT': 2300,
  'BTC/USDT': 43500,
  'BNB/USDT': 320
}

export const createArbitrageSetting = async (req, res) => {
  try {
    const { name, minProfitPercentage, maxTradeAmount, tradingPairs, intervalSeconds } = req.body
    const adminId = req.user.id

    const { data: setting, error } = await supabase
      .from('ai_arbitrage_settings')
      .insert({
        name,
        is_active: false,
        min_profit_percentage: minProfitPercentage || 0.50,
        max_trade_amount: maxTradeAmount || 1000,
        trading_pairs: tradingPairs || ['ETH/USDT', 'BTC/USDT'],
        interval_seconds: intervalSeconds || 60,
        created_by: adminId
      })
      .select()
      .single()

    if (error) {
      console.error('Create arbitrage setting error:', error)
      return res.status(500).json({ error: 'Failed to create arbitrage setting' })
    }

    res.status(201).json({
      message: 'Arbitrage setting created',
      setting
    })
  } catch (error) {
    console.error('Create arbitrage setting error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getArbitrageSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('ai_arbitrage_settings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch arbitrage settings' })
    }

    res.json({ settings })
  } catch (error) {
    console.error('Get arbitrage settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const toggleArbitrage = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const { data: setting, error } = await supabase
      .from('ai_arbitrage_settings')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error || !setting) {
      return res.status(404).json({ error: 'Arbitrage setting not found' })
    }

    res.json({
      message: `Arbitrage ${isActive ? 'activated' : 'deactivated'}`,
      setting
    })
  } catch (error) {
    console.error('Toggle arbitrage error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getArbitrageTrades = async (req, res) => {
  try {
    const { settingId } = req.query
    const { limit = 100, offset = 0 } = req.query

    let query = supabase
      .from('ai_arbitrage_trades')
      .select('*', { count: 'exact' })

    if (settingId) {
      query = query.eq('setting_id', settingId)
    }

    const { data: trades, error, count } = await query
      .order('executed_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch arbitrage trades' })
    }

    res.json({
      trades,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get arbitrage trades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Simulate arbitrage execution (runs in background)
export const executeArbitrage = async (settingId) => {
  try {
    const { data: setting, error } = await supabase
      .from('ai_arbitrage_settings')
      .select('*')
      .eq('id', settingId)
      .eq('is_active', true)
      .single()

    if (error || !setting) {
      return
    }

    // Simulate finding arbitrage opportunity
    const shouldExecute = Math.random() > 0.7 // 30% chance

    if (shouldExecute) {
      const pair = setting.trading_pairs[Math.floor(Math.random() * setting.trading_pairs.length)]
      const basePrice = MOCK_PRICES[pair] || 100
      
      const buyPrice = basePrice * (1 - Math.random() * 0.02) // -2% to 0%
      const sellPrice = basePrice * (1 + Math.random() * 0.02) // 0% to +2%
      const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100

      if (profitPercentage >= parseFloat(setting.min_profit_percentage)) {
        const amount = Math.min(
          parseFloat(setting.max_trade_amount),
          Math.random() * parseFloat(setting.max_trade_amount)
        )
        const profit = amount * (profitPercentage / 100)

        // Record trade
        await supabase.from('ai_arbitrage_trades').insert({
          setting_id: settingId,
          pair,
          buy_price: buyPrice,
          sell_price: sellPrice,
          amount,
          profit,
          profit_percentage: profitPercentage
        })

        console.log(`Arbitrage executed: ${pair} - Profit: ${profit.toFixed(2)}`)
      }
    }
  } catch (error) {
    console.error('Execute arbitrage error:', error)
  }
}

export default { 
  createArbitrageSetting, 
  getArbitrageSettings, 
  toggleArbitrage, 
  getArbitrageTrades,
  executeArbitrage 
}
