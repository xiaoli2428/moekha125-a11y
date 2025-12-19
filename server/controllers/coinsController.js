import supabase from '../config/database.js'

// Get all supported coins
export const getSupportedCoins = async (req, res) => {
  try {
    const { data: coins, error } = await supabase
      .from('supported_coins')
      .select('*')
      .eq('is_active', true)
      .order('symbol')

    if (error) {
      console.error('Get coins error:', error)
      return res.status(500).json({ error: 'Failed to fetch coins' })
    }

    res.json({ coins: coins || [] })
  } catch (error) {
    console.error('Get coins error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get deposit addresses for user
export const getDepositAddresses = async (req, res) => {
  try {
    const userId = req.user.id

    const { data: addresses, error } = await supabase
      .from('user_deposit_addresses')
      .select(`
        *,
        coin:supported_coins(symbol, name, icon_url)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Get addresses error:', error)
      return res.status(500).json({ error: 'Failed to fetch addresses' })
    }

    res.json({ addresses: addresses || [] })
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Get all supported coins (including inactive)
export const getAllCoins = async (req, res) => {
  try {
    const { data: coins, error } = await supabase
      .from('supported_coins')
      .select('*')
      .order('symbol')

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch coins' })
    }

    res.json({ coins: coins || [] })
  } catch (error) {
    console.error('Get all coins error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Create a new coin
export const createCoin = async (req, res) => {
  try {
    const { symbol, name, networks, icon_url, min_deposit, min_withdrawal } = req.body

    if (!symbol || !name) {
      return res.status(400).json({ error: 'Symbol and name are required' })
    }

    const { data: coin, error } = await supabase
      .from('supported_coins')
      .insert({
        symbol: symbol.toUpperCase(),
        name,
        networks: networks || [],
        icon_url,
        min_deposit: min_deposit || 0,
        min_withdrawal: min_withdrawal || 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Create coin error:', error)
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Coin already exists' })
      }
      return res.status(500).json({ error: 'Failed to create coin' })
    }

    res.status(201).json({ message: 'Coin created', coin })
  } catch (error) {
    console.error('Create coin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Update a coin
export const updateCoin = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data: coin, error } = await supabase
      .from('supported_coins')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update coin' })
    }

    res.json({ message: 'Coin updated', coin })
  } catch (error) {
    console.error('Update coin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Delete a coin
export const deleteCoin = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('supported_coins')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Failed to delete coin' })
    }

    res.json({ message: 'Coin deleted' })
  } catch (error) {
    console.error('Delete coin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Get deposit addresses for a user
export const getUserDepositAddresses = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: addresses, error } = await supabase
      .from('user_deposit_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('coin_symbol')

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch addresses' })
    }

    res.json({ addresses: addresses || [] })
  } catch (error) {
    console.error('Get user addresses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Set deposit address for a user
export const setUserDepositAddress = async (req, res) => {
  try {
    const { userId } = req.params
    const { coin_symbol, network, address } = req.body

    if (!coin_symbol || !network || !address) {
      return res.status(400).json({ error: 'Coin, network, and address are required' })
    }

    // Upsert the address
    const { data: depositAddress, error } = await supabase
      .from('user_deposit_addresses')
      .upsert({
        user_id: userId,
        coin_symbol: coin_symbol.toUpperCase(),
        network,
        address,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,coin_symbol,network'
      })
      .select()
      .single()

    if (error) {
      console.error('Set address error:', error)
      return res.status(500).json({ error: 'Failed to set address' })
    }

    res.json({ message: 'Address set successfully', address: depositAddress })
  } catch (error) {
    console.error('Set address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Delete deposit address
export const deleteUserDepositAddress = async (req, res) => {
  try {
    const { addressId } = req.params

    const { error } = await supabase
      .from('user_deposit_addresses')
      .delete()
      .eq('id', addressId)

    if (error) {
      return res.status(500).json({ error: 'Failed to delete address' })
    }

    res.json({ message: 'Address deleted' })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  getSupportedCoins,
  getDepositAddresses,
  getAllCoins,
  createCoin,
  updateCoin,
  deleteCoin,
  getUserDepositAddresses,
  setUserDepositAddress,
  deleteUserDepositAddress
}
