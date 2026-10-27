import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  CreditCard,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  PackageCheck
} from 'lucide-react'

export const OrderSummaryPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const orderData = location.state || {
    orderType: 'custom',
    pizzaName: 'Classic Custom Pizza',
    size: 'Medium',
    base: 'Classic Hand-Tossed',
    sauce: 'Classic Marinara',
    cheese: 'Mozzarella',
    vegetables: ['Bell Peppers', 'Sweet Corn'],
    quantity: 1,
    totalAmount: 399
  }

  const [street, setStreet] = useState('42 Baker Lane, Suite 3B')
  const [city, setCity] = useState('New Delhi')
  const [postalCode, setPostalCode] = useState('110001')
  const [phone, setPhone] = useState('+91 9876543210')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [testSuccessModal, setTestSuccessModal] = useState(false)

  const itemsSubtotal = Number(orderData.totalAmount)
  const gstTax = Math.round(itemsSubtotal * 0.05)
  const deliveryFee = itemsSubtotal > 500 ? 0 : 40
  const grandTotal = itemsSubtotal + gstTax + deliveryFee

  const finalizeOrderPlacement = async (paymentDetails) => {
    try {
      const payload = {
        orderType: orderData.orderType || 'custom',
        pizzaName: orderData.pizzaName || 'Custom Pizza',
        size: orderData.size || 'Medium',
        base: orderData.base,
        sauce: orderData.sauce,
        cheese: orderData.cheese,
        vegetables: orderData.vegetables || [],
        quantity: orderData.quantity || 1,
        totalAmount: grandTotal,
        deliveryAddress: {
          street,
          city,
          postalCode,
          phone
        },
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature
      }

      const res = await api.post('/orders/verify-and-place', payload)
      navigate('/dashboard', {
        state: { newOrderId: res.data.order._id, justPlaced: true }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpayPayment = async () => {
    if (!street || !city || !postalCode || !phone) {
      setError('Please provide complete delivery address and phone number.')
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      const { data: orderRes } = await api.post('/orders/create-razorpay-order', {
        totalAmount: grandTotal
      })

      if (window.Razorpay && !orderRes.testMode) {
        const options = {
          key: orderRes.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'Crust & Craft Pizzeria',
          description: `Payment for ${orderData.pizzaName}`,
          order_id: orderRes.id,
          prefill: {
            name: user?.name || 'Pizza Lover',
            email: user?.email || 'customer@example.com',
            contact: phone
          },
          theme: {
            color: '#ea580c'
          },
          handler: function (response) {
            finalizeOrderPlacement({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false)
            }
          }
        }

        const razor = new window.Razorpay(options)
        razor.on('payment.failed', function (response) {
          setError(`Payment failed: ${response.error.description}`)
          setIsProcessing(false)
        })
        razor.open()
      } else {
        setTestSuccessModal(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Razorpay transaction.')
      setIsProcessing(false)
    }
  }

  const handleConfirmTestPayment = () => {
    finalizeOrderPlacement({
      razorpayOrderId: `order_test_${Date.now()}`,
      razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(7)}`,
      razorpaySignature: 'razorpay_test_verified_signature'
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/builder"
          className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-900 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customizer</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Order Summary</h1>
        <p className="text-sm text-stone-500 mt-1">
          Review your pizza recipe, delivery destination, and proceed to payment
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-orange-600" />
              <span>Pizza Recipe Breakdown</span>
            </h2>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">{orderData.pizzaName}</h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Size: {orderData.size} &bull; Quantity: {orderData.quantity}
                  </div>
                </div>
                <div className="text-base font-extrabold text-stone-900">₹{itemsSubtotal}</div>
              </div>

              <div className="pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">Base Crust:</span>
                  <div className="font-medium text-stone-800">{orderData.base}</div>
                </div>
                <div>
                  <span className="text-stone-500">Sauce Layer:</span>
                  <div className="font-medium text-stone-800">{orderData.sauce}</div>
                </div>
                <div>
                  <span className="text-stone-500">Cheese:</span>
                  <div className="font-medium text-stone-800">{orderData.cheese}</div>
                </div>
                <div>
                  <span className="text-stone-500">Vegetables:</span>
                  <div className="font-medium text-stone-800">
                    {orderData.vegetables && orderData.vegetables.length > 0
                      ? orderData.vegetables.join(', ')
                      : 'None selected'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>Delivery Address</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street / Flat / House No."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Payment Breakdown
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>₹{itemsSubtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST Tax (5%)</span>
                <span>₹{gstTax}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span className="text-orange-600">₹{grandTotal}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Razorpay Secured Gateway (Test Mode Enabled)</span>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'Contacting Gateway...' : `Pay ₹${grandTotal} with Razorpay`}</span>
            </button>
          </div>
        </div>
      </div>

      {testSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-stone-900">Razorpay Test Gateway</h3>
            <p className="text-xs text-stone-500 mt-1">
              Simulating standard Razorpay test checkout response
            </p>

            <div className="my-6 p-4 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono text-stone-800">order_test_{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payable Amount:</span>
                <span className="font-bold text-stone-900">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Environment:</span>
                <span className="text-orange-600 font-semibold uppercase">Razorpay Sandbox / Test</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTestSuccessModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTestPayment}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
