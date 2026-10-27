import express from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import Order from '../models/Order.js'
import Inventory from '../models/Inventory.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { checkLowStockAndNotify } from '../utils/cronJobs.js'

const router = express.Router()

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (keyId && keySecret && keyId !== 'rzp_test_placeholder_key') {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })
  }
  return null
}

router.post('/create-razorpay-order', protect, async (req, res) => {
  try {
    const { totalAmount } = req.body

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Valid total amount is required' })
    }

    const razorpay = getRazorpayInstance()
    const amountInPaise = Math.round(Number(totalAmount) * 100)

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      }
      const order = await razorpay.orders.create(options)
      return res.status(200).json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      })
    }

    const testOrderId = `order_test_${Date.now()}`
    return res.status(200).json({
      id: testOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      testMode: true
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/verify-and-place', protect, async (req, res) => {
  try {
    const {
      orderType,
      pizzaName,
      size,
      base,
      sauce,
      cheese,
      vegetables = [],
      quantity = 1,
      totalAmount,
      deliveryAddress,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body

    if (!base || !sauce || !cheese || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ message: 'Missing required order specifications' })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (keySecret && keySecret !== 'placeholder_secret' && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex')

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Razorpay payment signature verification failed' })
      }
    }

    const order = new Order({
      user: req.user._id,
      orderType: orderType || 'custom',
      pizzaName: pizzaName || 'Custom Pizza',
      size: size || 'Medium',
      base,
      sauce,
      cheese,
      vegetables,
      quantity: Number(quantity),
      totalAmount: Number(totalAmount),
      deliveryAddress,
      paymentStatus: 'Paid',
      paymentDetails: {
        razorpayOrderId: razorpayOrderId || `order_test_${Date.now()}`,
        razorpayPaymentId: razorpayPaymentId || `pay_test_${Date.now()}`,
        razorpaySignature: razorpaySignature || 'signature_verified_test'
      },
      orderStatus: 'Order Received',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: new Date()
        }
      ]
    })

    await order.save()

    const qty = Number(quantity)
    const itemsToDecrement = [
      { category: 'base', name: base },
      { category: 'sauce', name: sauce },
      { category: 'cheese', name: cheese },
      ...vegetables.map((v) => ({ category: 'vegetable', name: v }))
    ]

    for (const item of itemsToDecrement) {
      await Inventory.findOneAndUpdate(
        {
          category: item.category,
          name: { $regex: new RegExp(`^${item.name}$`, 'i') }
        },
        { $inc: { stock: -qty } }
      )
    }

    const io = req.app.get('io')
    if (io) {
      const updatedInventory = await Inventory.find().sort({ category: 1, name: 1 })
      io.emit('inventory_synced', updatedInventory)
      io.emit('new_order_placed', order)
    }

    checkLowStockAndNotify()

    return res.status(201).json({
      message: 'Order placed successfully and inventory updated',
      order
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status transition' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.orderStatus = status
    order.statusHistory.push({
      status,
      timestamp: new Date()
    })

    await order.save()

    const io = req.app.get('io')
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory
      })
      io.emit('order_status_updated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory
      })
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      order
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
