import supabase from '../config/database.js'

export const deposit = async (req, res) => {
  try {
    const { amount } = req.body
    const userId = req.user.id

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' })
    }

    // Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const balanceBefore = parseFloat(user.balance)
    const balanceAfter = balanceBefore + parseFloat(amount)

    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: balanceAfter })
      .eq('id', userId)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update balance' })
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: parseFloat(amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Deposit to account',
        status: 'completed'
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction record error:', txError)
    }

    res.json({
      message: 'Deposit successful',
      balance: balanceAfter,
      transaction
    })
  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body
    const userId = req.user.id

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' })
    }

    // Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const balanceBefore = parseFloat(user.balance)

    if (balanceBefore < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    const balanceAfter = balanceBefore - parseFloat(amount)

    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: balanceAfter })
      .eq('id', userId)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update balance' })
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'withdraw',
        amount: parseFloat(amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Withdrawal from account',
        status: 'completed'
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction record error:', txError)
    }

    res.json({
      message: 'Withdrawal successful',
      balance: balanceAfter,
      transaction
    })
  } catch (error) {
    console.error('Withdraw error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const transfer = async (req, res) => {
  try {
    const { toUsername, amount } = req.body
    const fromUserId = req.user.id

    if (!toUsername || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer parameters' })
    }

    // Get recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, username, balance')
      .eq('username', toUsername)
      .single()

    if (recipientError || !recipient) {
      return res.status(404).json({ error: 'Recipient not found' })
    }

    if (recipient.id === fromUserId) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' })
    }

    // Get sender balance
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', fromUserId)
      .single()

    if (senderError || !sender) {
      return res.status(404).json({ error: 'Sender not found' })
    }

    const senderBalanceBefore = parseFloat(sender.balance)

    if (senderBalanceBefore < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    const senderBalanceAfter = senderBalanceBefore - parseFloat(amount)
    const recipientBalanceBefore = parseFloat(recipient.balance)
    const recipientBalanceAfter = recipientBalanceBefore + parseFloat(amount)

    // Update sender balance
    const { error: senderUpdateError } = await supabase
      .from('users')
      .update({ balance: senderBalanceAfter })
      .eq('id', fromUserId)

    if (senderUpdateError) {
      return res.status(500).json({ error: 'Failed to update sender balance' })
    }

    // Update recipient balance
    const { error: recipientUpdateError } = await supabase
      .from('users')
      .update({ balance: recipientBalanceAfter })
      .eq('id', recipient.id)

    if (recipientUpdateError) {
      // Rollback sender balance
      await supabase.from('users').update({ balance: senderBalanceBefore }).eq('id', fromUserId)
      return res.status(500).json({ error: 'Failed to update recipient balance' })
    }

    // Create transaction records
    await supabase.from('transactions').insert([
      {
        user_id: fromUserId,
        type: 'transfer_out',
        amount: parseFloat(amount),
        balance_before: senderBalanceBefore,
        balance_after: senderBalanceAfter,
        reference_id: recipient.id,
        description: `Transfer to ${toUsername}`,
        status: 'completed'
      },
      {
        user_id: recipient.id,
        type: 'transfer_in',
        amount: parseFloat(amount),
        balance_before: recipientBalanceBefore,
        balance_after: recipientBalanceAfter,
        reference_id: fromUserId,
        description: `Transfer from ${req.user.username}`,
        status: 'completed'
      }
    ])

    res.json({
      message: 'Transfer successful',
      balance: senderBalanceAfter,
      recipient: {
        username: recipient.username,
        amount: parseFloat(amount)
      }
    })
  } catch (error) {
    console.error('Transfer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 50, offset = 0 } = req.query

    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch transactions' })
    }

    res.json({
      transactions,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default { deposit, withdraw, transfer, getTransactions }
