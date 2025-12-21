'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react'

type VerificationStatus = 'loading' | 'success' | 'already_verified' | 'error' | 'expired' | 'no_token'

interface VerificationResult {
  success: boolean
  message: string
  alreadyVerified?: boolean
  code?: string
  user?: {
    email: string
    nick: string
    firstName?: string
  }
}

export default function VerificarEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no_token')
      setMessage('No s\'ha proporcionat cap token de verificació.')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data: VerificationResult = await response.json()

        if (response.ok && data.success) {
          if (data.alreadyVerified) {
            setStatus('already_verified')
          } else {
            setStatus('success')
          }
          setMessage(data.message)
          if (data.user?.email) {
            setUserEmail(data.user.email)
          }
        } else {
          if (data.code === 'TOKEN_EXPIRED') {
            setStatus('expired')
          } else {
            setStatus('error')
          }
          setMessage(data.error || 'Error verificant el correu.')
        }
      } catch {
        setStatus('error')
        setMessage('Error de connexió. Torna-ho a provar.')
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setResendMessage('Introdueix el teu correu electrònic')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage(data.message)
        if (data.alreadyVerified) {
          setStatus('already_verified')
        }
      } else {
        setResendMessage(data.error || 'Error enviant el correu')
      }
    } catch {
      setResendMessage('Error de connexió. Torna-ho a provar.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verificant el teu correu...
            </h1>
            <p className="text-gray-600">
              Espera un moment mentre verifiquem el teu compte.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Correu verificat!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Iniciar sessió
            </Link>
          </div>
        )

      case 'already_verified':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Compte ja verificat
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Iniciar sessió
            </Link>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enllaç expirat
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Introdueix el teu correu per rebre un nou enllaç de verificació:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="el-teu@correu.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isResending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Reenviar
                </button>
              </div>
              {resendMessage && (
                <p className={`mt-3 text-sm ${resendMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        )

      case 'error':
      case 'no_token':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error de verificació
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Si necessites un nou enllaç de verificació:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="el-teu@correu.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isResending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Enviar
                </button>
              </div>
              {resendMessage && (
                <p className={`mt-3 text-sm ${resendMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              )}
            </div>

            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Tornar a l'inici de sessió
            </Link>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo.png"
              alt="La Pública"
              className="h-10 mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Tens problemes?{' '}
            <a href="mailto:soporte@lapublica.es" className="text-indigo-600 hover:underline">
              Contacta amb suport
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
