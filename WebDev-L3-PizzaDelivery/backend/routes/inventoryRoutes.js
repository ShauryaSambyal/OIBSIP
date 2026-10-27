import express from 'express'
import Inventory from '../models/Inventory.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { checkLowStockAndNotify } from '../utils/cronJobs.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const items = await Inventory.find(filter).sort({ category: 1, name: 1 })
    return res.status(200).json(items)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { stock, delta } = req.body
    const item = await Inventory.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    if (stock !== undefined) {
      item.stock = Math.max(0, Number(stock))
    } else if (delta !== undefined) {
      item.stock = Math.max(0, item.stock + Number(delta))
    }

    await item.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('inventory_updated', item)
    }

    if (item.stock <= item.threshold) {
      checkLowStockAndNotify()
    }

    return res.status(200).json({ message: 'Stock updated successfully', item })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/:id/threshold', protect, adminOnly, async (req, res) => {
  try {
    const { threshold } = req.body
    const item = await Inventory.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    if (threshold !== undefined) {
      item.threshold = Math.max(1, Number(threshold))
    }

    await item.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('inventory_updated', item)
    }

    return res.status(200).json({ message: 'Threshold updated successfully', item })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, stock, threshold, description } = req.body
    const item = await Inventory.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    if (name !== undefined) item.name = name
    if (price !== undefined) item.price = Number(price)
    if (stock !== undefined) item.stock = Math.max(0, Number(stock))
    if (threshold !== undefined) item.threshold = Math.max(1, Number(threshold))
    if (description !== undefined) item.description = description

    await item.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('inventory_updated', item)
    }

    return res.status(200).json({ message: 'Item updated successfully', item })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/check-alerts', protect, adminOnly, async (req, res) => {
  try {
    await checkLowStockAndNotify()
    return res.status(200).json({ message: 'Manual low-stock audit executed' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
