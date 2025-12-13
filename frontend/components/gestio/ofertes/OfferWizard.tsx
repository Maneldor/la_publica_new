'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import {
    Info,
    Building2,
    Euro,
    Calendar,
    FileText,
    Send,
    Plus,
    X,
    Check,
    Star as StarIcon,
    Lock,
    Link as LinkIcon,
    Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Tipus y Dades Mock
// ============================================

const categories = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'mobilitat', label: 'Mobilitat' },
    { value: 'sostenibilitat', label: 'Sostenibilitat' },
    { value: 'formacio', label: 'Formació' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'construccio', label: 'Construcció' },
    { value: 'serveis', label: 'Serveis' },
    { value: 'subministraments', label: 'Subministraments' },
    { value: 'altres', label: 'Altres' },
]

const subcategoriesByCategory: Record<string, { value: string; label: string }[]> = {
    tecnologia: [
        { value: 'ordinadors', label: 'Ordinadors' },
        { value: 'software', label: 'Software' },
        { value: 'xarxa', label: 'Equipament de xarxa' },
        { value: 'impressores', label: 'Impressores' },
        { value: 'mobils', label: 'Mòbils i tablets' },
    ],
    mobilitat: [
        { value: 'electrics', label: 'Vehicles elèctrics' },
        { value: 'transport', label: 'Transport públic' },
        { value: 'bicicletes', label: 'Bicicletes' },
    ],
}

interface Empresa {
    id: string
    name: string
    verified: boolean
    rating: number
    reviews: number
}

const getEmpreses = (): Empresa[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('createdEmpresas')
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch (e) { console.error(e) }
    }
    return [
        { id: '1', name: 'TechSolutions BCN', verified: true, rating: 4.2, reviews: 24 },
        { id: '2', name: 'EcoServeis Catalunya', verified: true, rating: 4.9, reviews: 31 },
        { id: '3', name: 'Consultoria Puig & Associats', verified: true, rating: 4.6, reviews: 18 },
    ]
}

export interface OfertaFormData {
    id?: number | string
    // Step 1
    title: string
    description: string
    category: string
    subcategory: string

    // Step 2
    empresaId: string
    empresaName: string

    // Step 3
    isFree: boolean
    originalPrice: number
    offerPrice: number
    discountType: 'percentage' | 'fixed'

    // Step 4
    validFrom: string
    validUntil: string
    maxUsage: number
    minQuantity: number
    maxQuantity: number

    // Step 5
    includes: string[]
    instructions: string[]
    promoCode: string
    directLink: string

    // Step 6
    featured: boolean
    exclusive: boolean
    status: 'draft' | 'published'
}

export const initialOfertaData: OfertaFormData = {
    title: '',
    description: '',
    category: '',
    subcategory: '',
    empresaId: '',
    empresaName: '',
    isFree: false,
    originalPrice: 0,
    offerPrice: 0,
    discountType: 'percentage',
    validFrom: '',
    validUntil: '',
    maxUsage: 0,
    minQuantity: 1,
    maxQuantity: 10,
    includes: [],
    instructions: [],
    promoCode: '',
    directLink: '',
    featured: false,
    exclusive: false,
    status: 'draft',
}

// ============================================
// Component de llista dinàmica
// ============================================

