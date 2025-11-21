'use client';

import { useState } from 'react';

interface PlanCardProps {
  plan: {
    id: string;
    slug?: string;
    tier: string;
    name: string;
    nameEs?: string;
    nameEn?: string;
    basePrice: number;
    firstYearDiscount: number;
    maxActiveOffers: number;
    maxTeamMembers: number;
    maxFeaturedOffers: number;
    maxStorage: number;
    badge?: string;
    badgeColor?: string;
    destacado?: boolean;
    color?: string;
    icono?: string;
    funcionalidades?: string;
    isActive?: boolean;
    isVisible?: boolean;
  };

  // Props de control
  isAdminView?: boolean;     // Si es vista admin (muestra botones extra)
  isCurrentPlan?: boolean;   // Si es el plan actual del usuario

  // Callbacks (solo admin)
  onEdit?: (plan: any) => void;
  onToggleActive?: (plan: any) => void;

  // Callbacks (solo empresa)
  onSelectPlan?: (plan: any) => void;
}

export default function PlanCard({
  plan,
  isAdminView = false,
  isCurrentPlan = false,
  onEdit,
  onToggleActive,
  onSelectPlan
}: PlanCardProps) {

  // Calcular precio con descuento (igual que admin)
  // firstYearDiscount viene como porcentaje (ej: 50), hay que convertir a decimal (0.5)
  const discountDecimal = plan.firstYearDiscount / 100;
  const firstYearPrice = plan.basePrice * (1 - discountDecimal);

  // Parsear funcionalidades (igual que admin)
  const funcionalitats = plan.funcionalidades
    ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0)
    : [];

  // Renderizar límites con formato correcto (igual que admin)
  const renderLimit = (value: number | null | undefined, unit: string = '') => {
    if (value === null || value === undefined || value === -1) {
      return 'Il·limitades';
    }
    if (typeof value === 'number') {
      return `${value}${unit}`;
    }
    return 'Il·limitades';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-shadow flex flex-col h-full ${
        plan.destacado ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      } ${isCurrentPlan ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : ''}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {plan.icono && <span className="text-2xl">{plan.icono}</span>}
            <h3 className="text-xl font-bold text-gray-900">
              {plan.name}
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            {plan.destacado && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {plan.badge || 'RECOMANAT'}
              </span>
            )}
            {isCurrentPlan && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                PLA ACTUAL
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Precio */}
      <div className="px-5 py-4 bg-gray-50">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-gray-900">
            {firstYearPrice === 0 ? 'GRATIS' : `${firstYearPrice.toFixed(0)}€`}
          </span>
          {firstYearPrice > 0 && <span className="text-gray-500">/any</span>}
        </div>
        {plan.firstYearDiscount > 0 && plan.basePrice > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {plan.basePrice}€
            </span>
            <span className="text-xs font-medium text-green-600">
              50% 1r any (per a noves empreses)
            </span>
          </div>
        )}
      </div>

      {/* Límites */}
      <div className="px-5 py-4 space-y-2 border-b border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ofertes actives</span>
          <span className="font-semibold text-gray-900">
            {renderLimit(plan.maxActiveOffers)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Membres equip</span>
          <span className="font-semibold text-gray-900">
            {renderLimit(plan.maxTeamMembers)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ofertes destacades</span>
          <span className="font-semibold text-gray-900">
            {renderLimit(plan.maxFeaturedOffers)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Emmagatzematge</span>
          <span className="font-semibold text-gray-900">
            {plan.maxStorage === -1 || plan.maxStorage === null ? 'Il·limitat' : `${plan.maxStorage} GB`}
          </span>
        </div>
      </div>

      {/* Funcionalidades - flex-grow para ocupar espacio disponible */}
      <div className="px-5 py-4 flex-grow">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Funcionalitats</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {funcionalitats.map((func, idx) => (
            <li key={idx} className={func.startsWith('Tot') ? 'font-semibold text-gray-900 mt-2' : ''}>
              {func.startsWith('Tot') ? func : `• ${func}`}
            </li>
          ))}
        </ul>
      </div>

      {/* Toggle Activo/Inactivo - SOLO ADMIN */}
      {isAdminView && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {plan.isActive ? 'Actiu' : 'Inactiu'}
          </span>
          <button
            onClick={() => onToggleActive?.(plan)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              plan.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                plan.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Botón Editar - SOLO ADMIN */}
      {isAdminView && (
        <div className="px-5 py-3 bg-white border-t border-gray-100">
          <button
            onClick={() => onEdit?.(plan)}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Editar
          </button>
        </div>
      )}

      {/* Plan Actual - SOLO EMPRESA (si es plan actual) */}
      {!isAdminView && isCurrentPlan && (
        <div className="px-5 py-3 bg-indigo-50 border-t border-indigo-100">
          <div className="text-center text-sm font-medium text-indigo-700">
            ✓ Pla Actual
          </div>
        </div>
      )}

      {/* Botón Cambiar Plan - SOLO EMPRESA (no es plan actual) */}
      {!isAdminView && !isCurrentPlan && (
        <div className="px-5 py-3 bg-white border-t border-gray-100">
          <button
            onClick={() => onSelectPlan?.(plan)}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Canviar a {plan.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}