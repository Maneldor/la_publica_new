'use client'

import { ReactNode } from 'react';
import { OfferFormData } from './types';

// Icons for StepCompany
import { Check, Star } from 'lucide-react';

interface StepProps {
    formData: OfferFormData;
    onChange: (data: OfferFormData) => void;
    categories?: any[]; // We can refine this type later
    empreses?: any[]; // For StepCompany
}

// Step 0: Selecció d'Empresa (Només Gestió/Admin)
export function StepCompanySelection({ formData, onChange, empreses = [] }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl">
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Selecciona l'empresa responsable</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Aquesta oferta es crearà en nom de l'empresa seleccionada.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {empreses.map((emp: any) => (
                            <div
                                key={emp.id}
                                onClick={() => onChange({ ...formData, companyId: emp.id, companyName: emp.name })}
                                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md
                  ${formData.companyId === emp.id
                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                        : "border-slate-200 bg-white hover:border-blue-300"
                                    }
                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-slate-900">{emp.name}</span>
                                    {emp.verified && <Check className="w-4 h-4 text-blue-500" />}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span>{emp.rating}</span>
                                    <span className="text-slate-400">({emp.reviews} valoracions)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {formData.companyId && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Empresa seleccionada:</span>
                            <p className="text-lg font-medium text-blue-700 mt-1">{formData.companyName}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Step 1: Información Básica
export function Step1Info({ formData, onChange, categories }: StepProps) {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Títol de l'oferta *
                </label>
                <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => onChange({ ...formData, title: e.target.value })}
                    placeholder="Ex: 20% de descompte en tots els menús"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                </label>
                <select
                    value={formData.categoryId || ''}
                    onChange={(e) => onChange({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                >
                    <option value="">Selecciona una categoria</option>
                    {safeCategories.map((cat: any) => (
                        <option key={cat.id || cat.value} value={cat.id || cat.value}>
                            {cat.name || cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripció curta
                </label>
                <input
                    type="text"
                    value={formData.shortDescription || ''}
                    onChange={(e) => onChange({ ...formData, shortDescription: e.target.value })}
                    placeholder="Resum breu de l'oferta"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {formData.shortDescription?.length || 0}/100 caràcters
                </p>
            </div>
        </div>
    );
}

// Step 2: Tipus de Redempció
export function Step2RedemptionType({ formData, onChange }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Tipus de redempció</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Selecciona com els usuaris podran accedir a la teva oferta
                </p>
            </div>

            {/* Grid de opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* CUPÓN QR - Por defecto */}
                <button
                    type="button"
                    onClick={() => onChange({ ...formData, redemptionType: 'COUPON' })}
                    className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${formData.redemptionType === 'COUPON'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Cupó amb QR</h4>
                            <p className="text-sm text-gray-600">
                                L'usuari genera un cupó amb codi QR que pot utilitzar a la teva botiga física o online
                            </p>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    Recomanat
                                </span>
                            </div>
                        </div>
                    </div>
                </button>

                {/* ONLINE - Redirect externo */}
                <button
                    type="button"
                    onClick={() => onChange({ ...formData, redemptionType: 'ONLINE' })}
                    className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${formData.redemptionType === 'ONLINE'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Enllaç extern</h4>
                            <p className="text-sm text-gray-600">
                                Redirigeix directament al teu web amb el descompte aplicat automàticament
                            </p>
                        </div>
                    </div>
                </button>

                {/* VIP_ACCOUNT - Monedero */}
                <button
                    type="button"
                    onClick={() => onChange({ ...formData, redemptionType: 'VIP_ACCOUNT' })}
                    className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${formData.redemptionType === 'VIP_ACCOUNT'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Moneder digital</h4>
                            <p className="text-sm text-gray-600">
                                El descompte s'afegeix al moneder de l'usuari per utilitzar-lo quan vulgui
                            </p>
                        </div>
                    </div>
                </button>

                {/* CONTACT_FORM - Lead generation */}
                <button
                    type="button"
                    onClick={() => onChange({ ...formData, redemptionType: 'CONTACT_FORM' })}
                    className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${formData.redemptionType === 'CONTACT_FORM'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Formulari de contacte</h4>
                            <p className="text-sm text-gray-600">
                                Els usuaris omplen un formulari i tu els contactes directament per tancar la venda
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Campo condicional: URL externa para tipo ONLINE */}
            {formData.redemptionType === 'ONLINE' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la teva pàgina d'oferta *
                    </label>
                    <input
                        type="url"
                        value={formData.externalUrl || ''}
                        onChange={(e) => onChange({ ...formData, externalUrl: e.target.value })}
                        placeholder="https://www.exemple.cat/oferta-especial"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                    <p className="mt-2 text-xs text-gray-600">
                        Els usuaris seran redirigits a aquesta URL amb paràmetres de seguiment automàtics
                    </p>
                </div>
            )}

            {/* Información adicional según tipo */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-gray-700">
                        {formData.redemptionType === 'COUPON' && (
                            <p>Els usuaris podran generar un cupó únic amb codi QR per utilitzar a la teva botiga o web.</p>
                        )}
                        {formData.redemptionType === 'ONLINE' && (
                            <p>Quan l'usuari faci clic a "Aprofitar oferta", serà redirigit directament al teu web amb el descompte aplicat.</p>
                        )}
                        {formData.redemptionType === 'VIP_ACCOUNT' && (
                            <p>El valor del descompte s'afegirà automàticament al moneder digital de l'usuari per utilitzar-lo quan vulgui.</p>
                        )}
                        {formData.redemptionType === 'CONTACT_FORM' && (
                            <p>Rebràs les dades de contacte dels usuaris interessats i podràs gestionar les sol·licituds des del teu panel.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 3: Preus
export function Step3Preus({ formData, onChange }: StepProps) {
    const calculateDiscount = () => {
        const original = parseFloat(formData.originalPrice as string) || 0;
        const final = parseFloat(formData.price as string) || 0;
        if (original > 0 && final > 0 && original > final) {
            const discount = ((original - final) / original * 100).toFixed(0);
            onChange({ ...formData, discountPercentage: discount });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preu original (€)
                    </label>
                    <input
                        type="number"
                        value={formData.originalPrice || ''}
                        onChange={(e) => {
                            onChange({ ...formData, originalPrice: e.target.value });
                            setTimeout(calculateDiscount, 100);
                        }}
                        placeholder="50.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preu final (€)
                    </label>
                    <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => {
                            onChange({ ...formData, price: e.target.value });
                            setTimeout(calculateDiscount, 100);
                        }}
                        placeholder="40.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {formData.discountPercentage && parseFloat(formData.discountPercentage as string) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-800">
                        Descompte del {formData.discountPercentage}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        Els clients estalviaran {((parseFloat(formData.originalPrice as string || '0') - parseFloat(formData.price as string || '0')).toFixed(2))}€
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipus de preu
                </label>
                <select
                    value={formData.priceType || 'FIXED'}
                    onChange={(e) => onChange({ ...formData, priceType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="FIXED">Preu fix</option>
                    <option value="PER_PERSON">Per persona</option>
                    <option value="PER_HOUR">Per hora</option>
                    <option value="PER_DAY">Per dia</option>
                    <option value="PER_MONTH">Per mes</option>
                    <option value="ON_REQUEST">Sota consulta</option>
                </select>
            </div>
        </div>
    );
}

// Step 4: Dates
export function Step4Dates({ formData, onChange }: StepProps) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de publicació
                </label>
                <input
                    type="date"
                    value={formData.publishedAt || today}
                    onChange={(e) => onChange({ ...formData, publishedAt: e.target.value })}
                    min={today}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Data en què l'oferta serà visible (si està aprovada)
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de caducitat
                </label>
                <input
                    type="date"
                    value={formData.expiresAt || ''}
                    onChange={(e) => onChange({ ...formData, expiresAt: e.target.value })}
                    min={today}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Deixa-ho buit si no té data de caducitat
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durada de l'oferta
                </label>
                <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => onChange({ ...formData, duration: e.target.value })}
                    placeholder="Ex: Vàlid tot el mes de desembre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
}

// Step 5: Imatges
export function Step5Imatges({ formData, onChange }: StepProps) {
    const addImage = (url: string) => {
        const currentImages = formData.images || [];
        if (url && !currentImages.includes(url)) {
            onChange({ ...formData, images: [...currentImages, url] });
        }
    };

    const removeImage = (index: number) => {
        const currentImages = formData.images || [];
        onChange({
            ...formData,
            images: currentImages.filter((_: any, i: number) => i !== index)
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la imatge
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        id="imageUrl"
                        placeholder="https://exemple.com/imatge.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const input = document.getElementById('imageUrl') as HTMLInputElement;
                            if (input.value) {
                                addImage(input.value);
                                input.value = '';
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Afegir
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Pots afegir múltiples imatges de l'oferta
                </p>
            </div>

            {formData.images?.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Imatges afegides:</p>
                    <div className="grid grid-cols-2 gap-4">
                        {formData.images.map((url: string, index: number) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`Imatge ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                                {index === 0 && (
                                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        Principal
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Step 6: Contingut (descripción detallada)
export function Step6Contingut({ formData, onChange }: StepProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripció detallada *
                </label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => onChange({ ...formData, description: e.target.value })}
                    rows={8}
                    placeholder="Descriu els detalls de l'oferta, què inclou, beneficis per als empleats públics..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    {formData.description?.length || 0}/2000 caràcters
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficis destacats
                </label>
                <textarea
                    value={formData.benefits || ''}
                    onChange={(e) => onChange({ ...formData, benefits: e.target.value })}
                    rows={4}
                    placeholder="• Estalvi del 20% en tots els productes\n• Enviament gratuït\n• Atenció preferent"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
}

// Step 7: Condicions
export function Step7Condicions({ formData, onChange }: StepProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisits per accedir a l'oferta
                </label>
                <textarea
                    value={formData.requirements || ''}
                    onChange={(e) => onChange({ ...formData, requirements: e.target.value })}
                    rows={4}
                    placeholder="Ex: Presentar carnet d'empleat públic vàlid..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condicions i restriccions
                </label>
                <textarea
                    value={formData.conditions || ''}
                    onChange={(e) => onChange({ ...formData, conditions: e.target.value })}
                    rows={4}
                    placeholder="Ex: No acumulable amb altres ofertes. Vàlid de dilluns a dijous..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes internes (només visible per admins)
                </label>
                <textarea
                    value={formData.internalNotes || ''}
                    onChange={(e) => onChange({ ...formData, internalNotes: e.target.value })}
                    rows={3}
                    placeholder="Notes privades sobre l'oferta..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
}

// Step 8: Contacte i Ubicació
export function Step8Contacte({ formData, onChange }: StepProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mètode de contacte preferit
                </label>
                <select
                    value={formData.contactMethod || 'EMAIL'}
                    onChange={(e) => onChange({ ...formData, contactMethod: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="EMAIL">Correu electrònic</option>
                    <option value="PHONE">Telèfon</option>
                    <option value="FORM">Formulari web</option>
                    <option value="WEBSITE">Lloc web</option>
                </select>
            </div>

            {formData.contactMethod === 'EMAIL' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contacte
                    </label>
                    <input
                        type="email"
                        value={formData.contactEmail || ''}
                        onChange={(e) => onChange({ ...formData, contactEmail: e.target.value })}
                        placeholder="ofertes@empresa.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}

            {formData.contactMethod === 'PHONE' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telèfon de contacte
                    </label>
                    <input
                        type="tel"
                        value={formData.contactPhone || ''}
                        onChange={(e) => onChange({ ...formData, contactPhone: e.target.value })}
                        placeholder="+34 900 000 000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enllaç extern (opcional)
                </label>
                <input
                    type="url"
                    value={formData.externalUrl || ''}
                    onChange={(e) => onChange({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://www.empresa.com/ofertes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicació
                </label>
                <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => onChange({ ...formData, location: e.target.value })}
                    placeholder="Barcelona, Catalunya"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="remote"
                    checked={formData.remote || false}
                    onChange={(e) => onChange({ ...formData, remote: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remote" className="text-sm font-medium text-gray-700">
                    Oferta disponible online / remot
                </label>
            </div>
        </div>
    );
}

// Step 9: Revisió i Publicació
export function Step9Publicacio({ formData, onChange }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Estat de l'oferta</h3>
                <div className="space-y-2 text-sm text-blue-700">
                    <p>• <strong>Guardar Esborrany:</strong> Desar per continuar més tard</p>
                    <p>• <strong>Enviar a Revisió:</strong> L'administrador revisarà i aprovarà</p>
                    <p>• <strong>Publicar:</strong> Fer visible immediatament (si tens permisos)</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured || false}
                        onChange={(e) => onChange({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                        <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                            Destacar aquesta oferta
                        </label>
                        <p className="text-xs text-gray-500">Apareixerà en posicions prioritàries</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioritat (0-100)
                    </label>
                    <input
                        type="number"
                        value={formData.priority || 0}
                        onChange={(e) => onChange({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Ofertes amb major prioritat apareixen primer
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etiquetes (separades per comes)
                    </label>
                    <input
                        type="text"
                        value={formData.tags?.join(', ') || ''}
                        onChange={(e) => onChange({
                            ...formData,
                            tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean)
                        })}
                        placeholder="restaurants, descompte, barcelona"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Resum de l'oferta</h4>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Títol:</dt>
                        <dd className="font-medium text-gray-900">{formData.title || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Categoria:</dt>
                        <dd className="font-medium text-gray-900">{formData.categoryId || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Tipus redempció:</dt>
                        <dd className="font-medium text-gray-900">
                            {formData.redemptionType === 'COUPON' &&
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Cupó QR
                                </span>
                            }
                            {formData.redemptionType === 'ONLINE' &&
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    Enllaç extern
                                </span>
                            }
                            {formData.redemptionType === 'VIP_ACCOUNT' &&
                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    Moneder digital
                                </span>
                            }
                            {formData.redemptionType === 'CONTACT_FORM' &&
                                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                    Formulari contacte
                                </span>
                            }
                        </dd>
                    </div>
                    {formData.redemptionType === 'ONLINE' && formData.externalUrl && (
                        <div className="flex justify-between">
                            <dt className="text-gray-600">URL externa:</dt>
                            <dd className="font-medium text-gray-900 break-all">
                                <a href={formData.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {formData.externalUrl}
                                </a>
                            </dd>
                        </div>
                    )}
                    {formData.discountPercentage && (
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Descompte:</dt>
                            <dd className="font-medium text-green-600">{formData.discountPercentage}%</dd>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Preu final:</dt>
                        <dd className="font-medium text-gray-900">
                            {formData.price ? `€${formData.price}` : '-'}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Caduca:</dt>
                        <dd className="font-medium text-gray-900">
                            {formData.expiresAt || 'Sense caducitat'}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-600">Imatges:</dt>
                        <dd className="font-medium text-gray-900">
                            {formData.images?.length || 0}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
