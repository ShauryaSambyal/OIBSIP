import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import {
  Clock,
  ChefHat,
  Bike,
  CheckCircle,
  Package,
  Calendar,
  AlertCircle,
  ChevronRight,
  PlusCircle
} from 'lucide-react'

export const UserDashboardPage = () => {
  const { user } = useAuth()
  const socket = useSocket()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const justPlaced = location.state?.justPlaced || false

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders')
        setOrders(res.data)
      } catch (err) {
        setError('Failed to fetch your orders history.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleStatusUpdate = (update) => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord._id === update.orderId) {
            return {
              ...ord,
              orderStatus: update.orderStatus,
              statusHistory: update.statusHistory || ord.statusHistory
            }
          }
          return ord
        })
      )
    }

    const handleNewOrder = (newOrder) => {
      if (newOrder.user === user?.id || newOrder.user?._id === user?.id) {
        setOrders((prev) => [newOrder, ...prev])
      }
    }

    socket.on('order_status_updated', handleStatusUpdate)
    socket.on('new_order_placed', handleNewOrder)

    return () => {
      socket.off('order_status_updated', handleStatusUpdate)
      socket.off('new_order_placed', handleNewOrder)
    }
  }, [socket, user])

  const stages = [
    { key: 'Order Received', label: 'Order Received', icon: Clock },
    { key: 'In Kitchen', label: 'In Kitchen', icon: ChefHat },
    { key: 'Sent to Delivery', label: 'Sent to Delivery', icon: Bike },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle }
  ]

  const getStageIndex = (status) => {
    if (status === 'Order Received') return 0
    if (status === 'In Kitchen') return 1
    if (status === 'Sent to Delivery') return 2
    if (status === 'Delivered') return 3
    return 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Live Order Tracking
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mt-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Track real-time status of your active pizzas and explore past deliveries
          </p>
        </div>

        <Link
          to="/builder"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Order</span>
        </Link>
      </div>

      {justPlaced && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Payment Verified & Order Placed!</span>
              <p className="text-xs text-emerald-700 mt-0.5">
                Our kitchen has received your pizza order. Real-time updates will stream below.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-stone-200 rounded-2xl p-6 h-48 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">No Orders Yet</h3>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            You haven't ordered any pizzas yet. Design your first custom pie now!
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition"
          >
            <span>Open Custom Builder</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStageIndex = getStageIndex(order.orderStatus)
            const isDelivered = order.orderStatus === 'Delivered'

            return (
              <div
                key={order._id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-extrabold text-lg text-stone-900">{order.pizzaName}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                        {order.size} &bull; Qty: {order.quantity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1.5 text-xs text-stone-500">
                      <span className="font-mono text-stone-600">ID: #{order._id.slice(-6).toUpperCase()}</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-xl font-extrabold text-stone-900">₹{order.totalAmount}</span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-1 ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="py-8">
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-stone-200 rounded-full z-0"></div>
                    <div
                      className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-orange-600 rounded-full transition-all duration-700 z-0"
                      style={{
                        width: `${(currentStageIndex / (stages.length - 1)) * 100}%`
                      }}
                    ></div>

                    <div className="relative z-10 flex justify-between">
                      {stages.map((st, idx) => {
                        const Icon = st.icon
                        const isCompleted = idx <= currentStageIndex
                        const isCurrent = idx === currentStageIndex

                        return (
                          <div key={st.key} className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-orange-600 text-white shadow-md'
                                  : 'bg-white border-2 border-stone-300 text-stone-400'
                              } ${isCurrent ? 'ring-4 ring-orange-500/20 scale-110' : ''}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-xs mt-2 font-semibold text-center hidden sm:block ${
                                isCompleted ? 'text-stone-900' : 'text-stone-400'
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between text-xs text-stone-600 gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                      <strong>Base:</strong> {order.base}
                    </span>
                    <span className="bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                      <strong>Sauce:</strong> {order.sauce}
                    </span>
                    <span className="bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                      <strong>Cheese:</strong> {order.cheese}
                    </span>
                    {order.vegetables && order.vegetables.length > 0 && (
                      <span className="bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                        <strong>Toppings:</strong> {order.vegetables.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="text-stone-500">
                    Deliver to: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
