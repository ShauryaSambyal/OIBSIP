import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await register(name, email, password)
      setSuccessInfo(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Create an account</h1>
            <p className="text-sm text-stone-500 mt-1.5">
              Sign up to customize, order, and track fresh pizzas
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successInfo ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-stone-900">Verification Email Sent</h2>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                We sent an activation link to <strong className="text-stone-900">{successInfo.email}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>

              {successInfo.verificationToken && (
                <div className="mt-6 p-3 bg-stone-50 border border-stone-200 rounded-xl text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Quick Verification (Development Mode)
                  </div>
                  <Link
                    to={`/verify-email?token=${successInfo.verificationToken}`}
                    className="text-xs text-orange-600 font-semibold hover:underline break-all"
                  >
                    Click here to instantly verify
                  </Link>
                </div>
              )}

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition shadow-sm"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {!successInfo && (
            <div className="mt-6 text-center text-xs text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-stone-900 hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
