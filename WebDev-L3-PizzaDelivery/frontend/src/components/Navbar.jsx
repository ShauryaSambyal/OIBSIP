import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Pizza,
  User,
  LogOut,
  Shield,
  ShoppingBag,
  PlusCircle,
  Menu,
  X
} from 'lucide-react'

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <header
        className={`max-w-7xl mx-auto pointer-events-auto rounded-2xl transition-all duration-300 border ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-stone-300/80 shadow-lg py-2'
            : 'bg-white/90 backdrop-blur-md border-stone-200/90 shadow-sm py-2.5'
        }`}
      >
        <div className="px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm group-hover:bg-orange-700 transition">
                <Pizza className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-stone-900 block leading-tight">
                  CRUST & CRAFT
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-600 block">
                  Artisanal Pizzeria
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-stone-600">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl transition ${
                  isActive('/')
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Menu
              </Link>
              <Link
                to="/builder"
                className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                  isActive('/builder')
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <PlusCircle className={`w-3.5 h-3.5 ${isActive('/builder') ? 'text-orange-400' : 'text-orange-600'}`} />
                <span>Custom Pizza</span>
              </Link>
              {isAuthenticated && !isAdmin && (
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  <span>My Orders</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-3 text-xs">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-semibold">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-[9px] uppercase tracking-wider bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl font-semibold bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold">
                <User className="w-3 h-3 text-stone-500" />
                <span className="truncate max-w-[80px]">{user?.name}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-stone-200/80 px-4 pb-3 space-y-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              className={`block px-3.5 py-2.5 rounded-xl transition ${
                isActive('/') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/builder"
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl transition ${
                isActive('/builder') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>Custom Pizza</span>
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl transition ${
                  isActive('/dashboard') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-stone-500" />
                <span>My Orders</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl transition ${
                  isActive('/admin/dashboard')
                    ? 'bg-orange-600 text-white'
                    : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="pt-2 border-t border-stone-200/60">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    className="text-center py-2.5 rounded-xl border border-stone-200 text-stone-800 hover:bg-stone-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
