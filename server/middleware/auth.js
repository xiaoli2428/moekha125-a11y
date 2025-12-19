import { verifyToken } from '../config/jwt.js'
import supabase from '../config/database.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, status')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended or banned' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'master')) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export const requireMaster = (req, res, next) => {
  if (!req.user || req.user.role !== 'master') {
    return res.status(403).json({ error: 'Master admin access required' })
  }
  next()
}

export default { authenticate, requireAdmin, requireMaster }
