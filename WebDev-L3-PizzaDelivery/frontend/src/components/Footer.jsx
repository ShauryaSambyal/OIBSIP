import { Link } from 'react-router-dom'
import { Pizza } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-white mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Pizza className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-stone-900">CRUST & CRAFT</span>
            <span className="text-xs text-stone-600">Pure wood-fired perfection</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition">Menu</Link>
            <Link to="/builder" className="hover:text-stone-900 transition">Custom Builder</Link>
            <Link to="/admin/login" className="hover:text-orange-600 transition">Admin Portal</Link>
          </div>

          <div className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} Crust & Craft Delivery System.
          </div>
        </div>
      </div>
    </footer>
  )
}
