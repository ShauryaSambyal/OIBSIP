import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import api from '../../services/api'
import {
  Boxes,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  BellRing,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Shield,
  Search,
  Check
} from 'lucide-react'

export const AdminDashboardPage = () => {
  const { user } = useAuth()
  const socket = useSocket()

  const [activeTab, setActiveTab] = useState('inventory')
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stockCategory, setStockCategory] = useState('all')
  const [inventorySearch, setInventorySearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [stockInput, setStockInput] = useState('')
  const [thresholdInput, setThresholdInput] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isAlertSending, setIsAlertSending] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/orders/admin/all')
      ])
      setInventory(invRes.data)
      setOrders(ordRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev])
      setStatusMessage(`🔔 New Order #${newOrder._id.slice(-6).toUpperCase()} received!`)
      setTimeout(() => setStatusMessage(''), 5000)
    }

    const handleInventorySync = (updatedItems) => {
      setInventory(updatedItems)
    }

    const handleSingleUpdate = (item) => {
      setInventory((prev) => prev.map((it) => (it._id === item._id ? item : it)))
    }

    socket.on('new_order_placed', handleNewOrder)
    socket.on('inventory_synced', handleInventorySync)
    socket.on('inventory_updated', handleSingleUpdate)

    return () => {
      socket.off('new_order_placed', handleNewOrder)
      socket.off('inventory_synced', handleInventorySync)
      socket.off('inventory_updated', handleSingleUpdate)
    }
  }, [socket])

  const handleUpdateStock = async (item, delta) => {
    try {
      const res = await api.put(`/inventory/${item._id}/stock`, { delta })
      setInventory((prev) => prev.map((it) => (it._id === item._id ? res.data.item : it)))
    } catch (err) {
      alert('Failed to update stock quantity')
    }
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setStockInput(item.stock)
    setThresholdInput(item.threshold)
  }

  const handleSaveItemEdit = async (e) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const res = await api.put(`/inventory/${editingItem._id}`, {
        stock: Number(stockInput),
        threshold: Number(thresholdInput)
      })
      setInventory((prev) => prev.map((it) => (it._id === editingItem._id ? res.data.item : it)))
      setEditingItem(null)
    } catch (err) {
      alert('Failed to save changes')
    }
  }

  const handleTriggerLowStockAlert = async () => {
    setIsAlertSending(true)
    try {
      const res = await api.post('/inventory/check-alerts')
      setStatusMessage('Alert check executed! Admin notification sent if items below threshold.')
      setTimeout(() => setStatusMessage(''), 6000)
    } catch (err) {
      alert('Failed to trigger audit alert')
    } finally {
      setIsAlertSending(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? res.data.order : ord))
      )
      setStatusMessage(`Order #${orderId.slice(-6).toUpperCase()} updated to "${newStatus}"`)
      setTimeout(() => setStatusMessage(''), 4000)
    } catch (err) {
      alert('Failed to update order status')
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesCat = stockCategory === 'all' || item.category === stockCategory
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  const lowStockCount = inventory.filter((item) => item.stock <= item.threshold).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </span>
            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Synced</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mt-2">
            Restaurant Management Panel
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time stock monitoring, automated cron alerts, and instant order dispatcher
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerLowStockAlert}
            disabled={isAlertSending}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <BellRing className="w-4 h-4 text-orange-600" />
            <span>{isAlertSending ? 'Auditing...' : 'Trigger Stock Audit Email'}</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm font-semibold flex items-center space-x-2 animate-in fade-in">
          <BellRing className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Inventory Items
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">{inventory.length}</div>
          <span className="text-xs text-stone-400 mt-0.5 block">
            4 Categories: Bases, Sauces, Cheeses, Veggies
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Low Stock Warnings (&le; Threshold)
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</div>
          <span className="text-xs text-stone-400 mt-0.5 block">
            Automated alerts scheduled via node-cron
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Orders Logged
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">{orders.length}</div>
          <span className="text-xs text-stone-400 mt-0.5 block">
            Connected to real-time dispatch webhooks
          </span>
        </div>
      </div>

      <div className="flex border-b border-stone-200 mb-8">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventory Management ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Order Management Panel ({orders.length})</span>
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'base', label: 'Pizza Bases (5)' },
                { id: 'sauce', label: 'Sauces (5)' },
                { id: 'cheese', label: 'Cheeses' },
                { id: 'vegetable', label: 'Vegetables' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setStockCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    stockCategory === cat.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ingredient</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Current Stock</th>
                    <th className="py-3.5 px-4 font-semibold">Safety Threshold</th>
                    <th className="py-3.5 px-4 font-semibold">Unit Price</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quick Adjust</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.stock <= item.threshold
                    const isZero = item.stock === 0

                    return (
                      <tr key={item._id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80'}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{item.name}</div>
                              <div className="text-[10px] text-stone-400 line-clamp-1 max-w-xs">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-medium text-stone-600">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isZero
                                  ? 'text-red-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-stone-900'
                              }`}
                            >
                              {item.stock} {item.unit}
                            </span>
                            {isZero && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                Out of Stock
                              </span>
                            )}
                            {!isZero && isLow && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Low</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600 font-semibold">
                          {item.threshold} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          ₹{item.price}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                            <button
                              onClick={() => handleUpdateStock(item, -5)}
                              className="p-1 hover:bg-white rounded text-stone-600 font-bold transition"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleUpdateStock(item, -1)}
                              className="p-1 hover:bg-white rounded text-stone-600 font-bold transition"
                              title="Decrease 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleUpdateStock(item, 1)}
                              className="p-1 hover:bg-white rounded text-stone-600 font-bold transition"
                              title="Increase 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleUpdateStock(item, 10)}
                              className="p-1 hover:bg-white rounded text-stone-600 font-bold transition"
                              title="Increase 10"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold transition"
                          >
                            Edit Item
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
              <p className="text-stone-500 text-sm">No orders have been received yet.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <h3 className="font-extrabold text-base text-stone-900">{order.pizzaName}</h3>
                    <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-2.5 py-0.5 rounded-full">
                      {order.size} &bull; Qty: {order.quantity}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex flex-wrap gap-2">
                    <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      <strong>Base:</strong> {order.base}
                    </span>
                    <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      <strong>Sauce:</strong> {order.sauce}
                    </span>
                    <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      <strong>Cheese:</strong> {order.cheese}
                    </span>
                    {order.vegetables && order.vegetables.length > 0 && (
                      <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                        <strong>Toppings:</strong> {order.vegetables.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>
                      Customer: <strong>{order.user?.name || 'Customer'}</strong> ({order.user?.email || 'N/A'})
                    </span>
                    <span>Phone: <strong>{order.deliveryAddress?.phone}</strong></span>
                    <span>
                      Address: {order.deliveryAddress?.street}, {order.deliveryAddress?.city} ({order.deliveryAddress?.postalCode})
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                  <div className="text-left lg:text-right">
                    <div className="text-xl font-black text-stone-900">₹{order.totalAmount}</div>
                    <div className="text-[11px] text-stone-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-semibold text-stone-600 uppercase">Status:</label>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm"
                    >
                      <option value="Order Received">Order Received</option>
                      <option value="In Kitchen">In Kitchen</option>
                      <option value="Sent to Delivery">Sent to Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Edit Inventory: {editingItem.name}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Category: <span className="capitalize font-semibold">{editingItem.category}</span>
            </p>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Current Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Safety Threshold Units (Alert Trigger)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
