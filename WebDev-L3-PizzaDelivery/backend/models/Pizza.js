import mongoose from 'mongoose'

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    imageUrl: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['veg', 'non-veg'],
      default: 'veg'
    },
    isBestseller: {
      type: Boolean,
      default: false
    },
    base: {
      type: String,
      default: 'Classic Hand-Tossed'
    },
    sauce: {
      type: String,
      default: 'Classic Marinara'
    },
    cheese: {
      type: String,
      default: 'Mozzarella'
    },
    vegetables: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
)

const Pizza = mongoose.model('Pizza', pizzaSchema)
export default Pizza
