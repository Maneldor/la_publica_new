'use client';

import { User } from '../../../gestor-empreses/missatges/types/chatTypes';

interface UpgradePromptProps {
  currentPlan: 'BÀSIC';
  onUpgrade?: () => void;
}

export function UpgradePrompt({ currentUser, currentPlan }: UpgradePromptProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Missatgeria no disponible
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          La funcionalitat de missatgeria està disponible a partir del pla <strong>Estàndard</strong>.
          Actualment tens el pla <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">{currentPlan}</span>.
        </p>

        {/* Features available with upgrade */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Què obtindràs amb l'actualització:
          </h3>
          <ul className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-700">Comunicació directa amb el teu gestor comercial assignat</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-700">Missatgeria interna entre persones de contacte de la teva empresa</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-700">Suport prioritari i resposta ràpida</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-700">Historial complet de converses</span>
            </li>
          </ul>
        </div>

        {/* Available plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              name: 'ESTÀNDARD',
              price: '29€',
              period: '/mes',
              popular: true,
              features: ['Missatgeria completa', 'Fins a 3 contactes', 'Suport prioritari']
            },
            {
              name: 'PREMIUM',
              price: '59€',
              period: '/mes',
              popular: false,
              features: ['Tot l\'Estàndard', 'Fins a 10 contactes', 'Análisis avançat']
            },
            {
              name: 'EMPRESARIAL',
              price: '99€',
              period: '/mes',
              popular: false,
              features: ['Tot el Premium', 'Contactes il·limitats', 'API personalitzada']
            }
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg p-4 shadow-sm border ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Recomanat
                  </span>
                </div>
              )}
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-600">{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Actualitzar el meu pla
          </button>
          <button className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Contactar amb vendes
          </button>
        </div>

        {/* Contact info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Necessites ajuda?</strong> Contacta amb el nostre equip de vendes:
            <a href="tel:+34900123456" className="font-medium underline ml-1">900 123 456</a>
          </p>
        </div>
      </div>
    </div>
  );
}