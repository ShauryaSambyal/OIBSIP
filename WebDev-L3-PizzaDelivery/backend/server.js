import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pizzaRoutes from './routes/pizzaRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { initInventoryCron } from './utils/cronJobs.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173'

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
})

app.set('io', io)

app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
)
app.use(express.json())

connectDB()

initInventoryCron()

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`)

  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`)
    console.log(`Socket ${socket.id} joined order_${orderId}`)
  })

  socket.on('leave_order_room', (orderId) => {
    socket.leave(`order_${orderId}`)
  })

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`)
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/pizzas', pizzaRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/orders', orderRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'pizza-delivery-api' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Pizza Delivery server running on port ${PORT}`)
})
