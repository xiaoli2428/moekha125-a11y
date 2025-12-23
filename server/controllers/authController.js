import bcrypt from 'bcrypt'
import { ethers } from 'ethers'
import supabase from '../config/database.js'
import { generateToken } from '../config/jwt.js'

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ error: 'Email or username already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        username,
        role: 'user',
        balance: 0,
        status: 'active',
        credit_score: 100
      })
      .select('id, email, username, role, balance, credit_score, created_at')
      .single()

    if (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Failed to create user' })
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        creditScore: user.credit_score
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, password_hash, role, balance, status, credit_score')
      .eq('email', email)
      .maybeSingle()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended or banned' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        creditScore: user.credit_score
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, balance, credit_score, status, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        creditScore: user.credit_score,
        status: user.status,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Wallet Login - Authenticate with crypto wallet signature
export const walletLogin = async (req, res) => {
  try {
    const { address, message, signature } = req.body

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Address, message, and signature are required' })
    }

    // Verify the signature matches the address
    let recoveredAddress
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature)
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    // Check if recovered address matches the claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' })
    }

    // Check if user with this wallet address exists
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, balance, status, credit_score, wallet_address')
      .eq('wallet_address', address.toLowerCase())
      .maybeSingle()

    // If user doesn't exist, create a new one
    if (!user) {
      const walletShort = address.slice(0, 8).toLowerCase()
      const timestamp = Date.now()
      const username = `wallet_${walletShort}_${timestamp.toString().slice(-6)}`
      const email = `${walletShort}_${timestamp}@wallet.onchainweb`

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          username,
          wallet_address: address.toLowerCase(),
          password_hash: 'wallet_auth', // Placeholder for wallet users
          role: 'user',
          balance: 0,
          status: 'active',
          credit_score: 100
        })
        .select('id, email, username, role, balance, status, credit_score, wallet_address')
        .single()

      if (createError) {
        console.error('Wallet user creation error:', createError)
        // Check if error is due to duplicate - if so, try to fetch the user again
        if (createError.code === '23505' || createError.message.includes('duplicate')) {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, email, username, role, balance, status, credit_score, wallet_address')
            .eq('wallet_address', address.toLowerCase())
            .maybeSingle()

          if (existingUser) {
            user = existingUser
          } else {
            return res.status(500).json({ error: 'Failed to create wallet user: ' + (createError.message || 'Unknown error') })
          }
        } else {
          return res.status(500).json({ error: 'Failed to create wallet user: ' + (createError.message || 'Unknown error') })
        }
      } else {
        user = newUser
      }
    }

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended or banned' })
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role })

    res.json({
      message: 'Wallet login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        creditScore: user.credit_score,
        walletAddress: user.wallet_address
      }
    })
  } catch (error) {
    console.error('Wallet login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default { register, login, getProfile, walletLogin }
