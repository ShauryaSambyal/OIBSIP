import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretpizzatokenkey1234567890')
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' })
      }
      return next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' })
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' })
}
