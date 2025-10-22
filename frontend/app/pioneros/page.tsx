'use client';

import { useState } from 'react';

export default function PionerosPage() {
  const [formData, setFormData] = useState({
    empresa: '',
    personaContacte: '',
    departament: '',
    carrec: '',
    telefonContacte: '',
    emailContacte: '',
    sector: '',
    localitzacio: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Comptador de places
  const placesOcupades = 5;
  const placesTotals = 100;
  const placesDisponibles = placesTotals - placesOcupades;
  const percentatgeOcupat = (placesOcupades / placesTotals) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Hi ha algun cost ocult?",
      answer: "No, 6 mesos 100% gratis. Sense lletra petita, sense costos d'activació, sense quotes d'entrada."
    },
    {
      question: "Quins beneficis he d'oferir?",
      answer: "Els que tu decideixis: descomptes, ofertes exclusives, productes especials, serveis VIP, etc."
    },
    {
      question: "Hi ha límit de places?",
      answer: "Sí, només 100 empreses pioneres. Un cop completades, les noves empreses pagaran preu regular sense descomptes."
    },
    {
      question: "Quan començo a pagar?",
      answer: "Mes 7 amb 50% descompte. Tindràs 6 mesos complets per veure resultats abans del primer pagament."
    },
    {
      question: "Què passa si no funciona?",
      answer: "Cancel·les sense penalització en qualsevol moment. No hi ha permanència ni penalitzacions per cancel·lació."
    },
    {
      question: "Què passa si vull cancel·lar durant els 6 mesos gratis?",
      answer: "Cap problema. Els 6 mesos de prova són completament sense compromís. Pots cancel·lar en qualsevol moment sense cap penalització ni cost. L'objectiu és que proveu la plataforma sense risc."
    },
    {
      question: "Els familiars també poden usar els beneficis?",
      answer: "Sí, cònjuges, fills i pares poden accedir als beneficis que ofereixis, multiplicant l'impacte del teu negoci."
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2c5aa0] via-[#4a6fa5] to-[#667ba8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center transform animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sol·licitud Enviada!</h2>
          <p className="text-gray-600 text-lg leading-relaxed">Ens posarem en contacte amb tu en les pròximes 24 hores per activar el teu accés al Programa Empreses Pioneres.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c5aa0] via-[#4a6fa5] to-[#667ba8]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/images/cropped-logo_la-Pública-ok-2.png"
                alt="La Pública"
                className="h-24 w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${placesDisponibles < 20 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                ⚠️ Només {placesDisponibles} places
              </span>
              <div className="text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
                Programa Empreses Pioneres
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section amb Comptador */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6 border border-white/30">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            🚀 Programa Exclusiu · Només per 100 empreses seleccionades
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tight">
            🏆 PROGRAMA EMPRESES PIONERES
          </h1>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">PLACES LIMITADES: NOMÉS 100 EMPRESES</h2>

            <div className="mb-8">
              <div className="flex justify-center items-baseline gap-4 mb-4">
                <div className="text-center">
                  <div className="text-6xl font-black text-green-600">{placesOcupades}</div>
                  <div className="text-sm text-gray-600">Places ocupades</div>
                </div>
                <div className="text-4xl text-gray-400">/</div>
                <div className="text-center">
                  <div className="text-6xl font-black text-gray-300">{placesTotals}</div>
                  <div className="text-sm text-gray-600">Places totals</div>
                </div>
              </div>

              <div className="bg-gray-200 rounded-full h-8 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 flex items-center justify-center text-white font-bold"
                  style={{ width: `${percentatgeOcupat}%` }}
                >
                  {percentatgeOcupat}%
                </div>
              </div>

              <div className={`text-3xl font-bold ${placesDisponibles < 20 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                ⚠️ Només {placesDisponibles} places disponibles
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-6">
              Un cop completades les 100 places, les noves empreses no disposaran<br />
              de període de prova gratuït ni gaudiran dels descomptes i condicions<br />
              especials reservades exclusivament per a les empreses pioneres.
            </p>

            <div className="text-xs text-gray-500 mb-6">
              📅 Actualitzat: 14 octubre 2025
            </div>

            <a href="#formulario" className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-2xl transform hover:scale-105">
              Reservar la meva plaça →
            </a>
          </div>

          <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Ven els teus productes i serveis a <span className="font-semibold text-yellow-300">empleats públics i els seus familiars directes</span> a Catalunya
          </p>
        </div>
      </section>

      {/* Nova secció: Per què només 100 empreses? */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              ❓ Per què només <span className="text-green-600">100 empreses pioneres</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Qualitat sobre quantitat</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Selecció acurada d'empreses compromeses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Millor experiència per als empleats públics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Atenció personalitzada a cada empresa</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Beneficis permanents exclusius</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⭐</span>
                  <span>Badge "Empresa Pionera" per sempre</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⭐</span>
                  <span>20% descompte permanent mentre col·laboris</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⭐</span>
                  <span>Prioritat en noves funcionalitats</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              🚫 Què passa després de les 100 places?
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Empreses Pioneres */}
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-green-800 mb-4 text-center">
                  ✅ EMPRESES PIONERES<br />
                  <span className="text-sm font-normal">(Primeres 100)</span>
                </h4>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>6 mesos gratis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>50% descompte any 1</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>20% descompte permanent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Badge 'Empresa Pionera'</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Posició prioritària</span>
                  </li>
                </ul>
              </div>

              {/* Empreses Estàndard */}
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-red-800 mb-4 text-center">
                  ❌ EMPRESES ESTÀNDARD<br />
                  <span className="text-sm font-normal">(Des de la 101)</span>
                </h4>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span>Preu regular des del dia 1: <strong>600€/any</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span>Sense descomptes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span>Sense badge especial</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span>Posició estàndard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span>Sense període de prova</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiència Potencial */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Audiència <span className="bg-gradient-to-r from-[#2c5aa0] to-[#4a6fa5] bg-clip-text text-transparent">Potencial</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Més d'1 milió de persones a Catalunya
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: '👔',
                number: '450.000',
                label: 'Empleats públics',
                desc: 'Funcionaris Generalitat • Personal sanitari (ICS) • Professorat públic • Empleats ajuntaments'
              },
              {
                icon: '👨‍👩‍👧‍👦',
                number: '+675.000',
                label: 'Familiars directes',
                desc: 'Cònjuges • Fills • Pares'
              }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-4xl font-black text-[#2c5aa0] mb-2">{stat.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{stat.label}</h3>
                <p className="text-gray-600">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficis */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Beneficis Exclusius <span className="text-green-600">(Només primeres 100)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🆓', title: '6 mesos completament GRATIS', desc: 'Sense costos d\'entrada' },
              { icon: '💰', title: '50% de descompte durant el primer any', desc: 'Preu especial pioneres' },
              { icon: '🏆', title: 'Badge d\'Empresa Pionera', desc: 'Reconeixement exclusiu per sempre' },
              { icon: '⭐', title: 'Posició prioritària a les cerques', desc: 'Major visibilitat' },
              { icon: '🎯', title: 'Descompte permanent del 20%', desc: 'Per sempre mentre col·laboris' },
              { icon: '🔄', title: 'Efecte multiplicador familiar', desc: 'Arribem també als seus familiars' }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Com Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Com Funciona per Empreses Pioneres
          </h2>

          {/* Timeline */}
          <div className="space-y-8 mb-16">
            <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-2">🎁 FASE 1: Prova gratuïta (6 mesos)</h3>
              <p className="text-green-700">Accés complet sense cost ni compromís</p>
            </div>

            <div className="text-center text-gray-400">↓ Després de 6 mesos, decideixes</div>

            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-2">✍️ FASE 2: Contracte anual amb 50% dto</h3>
              <p className="text-blue-700">Si t'agrada, signes contracte anual<br/>
              Pla Estàndard: 300€/any (vs 600€)</p>
            </div>

            <div className="text-center text-gray-400">↓ Cada any</div>

            <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-2">🔄 FASE 3: Renovació amb 20% dto permanent</h3>
              <p className="text-purple-700">Mentre col·laboris, mantens sempre<br/>
              Pla Estàndard: 480€/any (vs 600€)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans i Preus */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Plans Disponibles
          </h2>
          <p className="text-center text-xl text-green-600 font-semibold mb-12">
            🔥 Condicions exclusives només per les 100 primeres empreses
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pla Estàndard */}
            <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-8">
              <div className="text-green-600 text-sm font-bold mb-2">🟢 PLA ESTÀNDARD</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Per començar</h3>

              <div className="space-y-2 mb-6">
                <div className="text-sm">• Prova: <span className="font-bold">6 mesos GRATIS</span></div>
                <div className="text-sm">• Any 1: <span className="font-bold">300€/any</span> (50% dto)</div>
                <div className="text-sm">• Any 2+: <span className="font-bold">480€/any</span> (20% dto)</div>
                <div className="text-sm text-gray-500 line-through">Preu regular: 600€/any</div>
              </div>

              <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-6 text-center">
                <div className="text-2xl font-bold">Estalvi 3 anys: 540€</div>
              </div>

              <a href="#formulario" className="block w-full text-center bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                Aquest és el meu pla →
              </a>
            </div>

            {/* Pla Estratègic */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-3xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                MÉS POPULAR
              </div>
              <div className="text-blue-600 text-sm font-bold mb-2">🔵 PLA ESTRATÈGIC</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Per créixer</h3>

              <div className="space-y-2 mb-6">
                <div className="text-sm">• Prova: <span className="font-bold">6 mesos GRATIS</span></div>
                <div className="text-sm">• Any 1: <span className="font-bold">600€/any</span> (50% dto)</div>
                <div className="text-sm">• Any 2+: <span className="font-bold">960€/any</span> (20% dto)</div>
                <div className="text-sm text-gray-500 line-through">Preu regular: 1.200€/any</div>
              </div>

              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <div className="text-sm font-semibold text-blue-800 mb-2">Inclou tot l'anterior més:</div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>+ Acompanyament IA</li>
                  <li>+ Informes mensuals</li>
                  <li>+ Estadístiques avançades</li>
                </ul>
              </div>

              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-6 text-center">
                <div className="text-2xl font-bold">Estalvi 3 anys: 1.080€</div>
              </div>

              <a href="#formulario" className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Consultar →
              </a>
            </div>

            {/* Pla Partner */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-3xl p-8">
              <div className="text-purple-600 text-sm font-bold mb-2">🟣 PLA PARTNER</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Institucional</h3>

              <div className="space-y-2 mb-6">
                <div className="text-sm">• Prova: <span className="font-bold">6 mesos GRATIS</span></div>
                <div className="text-sm">• Any 1: <span className="font-bold">1.000€/any</span> (50% dto)</div>
                <div className="text-sm">• Any 2+: <span className="font-bold">1.600€/any</span> (20% dto)</div>
                <div className="text-sm text-gray-500 line-through">Preu regular: 2.000€/any</div>
              </div>

              <div className="bg-purple-100 p-3 rounded-lg mb-4">
                <div className="text-sm font-semibold text-purple-800 mb-2">Inclou tot l'anterior més:</div>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>+ Integració marca</li>
                  <li>+ Gestor dedicat</li>
                  <li>+ Espai propi</li>
                  <li>+ Co-branding</li>
                </ul>
              </div>

              <div className="bg-purple-100 text-purple-800 p-3 rounded-lg mb-6 text-center">
                <div className="text-2xl font-bold">Estalvi 3 anys: 1.800€</div>
              </div>

              <button className="block w-full text-center bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Contactar →
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-red-100 border-2 border-red-200 rounded-2xl p-6">
              <p className="text-red-800 font-bold text-lg">
                ⚠️ Després de les 100 places: Preu regular des del dia 1, sense descomptes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Últimes empreses unides */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            🎉 Últimes empreses unides al programa
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Restaurant Els Fogons',
              'Gimnàs Fitness Plus',
              'Òptica Visió Clara',
              'Dental Somriures',
              'Auto Taller Ràpid'
            ].map((empresa, idx) => (
              <div key={idx} className="bg-white px-6 py-3 rounded-full shadow-md">
                <span className="text-green-600 mr-2">✓</span>
                <span className="font-medium">{empresa}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulari */}
      <section id="formulario" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Reserva la teva plaça
            </h2>
            <p className="text-xl text-green-600 font-semibold">
              Només {placesDisponibles} places disponibles
            </p>
          </div>
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border-2 border-green-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  name="empresa"
                  required
                  value={formData.empresa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona de contacte *
                </label>
                <input
                  type="text"
                  name="personaContacte"
                  required
                  value={formData.personaContacte}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departament *
                </label>
                <input
                  type="text"
                  name="departament"
                  required
                  value={formData.departament}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Càrrec *
                </label>
                <input
                  type="text"
                  name="carrec"
                  required
                  value={formData.carrec}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telèfon contacte *
                </label>
                <input
                  type="tel"
                  name="telefonContacte"
                  required
                  value={formData.telefonContacte}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email contacte *
                </label>
                <input
                  type="email"
                  name="emailContacte"
                  required
                  value={formData.emailContacte}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <select
                  name="sector"
                  required
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecciona el sector...</option>
                  <option value="salut-benestar">Salut i benestar</option>
                  <option value="educacio-formacio">Educació i formació</option>
                  <option value="esport-fitness">Esport i fitness</option>
                  <option value="restauracio-hostaleria">Restauració i hostaleria</option>
                  <option value="comerc-retail">Comerç i retail</option>
                  <option value="serveis-professionals">Serveis professionals</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="transport-logistica">Transport i logística</option>
                  <option value="online">Online</option>
                  <option value="altres">Altres</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localització *
                </label>
                <select
                  name="localitzacio"
                  required
                  value={formData.localitzacio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecciona la localització...</option>
                  <option value="barcelona">Barcelona</option>
                  <option value="girona">Girona</option>
                  <option value="lleida">Lleida</option>
                  <option value="tarragona">Tarragona</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 transform hover:scale-105"
            >
              {loading ? 'Enviant...' : 'Reservar la meva plaça ara →'}
            </button>
          </form>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Preguntes Freqüents
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex justify-between items-center"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="text-2xl text-gray-400">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="text-gray-600 text-lg mt-4">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="/images/cropped-logo_la-Pública-ok-2.png"
            alt="La Pública"
            className="h-24 w-auto mx-auto mb-4 bg-white rounded-lg p-3"
          />
          <div className="mt-8 pt-8 border-t border-gray-600">
            <h4 className="text-lg font-semibold mb-4">Contacte</h4>
            <div className="space-y-2 text-gray-400">
              <p>📧 Email: contacto@lapublica.es</p>
              <p>📞 Telèfon: +34 XXX XXX XXX</p>
              <p>🕐 Horari: Dilluns a Divendres, 9:00-18:00h</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-green-400 font-medium text-center">
                Resposta garantida en menys de 24 hores
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}