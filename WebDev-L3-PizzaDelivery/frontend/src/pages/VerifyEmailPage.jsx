import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided in URL.')
      return
    }

    const performVerification = async () => {
      try {
        const data = await verifyEmail(token)
        setStatus('success')
        setMessage(data.message || 'Your email has been successfully verified!')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.')
      }
    }

    performVerification()
  }, [token])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
          {status === 'verifying' && (
            <div className="py-8">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-bold text-stone-900">Verifying your email...</h2>
              <p className="text-sm text-stone-500 mt-2">
                Please wait a moment while we confirm your activation token.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Account Activated</h2>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{message}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/builder"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition shadow-sm space-x-2"
                >
                  <span>Build Pizza</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition"
                >
                  Browse Menu
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Verification Failed</h2>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{message}</p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
