import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { PlusCircle, Sparkles, Flame, Check, ArrowRight, ShieldAlert } from 'lucide-react'

export const HomePage = () => {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas')
        setPizzas(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPizzas()
  }, [])

  const filteredPizzas = pizzas.filter((pizza) => {
    if (filter === 'veg') return pizza.category === 'veg'
    if (filter === 'non-veg') return pizza.category === 'non-veg'
    if (filter === 'bestseller') return pizza.isBestseller
    return true
  })

  const handleQuickOrder = (pizza) => {
    navigate('/summary', {
      state: {
        orderType: 'pre-made',
        pizzaName: pizza.name,
        size: 'Medium',
        base: pizza.base || 'Classic Hand-Tossed',
        sauce: pizza.sauce || 'Classic Marinara',
        cheese: pizza.cheese || 'Mozzarella',
        vegetables: pizza.vegetables || [],
        quantity: 1,
        totalAmount: pizza.price,
        imageUrl: pizza.imageUrl
      }
    })
  }

  const handleCustomize = (pizza) => {
    navigate('/builder', {
      state: {
        preset: {
          base: pizza.base,
          sauce: pizza.sauce,
          cheese: pizza.cheese,
          vegetables: pizza.vegetables
        }
      }
    })
  }

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-stone-900 text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-12 mx-3 sm:mx-6 lg:mx-8 rounded-3xl border border-stone-800 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs font-semibold text-orange-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wood-Fired Artisanal Pies</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Crafted with Passion. <br />
              <span className="text-orange-500">Delivered in 30 Mins.</span>
            </h1>
            <p className="mt-5 text-stone-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Fresh fermented dough, San Marzano vine sauces, and artisanal cheeses.
              Build your signature pizza or order our chef's hand-crafted selections.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/builder"
                className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition shadow-lg flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Build Custom Pizza</span>
              </Link>
              <a
                href="#menu-section"
                className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition border border-stone-700"
              >
                Explore Varieties
              </a>
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-lg">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                alt="Wood Fired Artisanal Pizza"
                className="w-full h-80 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
                    Chef's Masterpiece
                  </div>
                  <div className="text-sm font-bold text-white">Quattro Formaggi & Fresh Basil</div>
                </div>
                <div className="text-lg font-bold text-white">₹469</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">Pizza Varieties</h2>
            <p className="text-sm text-stone-500 mt-1">
              Select from our curated menu or tailor each slice in the custom builder
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Pies' },
              { id: 'bestseller', label: 'Bestsellers' },
              { id: 'veg', label: 'Vegetarian' },
              { id: 'non-veg', label: 'Specialty' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  filter === tab.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-stone-200 rounded-2xl h-96 animate-pulse p-4">
                <div className="w-full h-48 bg-stone-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-stone-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-stone-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-stone-200 rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredPizzas.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
            <p className="text-stone-500 text-sm">No pizzas found under this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPizzas.map((pizza) => (
              <div
                key={pizza._id}
                className="group bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-stone-100">
                  <img
                    src={pizza.imageUrl}
                    alt={pizza.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {pizza.isBestseller && (
                    <div className="absolute top-3 left-3 bg-stone-900 text-orange-400 border border-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" />
                      <span>Bestseller</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-stone-700 border border-stone-200">
                    {pizza.category === 'veg' ? '🌱 100% Veg' : '🥩 Gourmet'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-stone-900 leading-snug">{pizza.name}</h3>
                      <span className="text-lg font-extrabold text-stone-900">₹{pizza.price}</span>
                    </div>

                    <p className="mt-2 text-xs text-stone-500 leading-relaxed line-clamp-2">
                      {pizza.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-md font-medium">
                        {pizza.base}
                      </span>
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-md font-medium">
                        {pizza.sauce}
                      </span>
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-md font-medium">
                        {pizza.cheese}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCustomize(pizza)}
                      className="px-3 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition"
                    >
                      Customize
                    </button>
                    <button
                      onClick={() => handleQuickOrder(pizza)}
                      className="px-3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition shadow-sm"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-200">
              Interactive 4-Step Builder
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Want Something Truly Unique?
            </h3>
            <p className="text-orange-100 text-sm mt-2 leading-relaxed">
              Mix and match from 5 authentic bases, 5 rich sauces, premium cheeses, and crisp garden toppings with real-time stock and price updates.
            </p>
          </div>
          <Link
            to="/builder"
            className="px-6 py-3.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm transition shadow-lg whitespace-nowrap flex items-center space-x-2"
          >
            <span>Open Custom Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
