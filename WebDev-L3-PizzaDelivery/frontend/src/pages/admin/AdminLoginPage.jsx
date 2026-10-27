import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await adminLogin(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied: Invalid administrator credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-stone-100">
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-300 rounded-2xl p-8 shadow-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-stone-900 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              Restricted Area
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-2">
              Restaurant Admin Portal
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Live inventory management & order dispatching
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-800">Default Seed Credentials:</span><br />
            Email: <span className="font-mono text-stone-900 font-semibold">admin@pizzadelivery.com</span><br />
            Password: <span className="font-mono text-stone-900 font-semibold">Admin@12345</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pizzadelivery.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            <Link to="/login" className="hover:text-stone-900 transition">
              &larr; Switch to Standard Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