const DynamicList = ({
    items,
    onAdd,
    onRemove,
    placeholder
}: {
    items: string[]
    onAdd: (value: string) => void
    onRemove: (index: number) => void
    placeholder: string
}) => {
    const [newItem, setNewItem] = useState('')

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim())
            setNewItem('')
        }
    }

    return (
        <div>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAdd()
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-sm text-slate-700">{item}</span>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// Pàgina Principal
// ============================================

const STEPS = [
    { label: 'Informació', description: 'Dades bàsiques', icon: Info },
    { label: 'Empresa', description: 'Qui ofereix', icon: Building2 },
    { label: 'Preus', description: 'Cost i descompte', icon: Euro },
    { label: 'Validesa', description: 'Dates i límits', icon: Calendar },
    { label: 'Contingut', description: 'Detalls extra', icon: FileText },
    { label: 'Publicació', description: 'Revisar i llançar', icon: Send },
]

interface OfferWizardProps {
    initialData?: OfertaFormData
    isEditMode?: boolean
    onSubmit: (data: OfertaFormData) => Promise<void>
}

export function OfferWizard({ initialData, isEditMode = false, onSubmit }: OfferWizardProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<OfertaFormData>(initialData || initialOfertaData)
    const [empreses, setEmpreses] = useState<Empresa[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setEmpreses(getEmpreses())
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    // Validació per pas
    const validateStep = (step: number, data: OfertaFormData): boolean => {
        switch (step) {
            case 1:
                return data.title.trim().length >= 3 &&
                    data.description.trim().length >= 10 &&
                    data.category !== ''
            case 2:
                return data.empresaId !== ''
            case 3:
                if (data.isFree) return true
                return data.originalPrice > 0 && data.offerPrice > 0 && data.offerPrice < data.originalPrice
            case 4:
                return data.validFrom !== '' && data.validUntil !== '' && new Date(data.validFrom) < new Date(data.validUntil)
            case 5:
                return true // Opcional
            case 6:
                return true // Sempre vàlid
            default:
                return false
        }
    }

    const handleNext = async () => {
        if (currentStep === STEPS.length) {
            setIsSubmitting(true)
            await onSubmit(formData)
            setIsSubmitting(false)
        } else {
            setCurrentStep(p => p + 1)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Info className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Informació Bàsica</h2>
                                <p className="text-sm text-slate-500">Dades principals de l'oferta</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Títol de l'oferta <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={formData.title}
                                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Descompte exclusiu en portàtils..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1 text-right">{formData.title.length}/100</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Descripció detallada <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        maxLength={2000}
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                        placeholder="Explica en què consisteix l'oferta..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1 text-right">{formData.description.length}/2000</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Categoria <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value, subcategory: '' }))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                        >
                                            <option value="">Selecciona categoria...</option>
                                            {categories.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Subcategoria
                                        </label>
                                        <select
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData(p => ({ ...p, subcategory: e.target.value }))}
                                            disabled={!formData.category || !subcategoriesByCategory[formData.category]}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                        >
                                            <option value="">Selecciona subcategoria...</option>
                                            {formData.category && subcategoriesByCategory[formData.category]?.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-indigo-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Empresa</h2>
                                <p className="text-sm text-slate-500">Qui ofereix</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Selecciona l'empresa responsable</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {empreses.map(emp => (
                                    <div
                                        key={emp.id}
                                        onClick={() => setFormData(p => ({ ...p, empresaId: emp.id, empresaName: emp.name }))}
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                            formData.empresaId === emp.id
                                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                : "border-slate-200 bg-white hover:border-blue-300"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900">{emp.name}</span>
                                            {emp.verified && <Check className="w-4 h-4 text-blue-500" />}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span>{emp.rating}</span>
                                            <span className="text-slate-400">({emp.reviews} valoracions)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {formData.empresaId && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Empresa seleccionada:</span>
                                    <p className="text-lg font-medium text-blue-700 mt-1">{formData.empresaName}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Euro className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Preus</h2>
                                <p className="text-sm text-slate-500">Cost i descompte</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-6">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    checked={formData.isFree}
                                    onChange={(e) => setFormData(p => ({ ...p, isFree: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isFree" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Aquesta oferta és gratuïta
                                </label>
                            </div>

                            {!formData.isFree && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Preu Original (€) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.originalPrice || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, originalPrice: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-4 py-2 pl-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="absolute left-3 top-2.5 text-slate-400">€</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Preu Oferta (€) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.offerPrice || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, offerPrice: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-4 py-2 pl-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="absolute left-3 top-2.5 text-slate-400">€</span>
                                        </div>
                                        {formData.originalPrice > 0 && formData.offerPrice >= formData.originalPrice && (
                                            <p className="text-xs text-red-500 mt-1">El preu d'oferta ha de ser inferior al preu original.</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-800 font-medium">Estalvi calculat:</span>
                                            <span className="text-2xl font-bold text-green-700">
                                                {formData.originalPrice > 0 && formData.offerPrice > 0
                                                    ? `${(formData.originalPrice - formData.offerPrice).toFixed(2)}€ (-${Math.round(((formData.originalPrice - formData.offerPrice) / formData.originalPrice) * 100)}%)`
                                                    : '0€ (0%)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Validesa</h2>
                                <p className="text-sm text-slate-500">Dates i límits</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Data d'Inici <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData(p => ({ ...p, validFrom: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Data de Finalització <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        min={formData.validFrom}
                                        onChange={(e) => setFormData(p => ({ ...p, validUntil: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Màxim d'usos totals (0 = Il·limitat)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.maxUsage}
                                        onChange={(e) => setFormData(p => ({ ...p, maxUsage: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Min per comanda</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.minQuantity}
                                            onChange={(e) => setFormData(p => ({ ...p, minQuantity: parseInt(e.target.value) || 1 }))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Max per comanda</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.maxQuantity}
                                            onChange={(e) => setFormData(p => ({ ...p, maxQuantity: parseInt(e.target.value) || 1 }))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Contingut</h2>
                                <p className="text-sm text-slate-500">Detalls extra</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Què inclou l'oferta?</label>
                                <DynamicList
                                    items={formData.includes}
                                    onAdd={(val) => setFormData(p => ({ ...p, includes: [...p.includes, val] }))}
                                    onRemove={(idx) => setFormData(p => ({ ...p, includes: p.includes.filter((_, i) => i !== idx) }))}
                                    placeholder="Ex: Enviament gratuït..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Instruccions per aprofitar</label>
                                <DynamicList
                                    items={formData.instructions}
                                    onAdd={(val) => setFormData(p => ({ ...p, instructions: [...p.instructions, val] }))}
                                    onRemove={(idx) => setFormData(p => ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }))}
                                    placeholder="Ex: Introdueix el codi al checkout..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Codi promocional</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.promoCode}
                                            onChange={(e) => setFormData(p => ({ ...p, promoCode: e.target.value }))}
                                            className="w-full px-4 py-2 pl-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                                            placeholder="CODI123"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Enllaç directe</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            value={formData.directLink}
                                            onChange={(e) => setFormData(p => ({ ...p, directLink: e.target.value }))}
                                            className="w-full px-4 py-2 pl-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 6:
                return (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Send className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Publicació</h2>
                                <p className="text-sm text-slate-500">Revisar i llançar</p>
                            </div>
                        </div>
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-lg mb-4 text-slate-900 border-b pb-2">Resum de l'Oferta</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 block">Títol</span>
                                        <span className="font-medium text-slate-900">{formData.title}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Empresa</span>
                                        <span className="font-medium text-slate-900">{formData.empresaName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Preu</span>
                                        <span className="font-medium text-slate-900">{formData.isFree ? 'Gratuït' : `${formData.offerPrice}€ (Original: ${formData.originalPrice}€)`}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Vigència</span>
                                        <span className="font-medium text-slate-900">{new Date(formData.validFrom).toLocaleDateString()} - {new Date(formData.validUntil).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <StarIcon className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <label className="font-medium text-slate-900 flex items-center gap-2">
                                            Oferta destacada
                                            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4" />
                                        </label>
                                        <p className="text-xs text-yellow-700">Apareixerà en les primeres posicions dels llistats.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <label className="font-medium text-slate-900 flex items-center gap-2">
                                            Exclusiva per a membres
                                            <input type="checkbox" checked={formData.exclusive} onChange={(e) => setFormData(p => ({ ...p, exclusive: e.target.checked }))} className="w-4 h-4" />
                                        </label>
                                        <p className="text-xs text-purple-700">Només visible per a usuaris registrats.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Estat </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                >
                                    <option value="draft">Guardar com a esborrany</option>
                                    <option value="published">Publicar immediatament</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <WizardLayout
            title={isEditMode ? "Editar Oferta" : "Nova Oferta"}
            description={`Pas ${currentStep} de ${STEPS.length}`}
            steps={STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onPrev={() => setCurrentStep(p => Math.max(1, p - 1))}
            onCancel={() => { if (confirm("Segur que vols sortir? Es perdran els canvis.")) router.push('/gestio/ofertes') }}
            canProceed={validateStep(currentStep, formData)}
            isLoading={isSubmitting}
            nextLabel="Següent"
            prevLabel="Anterior"
            finalLabel={isEditMode ? "Guardar Canvis" : "Crear Oferta"}
        >
            {renderStep()}
        </WizardLayout>
    )
}
