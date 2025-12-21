'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { UserBasicInfoForm, type UserBasicInfoFormData } from '@/components/forms/UserBasicInfoForm'
import { getCoverCSSGradientByAdministration, type AdministrationType } from '@/lib/utils/generate-avatar'

export default function RegistrePage() {
  const router = useRouter()

  const handleSubmit = async (data: UserBasicInfoFormData & { avatarUrl?: string; avatarColor?: string }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nick: data.nick,
        firstName: data.firstName,
        lastName: data.lastName,
        secondLastName: data.secondLastName || null,
        email: data.email,
        password: data.password,
        administration: data.administration,
        displayPreference: data.displayPreference,
        avatarUrl: data.avatarUrl,
        avatarColor: data.avatarColor,
        coverGradient: data.administration ? getCoverCSSGradientByAdministration(data.administration as AdministrationType) : null
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error en el registre')
    }

    if (result.success) {
      // Login automático después del registro
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (loginResult?.error) {
        // Si falla el login automático, redirigir al login manual
        router.push('/login?registered=true')
      } else {
        // Redirigir al dashboard (rol USER siempre va a dashboard)
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl py-6 px-8">
        <div className="text-center mb-6">
          <img
            src="/images/cropped-logo_la-Pública-ok-2.png"
            alt="La Pública"
            className="w-[150px] h-auto mx-auto mb-3"
          />
          <p className="text-gray-600 text-sm">Crea el teu compte d'empleat públic</p>
        </div>

        <UserBasicInfoForm
          mode="register"
          onSubmit={handleSubmit}
          submitLabel="Crear el meu compte"
          showTerms={true}
        />

        {/* Link a login */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Ja tens compte?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Inicia sessió
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
