import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 50
    },
    threshold: {
      type: Number,
      required: true,
      min: 1,
      default: 20
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    imageUrl: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: 'units'
    }
  },
  {
    timestamps: true
  }
)

const Inventory = mongoose.model('Inventory', inventorySchema)
export default Inventory
