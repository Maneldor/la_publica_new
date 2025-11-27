'use client';

import React, { useState, useEffect } from 'react';
import { QrCodeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

interface CouponValidationResult {
  success: boolean;
  message: string;
  coupon?: {
    id: string;
    code: string;
    generatedAt: string;
    expiresAt: string;
    user: {
      name: string;
      email: string;
    };
    offer: {
      id: string;
      title: string;
      originalPrice: number;
      offerPrice: number;
      discountAmount: number;
      discountPercentage: number;
      currency: string;
    };
  };
  suggestedRedemption?: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    currency: string;
    redemptionType: string;
    location: string;
    validatedBy: string;
  };
}

interface RedemptionResult {
  success: boolean;
  message: string;
  redemption?: {
    id: string;
    couponCode: string;
    redeemedAt: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    currency: string;
    location: string;
    receiptNumber?: string;
    user: {
      name: string;
      email: string;
    };
    offer: {
      id: string;
      title: string;
    };
  };
}

export default function ValidacionCuponesPage() {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<RedemptionResult | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [customPrices, setCustomPrices] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [finalPrice, setFinalPrice] = useState<number | ''>('');

  // Resetear estados cuando cambie el código
  useEffect(() => {
    setValidationResult(null);
    setRedemptionResult(null);
  }, [couponCode]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/empresa/cupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          notes
        })
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.success && result.suggestedRedemption) {
        setOriginalPrice(result.suggestedRedemption.originalPrice);
        setFinalPrice(result.suggestedRedemption.finalPrice);
      }
    } catch (error) {
      console.error('Error validando cupón:', error);
      setValidationResult({
        success: false,
        message: 'Error de conexión al validar el cupón'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const redeemCoupon = async () => {
    if (!validationResult?.success || !validationResult.coupon) return;

    setIsRedeeming(true);
    try {
      const discountAmount = customPrices && typeof originalPrice === 'number' && typeof finalPrice === 'number'
        ? originalPrice - finalPrice
        : validationResult.suggestedRedemption?.discountAmount || 0;

      const response = await fetch('/api/empresa/cupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponId: validationResult.coupon.id,
          originalPrice: customPrices ? originalPrice : validationResult.suggestedRedemption?.originalPrice,
          discountAmount,
          finalPrice: customPrices ? finalPrice : validationResult.suggestedRedemption?.finalPrice,
          redemptionType: 'in_store',
          receiptNumber: receiptNumber || undefined,
          notes
        })
      });

      const result = await response.json();
      setRedemptionResult(result);

      if (result.success) {
        // Limpiar formulario después del éxito
        setCouponCode('');
        setReceiptNumber('');
        setNotes('');
        setCustomPrices(false);
        setOriginalPrice('');
        setFinalPrice('');
        setValidationResult(null);
      }
    } catch (error) {
      console.error('Error canjeando cupón:', error);
      setRedemptionResult({
        success: false,
        message: 'Error de conexión al canjear el cupón'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <QrCodeIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Validació de Cupons
            </h1>
            <p className="text-gray-600">
              Escaneja o introdueix el codi del cupó per validar-lo i canjear-lo
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de validación */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
              Codi del Cupó
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Introdueix o escaneja el codi..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                disabled={isValidating}
              />
              <button
                onClick={validateCoupon}
                disabled={!couponCode.trim() || isValidating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validant...' : 'Validar'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes adicionals..."
            />
          </div>
        </div>
      </div>

      {/* Resultado de validación */}
      {validationResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {validationResult.success ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-600" />
              )}
              <div className={`text-lg font-medium ${
                validationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.message}
              </div>
            </div>

            {validationResult.success && validationResult.coupon && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalls del Cupó</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Client:</span>
                      <p className="text-gray-900">{validationResult.coupon.user.name}</p>
                      <p className="text-sm text-gray-600">{validationResult.coupon.user.email}</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Oferta:</span>
                      <p className="text-gray-900">{validationResult.coupon.offer.title}</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Codi:</span>
                      <p className="text-gray-900 font-mono">{validationResult.coupon.code}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CurrencyEuroIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-500">Descompte:</span>
                        <p className="text-lg font-semibold text-green-600">
                          -{validationResult.coupon.offer.discountAmount}€ ({validationResult.coupon.offer.discountPercentage}%)
                        </p>
                        <p className="text-sm text-gray-600">
                          De {validationResult.coupon.offer.originalPrice}€ a {validationResult.coupon.offer.offerPrice}€
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-500">Caduca:</span>
                        <p className="text-gray-900">
                          {new Date(validationResult.coupon.expiresAt).toLocaleDateString('ca-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precios personalizados */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="customPrices"
                      checked={customPrices}
                      onChange={(e) => setCustomPrices(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="customPrices" className="text-sm font-medium text-gray-700">
                      Personalitzar preus de la transacció
                    </label>
                  </div>

                  {customPrices && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preu original
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                            step="0.01"
                            min="0"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-400">€</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preu final
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value ? parseFloat(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                            step="0.01"
                            min="0"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-400">€</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo de número de ticket */}
                <div className="border-t pt-4 mt-6">
                  <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Ticket/Factura (opcional)
                  </label>
                  <input
                    type="text"
                    id="receiptNumber"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="T12345..."
                  />
                </div>

                {/* Botón de canje */}
                <div className="border-t pt-4 mt-6">
                  <button
                    onClick={redeemCoupon}
                    disabled={isRedeeming}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedeeming ? 'Canviant cupó...' : 'Confirmar Canje del Cupó'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resultado de canje */}
      {redemptionResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3">
            {redemptionResult.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600" />
            )}
            <div className={`text-lg font-medium ${
              redemptionResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {redemptionResult.message}
            </div>
          </div>

          {redemptionResult.success && redemptionResult.redemption && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Cupó canviat correctament</h4>
              <div className="text-sm text-green-700">
                <p>Codi: <span className="font-mono">{redemptionResult.redemption.couponCode}</span></p>
                <p>Client: {redemptionResult.redemption.user.name}</p>
                <p>Oferta: {redemptionResult.redemption.offer.title}</p>
                <p>Import final: {redemptionResult.redemption.finalPrice}€</p>
                {redemptionResult.redemption.receiptNumber && (
                  <p>Ticket: {redemptionResult.redemption.receiptNumber}</p>
                )}
                <p>Data: {new Date(redemptionResult.redemption.redeemedAt).toLocaleString('ca-ES')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}