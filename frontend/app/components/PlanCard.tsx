'use client';

import { useState } from 'react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    tier: string;
    slug: string;
    basePrice: number;
    precioMensual: number;
    precioAnual: number;
    firstYearDiscount: number;
    funcionalidades: string;
    maxActiveOffers: number;
    maxTeamMembers: number;
    maxFeaturedOffers: number;
    maxStorage: number;
    destacado?: boolean;
  };
  isCurrentPlan?: boolean;
  onUpgrade?: (planId: string) => void;
  showActions?: boolean;
}

export default function PlanCard({ plan, isCurrentPlan = false, onUpgrade, showActions = true }: PlanCardProps) {
  const firstYearPrice = plan.basePrice * (1 - plan.firstYearDiscount);

  const funcionalitats = plan.funcionalidades
    ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0)
    : [];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-shadow flex flex-col h-full ${
        plan.destacado ? 'border-blue-500 ring-2 ring-blue-200' :
        isCurrentPlan ? 'border-green-500 ring-2 ring-green-200' :
        'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {plan.name}
          </h3>
          <div className="flex flex-col gap-1">
            {plan.destacado && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                RECOMANAT
              </span>
            )}
            {isCurrentPlan && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
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
            {firstYearPrice.toFixed(0)}€
          </span>
          <span className="text-gray-500">/any</span>
        </div>
        {plan.firstYearDiscount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {plan.basePrice}€
            </span>
            <span className="text-xs font-medium text-green-600">
              {(plan.firstYearDiscount * 100).toFixed(0)}% descompte 1r any
            </span>
          </div>
        )}
      </div>

      {/* Límites */}
      <div className="px-5 py-4 space-y-2 border-b border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ofertes actives</span>
          <span className="font-semibold text-gray-900">
            {plan.maxActiveOffers === -1 ? 'Il·limitades' : plan.maxActiveOffers}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Membres equip</span>
          <span className="font-semibold text-gray-900">
            {plan.maxTeamMembers === -1 ? 'Il·limitats' : plan.maxTeamMembers}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ofertes destacades</span>
          <span className="font-semibold text-gray-900">
            {plan.maxFeaturedOffers === -1 ? 'Il·limitades' : plan.maxFeaturedOffers}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Emmagatzematge</span>
          <span className="font-semibold text-gray-900">
            {plan.maxStorage === -1 ? 'Il·limitat' : `${plan.maxStorage} GB`}
          </span>
        </div>
      </div>

      {/* Funcionalidades - flex-grow para ocupar espacio */}
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

      {/* Botón - mt-auto para pegar al fondo */}
      {showActions && (
        <div className="px-5 py-3 bg-white border-t border-gray-100 mt-auto">
          {isCurrentPlan ? (
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded cursor-not-allowed"
            >
              Pla actual
            </button>
          ) : (
            <button
              onClick={() => onUpgrade && onUpgrade(plan.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Actualitzar a aquest pla
            </button>
          )}
        </div>
      )}
    </div>
  );
}