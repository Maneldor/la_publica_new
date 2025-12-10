'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'

export default function TestLoginPage() {
  const [email, setEmail] = useState('g-estandar@lapublica.cat')
  const [password, setPassword] = useState('gestor123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🟡 Intentando login con:', { email, password })

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('🟡 Resultado de signIn:', result)

      if (result?.ok) {
        console.log('✅ Login exitoso, obteniendo sesión...')
        const session = await getSession()
        console.log('🟡 Sesión obtenida:', session)
        setResult({ success: true, result, session })
      } else {
        console.log('❌ Login fallido')
        setResult({ success: false, error: result?.error || 'Login failed' })
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Login Gestor
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-4">
            <h3 className="font-semibold">Resultado:</h3>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}