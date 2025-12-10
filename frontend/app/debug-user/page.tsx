'use client'

import { useState, useEffect } from 'react'
import { checkUserByEmail, verifyUserPassword, createOrUpdateGestorUser } from '@/lib/gestio-empreses/user-check'
import { testUserLogin } from '@/lib/test-auth'

export default function DebugUserPage() {
  const [result, setResult] = useState<any>(null)
  const [authTest, setAuthTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Ejecutar test automáticamente al cargar
    testAuth()
  }, [])

  const testAuth = async () => {
    setLoading(true)
    try {
      const result = await testUserLogin()
      setAuthTest(result)
      console.log('Test auth result:', result)
    } catch (error) {
      setAuthTest({ error: error instanceof Error ? error.message : 'Error' })
    }
    setLoading(false)
  }

  const checkUser = async () => {
    setLoading(true)
    try {
      const result = await checkUserByEmail('g-estandar@lapublica.cat')
      setResult(result)
      console.log('Check user result:', result)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Error' })
    }
    setLoading(false)
  }

  const verifyPassword = async () => {
    setLoading(true)
    try {
      const result = await verifyUserPassword('g-estandar@lapublica.cat', 'gestor123')
      setResult(result)
      console.log('Verify password result:', result)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Error' })
    }
    setLoading(false)
  }

  const createUser = async () => {
    setLoading(true)
    try {
      const result = await createOrUpdateGestorUser(
        'g-estandar@lapublica.cat',
        'Gestor Estàndard',
        'GESTOR_ESTANDARD',
        'gestor123'
      )
      setResult(result)
      console.log('Create user result:', result)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Error' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Usuario</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Usuario: g-estandar@lapublica.cat</h2>
          <div className="flex gap-4">
            <button
              onClick={checkUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Verificar Usuario'}
            </button>
            <button
              onClick={verifyPassword}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Verificar Password'}
            </button>
            <button
              onClick={createUser}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Crear/Actualizar Usuario'}
            </button>
          </div>
        </div>

        {authTest && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Test Automático de Autenticación:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authTest, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Resultado Manual:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}