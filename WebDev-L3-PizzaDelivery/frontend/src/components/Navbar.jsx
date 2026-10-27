import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Pizza, User, LogOut, Shield, ShoppingBag, PlusCircle } from 'lucide-react'

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm group-hover:bg-orange-700 transition">
              <Pizza className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 block leading-tight">
                CRUST & CRAFT
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-600 block">
                Artisanal Pizzeria
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-stone-600">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-lg hover:text-stone-900 hover:bg-stone-100 transition"
            >
              Menu
            </Link>
            <Link
              to="/builder"
              className="px-3.5 py-2 rounded-lg hover:text-stone-900 hover:bg-stone-100 transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>Custom Pizza</span>
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className="px-3.5 py-2 rounded-lg hover:text-stone-900 hover:bg-stone-100 transition flex items-center space-x-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-stone-500" />
                <span>My Orders</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-3.5 py-2 rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 transition flex items-center space-x-1.5 font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-xs font-semibold">{user?.name}</span>
                {isAdmin && (
                  <span className="text-[10px] uppercase tracking-wider bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg font-medium bg-stone-900 text-white hover:bg-stone-800 transition text-sm shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
