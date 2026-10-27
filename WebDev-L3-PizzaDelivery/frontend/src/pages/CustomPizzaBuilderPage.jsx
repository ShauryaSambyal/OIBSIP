import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useSocket } from '../context/SocketContext'
import { Check, ArrowRight, ArrowLeft, Layers, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react'

export const CustomPizzaBuilderPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()

  const preset = location.state?.preset || null

  const [step, setStep] = useState(1)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedSize, setSelectedSize] = useState('Medium')
  const [selectedBase, setSelectedBase] = useState(null)
  const [selectedSauce, setSelectedSauce] = useState(null)
  const [selectedCheese, setSelectedCheese] = useState(null)
  const [selectedVegetables, setSelectedVegetables] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/inventory')
        setInventory(res.data)

        const bases = res.data.filter((item) => item.category === 'base')
        const sauces = res.data.filter((item) => item.category === 'sauce')
        const cheeses = res.data.filter((item) => item.category === 'cheese')

        if (preset) {
          const matchBase = bases.find((b) => b.name === preset.base)
          const matchSauce = sauces.find((s) => s.name === preset.sauce)
          const matchCheese = cheeses.find((c) => c.name === preset.cheese)
          setSelectedBase(matchBase || bases[0])
          setSelectedSauce(matchSauce || sauces[0])
          setSelectedCheese(matchCheese || cheeses[0])
          if (preset.vegetables && Array.isArray(preset.vegetables)) {
            const matchVeg = res.data.filter(
              (item) => item.category === 'vegetable' && preset.vegetables.includes(item.name)
            )
            setSelectedVegetables(matchVeg)
          }
        } else {
          if (bases.length > 0) setSelectedBase(bases[0])
          if (sauces.length > 0) setSelectedSauce(sauces[0])
          if (cheeses.length > 0) setSelectedCheese(cheeses[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [preset])

  useEffect(() => {
    if (!socket) return

    const handleInventorySync = (updatedItems) => {
      setInventory(updatedItems)
    }

    const handleSingleUpdate = (item) => {
      setInventory((prev) => prev.map((it) => (it._id === item._id ? item : it)))
    }

    socket.on('inventory_synced', handleInventorySync)
    socket.on('inventory_updated', handleSingleUpdate)

    return () => {
      socket.off('inventory_synced', handleInventorySync)
      socket.off('inventory_updated', handleSingleUpdate)
    }
  }, [socket])

  const bases = inventory.filter((item) => item.category === 'base')
  const sauces = inventory.filter((item) => item.category === 'sauce')
  const cheeses = inventory.filter((item) => item.category === 'cheese')
  const vegetables = inventory.filter((item) => item.category === 'vegetable')

  const sizeMultiplier = selectedSize === 'Regular' ? 0.8 : selectedSize === 'Large' ? 1.3 : 1.0

  const calculateItemPrice = () => {
    const baseP = selectedBase?.price || 0
    const sauceP = selectedSauce?.price || 0
    const cheeseP = selectedCheese?.price || 0
    const vegP = selectedVegetables.reduce((acc, veg) => acc + (veg.price || 0), 0)
    const subtotal = (baseP + sauceP + cheeseP + vegP) * sizeMultiplier
    return Math.round(subtotal)
  }

  const singlePizzaPrice = calculateItemPrice()
  const totalPrice = singlePizzaPrice * quantity

  const toggleVegetable = (veg) => {
    if (selectedVegetables.some((v) => v._id === veg._id)) {
      setSelectedVegetables((prev) => prev.filter((v) => v._id !== veg._id))
    } else {
      setSelectedVegetables((prev) => [...prev, veg])
    }
  }

  const handleProceedToSummary = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert('Please complete all custom choices.')
      return
    }

    navigate('/summary', {
      state: {
        orderType: 'custom',
        pizzaName: `Custom Crafted (${selectedSize})`,
        size: selectedSize,
        base: selectedBase.name,
        sauce: selectedSauce.name,
        cheese: selectedCheese.name,
        vegetables: selectedVegetables.map((v) => v.name),
        quantity,
        totalAmount: totalPrice,
        unitPrice: singlePizzaPrice
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const stepsList = [
    { num: 1, title: 'Crust Base', subtitle: '5 Artisan Doughs' },
    { num: 2, title: 'Sauce Layer', subtitle: '5 Rich Sauces' },
    { num: 3, title: 'Cheese Selection', subtitle: 'Premium Blends' },
    { num: 4, title: 'Vegetables', subtitle: 'Farm Fresh' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          Step-by-Step Customizer
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mt-2">
          Build Your Signature Pizza
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Hand-pick your crust, sauce, cheese and toppings with live stock verification
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {stepsList.map((st) => (
          <button
            key={st.num}
            onClick={() => setStep(st.num)}
            className={`p-4 rounded-2xl border text-left transition ${
              step === st.num
                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                : step > st.num
                ? 'bg-orange-50 border-orange-200 text-stone-800'
                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Step 0{st.num}</span>
              {step > st.num && <Check className="w-4 h-4 text-orange-600" />}
            </div>
            <div className="font-bold text-sm leading-tight">{st.title}</div>
            <div className="text-[11px] opacity-70 mt-0.5">{st.subtitle}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-900">Step 1: Choose Your Pizza Base</h2>
                <span className="text-xs text-stone-500">5 Options Available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bases.map((base) => {
                  const isSelected = selectedBase?._id === base._id
                  const isOutOfStock = base.stock === 0
                  return (
                    <div
                      key={base._id}
                      onClick={() => !isOutOfStock && setSelectedBase(base)}
                      className={`relative rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600'
                          : isOutOfStock
                          ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={base.imageUrl || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80'}
                          alt={base.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-stone-900">{base.name}</h3>
                            <span className="text-xs font-bold text-stone-900">₹{base.price}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {base.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-red-600'
                              : base.stock <= base.threshold
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${base.stock} units in stock`}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center space-x-1 text-orange-600 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-900">Step 2: Choose Your Sauce</h2>
                <span className="text-xs text-stone-500">5 Artisanal Sauces</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sauces.map((sauce) => {
                  const isSelected = selectedSauce?._id === sauce._id
                  const isOutOfStock = sauce.stock === 0
                  return (
                    <div
                      key={sauce._id}
                      onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                      className={`relative rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600'
                          : isOutOfStock
                          ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={sauce.imageUrl || 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=300&q=80'}
                          alt={sauce.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-stone-900">{sauce.name}</h3>
                            <span className="text-xs font-bold text-stone-900">₹{sauce.price}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {sauce.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-red-600'
                              : sauce.stock <= sauce.threshold
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${sauce.stock} portions in stock`}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center space-x-1 text-orange-600 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-900">Step 3: Choose Cheese Type</h2>
                <span className="text-xs text-stone-500">Pick One Cheese Foundation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cheeses.map((cheese) => {
                  const isSelected = selectedCheese?._id === cheese._id
                  const isOutOfStock = cheese.stock === 0
                  return (
                    <div
                      key={cheese._id}
                      onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                      className={`relative rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600'
                          : isOutOfStock
                          ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={cheese.imageUrl || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?auto=format&fit=crop&w=300&q=80'}
                          alt={cheese.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-stone-900">{cheese.name}</h3>
                            <span className="text-xs font-bold text-stone-900">₹{cheese.price}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {cheese.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-red-600'
                              : cheese.stock <= cheese.threshold
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${cheese.stock} portions in stock`}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center space-x-1 text-orange-600 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-900">Step 4: Choose Vegetables</h2>
                <span className="text-xs text-stone-500">Multiple Selections Allowed</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {vegetables.map((veg) => {
                  const isSelected = selectedVegetables.some((v) => v._id === veg._id)
                  const isOutOfStock = veg.stock === 0
                  return (
                    <div
                      key={veg._id}
                      onClick={() => !isOutOfStock && toggleVegetable(veg)}
                      className={`relative rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600'
                          : isOutOfStock
                          ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={veg.imageUrl || 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=300&q=80'}
                          alt={veg.name}
                          className="w-16 h-16 rounded-xl object-cover mb-2"
                        />
                        <h3 className="font-bold text-xs text-stone-900 leading-tight">{veg.name}</h3>
                        <span className="text-xs font-bold text-orange-600 mt-1">+₹{veg.price}</span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 text-center text-[11px]">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-red-600'
                              : veg.stock <= veg.threshold
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${veg.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-stone-200">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-sm"
              >
                <span>Continue to Step 0{step + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProceedToSummary}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-sm"
              >
                <span>Review Order Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <span>Pizza Blueprint</span>
              </h3>
              <span className="text-xl font-extrabold text-orange-600">₹{totalPrice}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Pizza Crust Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Regular', 'Medium', 'Large'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedSize === s
                        ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Base Crust:</span>
                <span className="font-semibold text-stone-900 text-right">
                  {selectedBase ? `${selectedBase.name} (₹${selectedBase.price})` : 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Sauce Layer:</span>
                <span className="font-semibold text-stone-900 text-right">
                  {selectedSauce ? `${selectedSauce.name} (₹${selectedSauce.price})` : 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Cheese:</span>
                <span className="font-semibold text-stone-900 text-right">
                  {selectedCheese ? `${selectedCheese.name} (₹${selectedCheese.price})` : 'None'}
                </span>
              </div>
              <div className="py-1.5 border-b border-stone-100">
                <div className="flex justify-between mb-1">
                  <span className="text-stone-500">Vegetables:</span>
                  <span className="font-semibold text-stone-900">
                    {selectedVegetables.length} selected
                  </span>
                </div>
                {selectedVegetables.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedVegetables.map((v) => (
                      <span
                        key={v._id}
                        className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium"
                      >
                        {v.name} (+₹{v.price})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-400 italic text-[11px]">No vegetables chosen yet</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 transition"
                >
                  -
                </button>
                <span className="font-bold text-sm text-stone-900 w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleProceedToSummary}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Checkout Custom Pizza</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
