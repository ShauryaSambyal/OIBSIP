import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js'

const router = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretpizzatokenkey1234567890', {
    expiresIn: '7d'
  })
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    })

    await user.save()
    await sendVerificationEmail(user.email, verificationToken, user.name)

    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      email: user.email,
      verificationToken
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' })
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    const jwtToken = generateToken(user._id)

    return res.status(200).json({
      message: 'Email verified successfully! You may now access all features.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: 'Account not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken = verificationToken
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    await sendVerificationEmail(user.email, verificationToken, user.name)

    return res.status(200).json({
      message: 'Verification link resent successfully to your inbox.',
      verificationToken
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please verify your email before logging in.',
        notVerified: true,
        email: user.email
      })
    }

    const token = generateToken(user._id)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not have administrator privileges.' })
    }

    const token = generateToken(user._id)

    return res.status(200).json({
      message: 'Admin authorization granted',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(200).json({ message: 'If that email exists in our records, a reset link has been dispatched.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    await sendPasswordResetEmail(user.email, resetToken, user.name)

    return res.status(200).json({
      message: 'If that email exists in our records, a reset link has been dispatched.',
      resetToken
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res.status(200).json({ message: 'Password has been successfully updated. You may now sign in.' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
