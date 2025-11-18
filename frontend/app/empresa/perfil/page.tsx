'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Bookmark, Globe, Star } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function EmpresaPerfilPage() {
  // Mock data for stats usando StatCard
  const statsData = [
    {
      title: 'Vistes',
      value: '1,234',
      icon: <Eye className="w-10 h-10" />,
      color: 'blue' as const,
      trend: {
        value: '+12%',
        label: 'vs mes anterior',
        isPositive: true
      }
    },
    {
      title: 'Guardats',
      value: '89',
      icon: <Bookmark className="w-10 h-10" />,
      color: 'green' as const
    },
    {
      title: 'Clics web',
      value: '156',
      icon: <Globe className="w-10 h-10" />,
      color: 'purple' as const
    },
    {
      title: 'Valoració',
      value: '4.8/5',
      icon: <Star className="w-10 h-10" />,
      color: 'orange' as const
    }
  ];

  // Mock company data
  const companyData = {
    nom: 'MAPFRE',
    sector: 'Assegurances',
    valoracio: 4.8,
    numValoracions: 127,
    pla: 'PREMIUM',
    descripcio: 'MAPFRE és una empresa líder global en assegurances i reasegurances. Oferim solucions innovadores i personalitzades per a particulars, empreses i organismes públics. La nostra experiència de més de 90 anys i la nostra presència internacional ens permeten oferir els millors serveis del sector assegurador.',
    ubicacio: 'Barcelona, Catalunya',
    email: 'contacte@mapfre.cat',
    web: 'www.mapfre.com',
    telefon: '+34 900 123 456',
    logo: 'https://logos-world.net/wp-content/uploads/2021/02/Mapfre-Logo.png',
    productes: [
      'Assegurances de vida',
      'Assegurances de vehicles',
      'Assegurances de llar',
      'Assegurances empresarials',
      'Plans de pensions',
      'Inversions'
    ]
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      BÀSIC: 'bg-gray-100 text-gray-700',
      ESTÀNDARD: 'bg-blue-100 text-blue-700',
      PREMIUM: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
      EMPRESARIAL: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900'
    };

    const icons = {
      BÀSIC: '',
      ESTÀNDARD: '',
      PREMIUM: '⭐',
      EMPRESARIAL: '👑'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[plan as keyof typeof styles]}`}>
        {icons[plan as keyof typeof icons] && <span>{icons[plan as keyof typeof icons]}</span>}
        <span>{plan}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with title and edit button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfil d'Empresa</h1>
          <p className="text-gray-600 mt-2">Gestiona la informació pública de la teva empresa</p>
        </div>
        <Link
          href="/empresa/perfil/editar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span>✏️</span>
          Editar perfil
        </Link>
      </div>

      {/* Stats cards using StatCard component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(statsData || []).map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Large preview card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Card header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={companyData.logo}
                  alt={`Logo de ${companyData.nom}`}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{companyData.nom}</h2>
                  {getPlanBadge(companyData.pla)}
                </div>
                <p className="text-gray-600">Sector: {companyData.sector}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-gray-900">{companyData.valoracio}</span>
                  <span className="text-gray-600">({companyData.numValoracions} valoracions)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-8 space-y-8">
          {/* About us section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre nosaltres</h3>
            <p className="text-gray-700 leading-relaxed">{companyData.descripcio}</p>
          </div>

          {/* Contact info grid 2x2 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informació de contacte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-medium text-gray-900">Ubicació</p>
                  <p className="text-gray-600">{companyData.ubicacio}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">{companyData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-medium text-gray-900">Web</p>
                  <p className="text-gray-600">{companyData.web}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-medium text-gray-900">Telèfon</p>
                  <p className="text-gray-600">{companyData.telefon}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products and services */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Productes i serveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companyData.productes.map((producte, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-900 font-medium">{producte}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div className="bg-blue-50 px-8 py-4 border-t border-blue-100">
          <div className="flex items-center justify-center">
            <p className="text-blue-700 font-medium text-center">
              👁️ Així et veuen els empleats públics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}