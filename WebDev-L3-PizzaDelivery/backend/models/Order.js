import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderType: {
      type: String,
      enum: ['custom', 'pre-made'],
      default: 'custom'
    },
    pizzaName: {
      type: String,
      default: 'Custom Pizza'
    },
    size: {
      type: String,
      enum: ['Regular', 'Medium', 'Large'],
      default: 'Medium'
    },
    base: {
      type: String,
      required: true
    },
    sauce: {
      type: String,
      required: true
    },
    cheese: {
      type: String,
      required: true
    },
    vegetables: [
      {
        type: String
      }
    ],
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paymentDetails: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String }
    },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received'
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
