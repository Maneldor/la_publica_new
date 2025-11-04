'use client';

import { useState } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';

export default function EmpresaPlaPage() {
  const [currentPlan, setCurrentPlan] = useState('premium');

  const plans = [
    {
      id: 'basic',
      name: 'Pla Bàsic',
      description: 'Perfecte per començar',
      icon: '⚡',
      priceMonthly: 39,
      priceYearly: 390,
      color: 'gray',
      features: [
        'Perfil d\'empresa bàsic',
        '1 membre d\'equip',
        'Estadístiques bàsiques',
        'Suport per missatgeria interna',
        '3 ofertes actives al mes'
      ],
      limitations: [
        'Sense agent IA',
        'Sense prioritat en cerques',
        'Sense analítiques avançades'
      ],
      popular: false,
      current: false
    },
    {
      id: 'standard',
      name: 'Pla Estàndard',
      description: 'Ideal per empreses en creixement',
      icon: '⭐',
      priceMonthly: 79,
      priceYearly: 790,
      color: 'blue',
      features: [
        'Tot del pla Bàsic',
        'Fins a 3 membres d\'equip',
        'Estadístiques avançades',
        'Suport telefònic',
        'Publicació de 10 ofertes actives/mes',
        '1 Agent IA comercial',
        'Prioritat mitjana en cerques',
        'Enviament ofertes mitjançant newsletter'
      ],
      limitations: [
        'Agent IA amb funcionalitats limitades',
        'Sense personalització avançada'
      ],
      popular: true,
      current: false
    },
    {
      id: 'premium',
      name: 'Pla Premium',
      description: 'Per empreses que volen destacar',
      icon: '🌟',
      priceMonthly: 149,
      priceYearly: 1490,
      color: 'purple',
      features: [
        'Tot del pla Estàndard',
        'Fins a 10 membres d\'equip',
        'Analítiques completes',
        'Informes mensuals',
        'Suport prioritari 24/7',
        'Ofertes il·limitades',
        '3 Agents IA avançats',
        'Màxima prioritat en cerques',
        'Perfil destacat',
        'Personalització avançada'
      ],
      limitations: [],
      popular: false,
      current: true
    },
    {
      id: 'empresarial',
      name: 'Pla Empresarial',
      description: 'Solucions a mida per grans corporacions',
      icon: '👑',
      priceMonthly: null,
      priceYearly: null,
      customPrice: 'Personalitzat',
      color: 'amber',
      features: [
        'Tot del pla Premium',
        'Gestió multi-empresa',
        'API personalitzada',
        'Integració amb sistemes interns',
        'Agents IA il·limitats',
        'Account manager dedicat',
        'Formació personalitzada',
        'SLA garantit'
      ],
      limitations: [],
      popular: false,
      current: false,
      enterprise: true
    }
  ];

  const getColorClasses = (color: string, isActive = false) => {
    const colors = {
      gray: {
        bg: isActive ? 'bg-gray-50' : 'bg-white',
        border: isActive ? 'border-gray-300' : 'border-gray-200',
        button: 'bg-gray-600 hover:bg-gray-700 text-white',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700'
      },
      blue: {
        bg: isActive ? 'bg-blue-50' : 'bg-white',
        border: isActive ? 'border-blue-300' : 'border-gray-200',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      },
      purple: {
        bg: isActive ? 'bg-purple-50' : 'bg-white',
        border: isActive ? 'border-purple-300' : 'border-gray-200',
        button: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white',
        icon: 'text-purple-600',
        badge: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
      },
      amber: {
        bg: isActive ? 'bg-amber-50' : 'bg-white',
        border: isActive ? 'border-amber-300' : 'border-gray-200',
        button: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900',
        icon: 'text-amber-600',
        badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plans i Preus</h1>
        <p className="text-gray-600 mt-2">Tria el pla que millor s'adapti a les necessitats de la teva empresa</p>
      </div>

      {/* Current Plan Alert */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pla Actual: Premium</h3>
            <p className="text-gray-600">Estàs gaudint de totes les funcionalitats avançades del nostre pla més popular</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isActive = plan.current;
          const colors = getColorClasses(plan.color, isActive);
          const savingsYearly = plan.priceMonthly ? (plan.priceMonthly * 12) - plan.priceYearly : 0;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} p-6 transition-all duration-200 hover:shadow-lg`}
            >
              {/* Popular Badge - Esquina superior izquierda */}
              {plan.popular && (
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                  <span>⭐</span>
                  <span>Més Popular</span>
                </div>
              )}

              {/* Enterprise Badge - Esquina superior derecha (solo si no es plan actual) */}
              {plan.enterprise && !isActive && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                  <span>👑</span>
                  <span>Empresarial</span>
                </div>
              )}

              {/* Current Plan Badge - Esquina superior derecha */}
              {isActive && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                  Pla Actual
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4 flex justify-center">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex flex-col items-center">
                  {plan.customPrice ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900">{plan.customPrice}</span>
                      <span className="text-gray-600 text-sm mt-1">Contacta'ns per a un pressupost</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-gray-900">{plan.priceMonthly}€</span>
                        <span className="text-gray-600 ml-1">/mes</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        o {plan.priceYearly}€ /any <span className="text-green-600 font-semibold">(estalvia {savingsYearly}€)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900 text-sm">Inclou:</h4>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations */}
              {plan.limitations && plan.limitations.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-gray-900 text-sm">Limitacions:</h4>
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span className="text-sm text-gray-600">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  isActive ? 'bg-blue-500 text-white cursor-not-allowed opacity-75' :
                  plan.enterprise ? colors.button :
                  plan.priceMonthly > 149 ? 'bg-gray-500 hover:bg-gray-600 text-white' :
                  'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isActive}
              >
                {isActive ? 'Pla Actual' : plan.enterprise ? 'Contactar Vendes' : `Canviar al ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Comparació Detallada de Plans</h3>
          <p className="text-gray-600 text-sm mt-1">Veu totes les diferències entre els nostres plans</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Funcionalitat</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Bàsic</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Estàndard</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Premium</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Empresarial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-6 text-gray-900">Membres d'equip</td>
                <td className="text-center py-3 px-4 text-gray-600">1</td>
                <td className="text-center py-3 px-4 text-gray-600">3</td>
                <td className="text-center py-3 px-4 text-gray-600">10</td>
                <td className="text-center py-3 px-4 text-green-600">Il·limitats</td>
              </tr>
              <tr className="bg-gray-25">
                <td className="py-3 px-6 text-gray-900">Agents IA</td>
                <td className="text-center py-3 px-4 text-red-500">0</td>
                <td className="text-center py-3 px-4 text-gray-600">1</td>
                <td className="text-center py-3 px-4 text-green-600">3</td>
                <td className="text-center py-3 px-4 text-green-600">Il·limitats</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-gray-900">Ofertes actives</td>
                <td className="text-center py-3 px-4 text-gray-600">3/mes</td>
                <td className="text-center py-3 px-4 text-gray-600">10/mes</td>
                <td className="text-center py-3 px-4 text-green-600">Il·limitades</td>
                <td className="text-center py-3 px-4 text-green-600">Il·limitades</td>
              </tr>
              <tr className="bg-gray-25">
                <td className="py-3 px-6 text-gray-900">Suport</td>
                <td className="text-center py-3 px-4 text-gray-600">Missatgeria</td>
                <td className="text-center py-3 px-4 text-gray-600">Telefònic</td>
                <td className="text-center py-3 px-4 text-green-600">24/7 Prioritari</td>
                <td className="text-center py-3 px-4 text-green-600">Dedicat</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-gray-900">Analítiques</td>
                <td className="text-center py-3 px-4 text-gray-600">Bàsiques</td>
                <td className="text-center py-3 px-4 text-gray-600">Avançades</td>
                <td className="text-center py-3 px-4 text-green-600">Completes</td>
                <td className="text-center py-3 px-4 text-green-600">Completes + API</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preguntes Freqüents</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Puc canviar de pla en qualsevol moment?</h4>
            <p className="text-gray-600 text-sm">Sí, pots canviar de pla en qualsevol moment. Els canvis es fan efectius immediatament i es prorrategeu la diferència de preu.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Què passa si supero els límits del meu pla?</h4>
            <p className="text-gray-600 text-sm">Rebràs una notificació quan t'acostis als límits. Pots actualitzar el teu pla o pagar per ús addicional.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Hi ha descomptes per pagament anual?</h4>
            <p className="text-gray-600 text-sm">Sí, oferim un 20% de descompte per als pagaments anuals. Contacta amb vendes per més informació.</p>
          </div>
        </div>
      </div>
    </div>
  );
}