import express from 'express'
import Pizza from '../models/Pizza.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { category, bestseller } = req.query
    const query = {}

    if (category && category !== 'all') {
      query.category = category
    }

    if (bestseller === 'true') {
      query.isBestseller = true
    }

    const pizzas = await Pizza.find(query).sort({ isBestseller: -1, createdAt: -1 })
    return res.status(200).json(pizzas)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id)
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' })
    }
    return res.status(200).json(pizza)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
