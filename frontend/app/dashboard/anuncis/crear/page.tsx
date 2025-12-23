'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Euro,
  MapPin,
  Package,
  Lightbulb,
  Check,
  Send,
  Loader2,
  Save,
  Image as ImageIcon,
  AlertCircle,
  Tag,
  ShoppingBag,
  Search,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useCreateAnuncio } from '@/hooks/useAnuncios'
import { toast } from 'sonner'

// Types
interface ImageFile {
  file: File
  preview: string
}

interface FormData {
  adType: 'oferta' | 'demanda'
  title: string
  description: string
  category: string
  condition: string
  priceType: 'fixed' | 'negotiable' | 'free'
  price: string
  province: string
  city: string
}

// Categories
const CATEGORIES = [
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'immobiliaria', label: 'Immobiliària' },
  { value: 'electronica', label: 'Electrònica' },
  { value: 'informatica', label: 'Informàtica' },
  { value: 'mobil', label: 'Mòbils i telefonia' },
  { value: 'llar', label: 'Llar i jardí' },
  { value: 'moda', label: 'Moda i accessoris' },
  { value: 'esports', label: 'Esports i oci' },
  { value: 'serveis', label: 'Serveis' },
  { value: 'altres', label: 'Altres' },
]

// Conditions
const CONDITIONS = [
  { value: 'new', label: 'Nou (sense estrenar)' },
  { value: 'like_new', label: 'Com nou (poc ús)' },
  { value: 'good', label: 'Bon estat' },
  { value: 'fair', label: 'Acceptable (ús visible)' },
]

// Provinces
const PROVINCES = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'girona', label: 'Girona' },
  { value: 'lleida', label: 'Lleida' },
  { value: 'tarragona', label: 'Tarragona' },
]

// Tips
const TIPS = [
  'Afegeix fotos clares i ben il·luminades',
  'Escriu un títol descriptiu i concís',
  'Detalla l\'estat real del producte',
  'Fixa un preu competitiu',
  'Respon ràpid als interessats',
]

export default function CrearAnunciPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createAnuncioMutation = useCreateAnuncio()

  // Form state
  const [images, setImages] = useState<ImageFile[]>([])
  const [formData, setFormData] = useState<FormData>({
    adType: 'oferta',
    title: '',
    description: '',
    category: '',
    condition: '',
    priceType: 'fixed',
    price: '',
    province: '',
    city: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Image handling
  const MAX_IMAGES = 10
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: ImageFile[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= MAX_IMAGES) {
        errors.push(`Màxim ${MAX_IMAGES} imatges permeses`)
        return
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: format no vàlid (JPG, PNG, WebP)`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: massa gran (màx 5MB)`)
        return
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      })
    })

    if (errors.length > 0) {
      toast.error(errors.join('\n'))
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [images.length])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const moveImage = useCallback((index: number, direction: 'left' | 'right') => {
    setImages((prev) => {
      const newImages = [...prev]
      const newIndex = direction === 'left' ? index - 1 : index + 1

      if (newIndex < 0 || newIndex >= newImages.length) return prev

      const temp = newImages[index]
      newImages[index] = newImages[newIndex]
      newImages[newIndex] = temp

      return newImages
    })
  }, [])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El títol és obligatori'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Mínim 10 caràcters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripció és obligatòria'
    } else if (formData.description.length < 30) {
      newErrors.description = 'Mínim 30 caràcters'
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoria'
    }

    if (!formData.condition) {
      newErrors.condition = 'Selecciona l\'estat'
    }

    if (formData.priceType !== 'free' && !formData.price) {
      newErrors.price = 'Introdueix un preu'
    }

    if (!formData.province) {
      newErrors.province = 'Selecciona la província'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Introdueix la ciutat'
    }

    if (images.length === 0) {
      newErrors.images = 'Afegeix almenys una imatge'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, images.length])

  // Check if form is valid for button state
  const isFormValid = useMemo(() => {
    return (
      formData.title.trim().length >= 10 &&
      formData.description.trim().length >= 30 &&
      formData.category &&
      formData.condition &&
      (formData.priceType === 'free' || formData.price) &&
      formData.province &&
      formData.city.trim() &&
      images.length > 0
    )
  }, [formData, images.length])

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', 'anunci')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al pujar la imatge')
    }

    const result = await response.json()
    return result.url
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Si us plau, revisa els errors del formulari')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images first and get URLs
      toast.info('Pujant imatges...')
      const uploadPromises = images.map((img) => uploadImage(img.file))
      const imageUrls = await Promise.all(uploadPromises)

      const price = formData.priceType === 'free' ? 0 : parseFloat(formData.price) || 0

      const marketplaceData = {
        category: formData.category,
        adType: formData.adType,
        price: price,
        priceType: formData.priceType,
        condition: formData.condition,
        location: {
          province: formData.province,
          city: formData.city,
        },
        coverImage: imageUrls[0],
        galleryImages: imageUrls.slice(1),
        images: imageUrls,
        mainImageIndex: 0,
      }

      const apiData = {
        title: formData.title,
        content: formData.description,
        type: (formData.adType === 'oferta' ? 'general' : 'urgent') as 'general' | 'urgent',
        priority: 5,
        status: 'draft' as const,
        audience: 'all' as const,
        targetCommunities: [],
        targetRoles: [],
        sendNotification: false,
        notificationChannels: [] as ('platform' | 'email' | 'sms' | 'push' | 'all_channels')[],
        tags: [] as string[],
        isSticky: false,
        allowComments: true,
        imageUrl: imageUrls[0],
        authorId: session?.user?.id || '',
        metadata: marketplaceData,
      }

      createAnuncioMutation.mutate(apiData, {
        onSuccess: () => {
          toast.success('Anunci enviat per revisió!')
          router.push('/dashboard/anuncis')
        },
        onError: (error: any) => {
          toast.error(error.message || 'Error al publicar l\'anunci')
          setIsSubmitting(false)
        },
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al processar les imatges')
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    toast.info('Esborrany guardat localment')
    // TODO: Implement local storage save
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/anuncis"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nou Anunci</h1>
            <p className="text-gray-500">Publica un article per vendre o intercanviar</p>
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ad Type Card - FIRST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-5 h-5" />
                Tipus d'anunci
              </CardTitle>
              <p className="text-sm text-gray-500">
                Selecciona si vols oferir o buscar un producte/servei
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Oferta */}
                <button
                  type="button"
                  onClick={() => updateField('adType', 'oferta')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.adType === 'oferta'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.adType === 'oferta' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <ShoppingBag className={`w-6 h-6 ${
                      formData.adType === 'oferta' ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Oferta</p>
                    <p className="text-xs text-gray-500 mt-1">Vull vendre o oferir</p>
                  </div>
                </button>

                {/* Demanda */}
                <button
                  type="button"
                  onClick={() => updateField('adType', 'demanda')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.adType === 'demanda'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.adType === 'demanda' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Search className={`w-6 h-6 ${
                      formData.adType === 'demanda' ? 'text-amber-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Demanda</p>
                    <p className="text-xs text-gray-500 mt-1">Estic buscant</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Images Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="w-5 h-5" />
                Imatges
              </CardTitle>
              <p className="text-sm text-gray-500">
                Afegeix fins a 10 imatges. La primera serà la principal.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Uploaded images */}
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 group"
                  >
                    <Image
                      src={image.preview}
                      alt={`Imatge ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, 'left')}
                          className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="Moure a l'esquerra"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(index)}
                        className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                        title="Eliminar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index < images.length - 1 && (
                        <button
                          onClick={() => moveImage(index, 'right')}
                          className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="Moure a la dreta"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* Principal badge */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {/* Add image button */}
                {images.length < MAX_IMAGES && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">Afegir foto</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Error */}
              {errors.images && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.images}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" />
                Informació bàsica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Títol de l'anunci *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ex: iPhone 14 Pro Max 256GB"
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title ? (
                    <span className="text-xs text-red-600">{errors.title}</span>
                  ) : formData.title.length < 10 ? (
                    <span className="text-xs text-gray-400">Mínim 10 caràcters</span>
                  ) : (
                    <span className="text-xs text-green-600">Títol vàlid</span>
                  )}
                  <span className={`text-xs ml-auto ${formData.title.length < 10 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descriu l'article amb detall: característiques, estat, motiu de venda..."
                  rows={5}
                  maxLength={2000}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 ${
                    errors.description ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <span className="text-xs text-red-600">{errors.description}</span>
                  ) : formData.description.length < 30 ? (
                    <span className="text-xs text-gray-400">Mínim 30 caràcters</span>
                  ) : (
                    <span className="text-xs text-green-600">Descripció vàlida</span>
                  )}
                  <span className={`text-xs ml-auto ${formData.description.length < 30 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 ${
                      errors.category ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecciona una categoria</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.category}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estat del producte *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => updateField('condition', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 ${
                      errors.condition ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecciona l'estat</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.condition}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Euro className="w-5 h-5" />
                Preu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price type */}
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value="fixed"
                    checked={formData.priceType === 'fixed'}
                    onChange={() => updateField('priceType', 'fixed')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Preu fix</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value="negotiable"
                    checked={formData.priceType === 'negotiable'}
                    onChange={() => updateField('priceType', 'negotiable')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Negociable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value="free"
                    checked={formData.priceType === 'free'}
                    onChange={() => updateField('priceType', 'free')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Gratuït</span>
                </label>
              </div>

              {/* Price input */}
              {formData.priceType !== 'free' && (
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xl font-semibold text-gray-900 placeholder:text-gray-400 ${
                      errors.price ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    €
                  </span>
                </div>
              )}
              {errors.price && (
                <span className="text-xs text-red-600">{errors.price}</span>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5" />
                Ubicació
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Província *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => updateField('province', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 ${
                      errors.province ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecciona província</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov.value} value={prov.value}>
                        {prov.label}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.province}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciutat / Població *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Ex: Barcelona"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                      errors.city ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.city && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.city}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="lg:sticky lg:top-6 space-y-6 h-fit">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previsualització</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Mini preview card */}
                <div className="aspect-square bg-gray-100 relative">
                  {images[0] ? (
                    <Image
                      src={images[0].preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {/* Ad type badge */}
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${
                    formData.adType === 'oferta'
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {formData.adType === 'oferta' ? 'Oferta' : 'Demanda'}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-lg font-bold text-indigo-600">
                    {formData.priceType === 'free'
                      ? 'Gratuït'
                      : formData.price
                        ? `${parseFloat(formData.price).toLocaleString('ca-ES')} €`
                        : '0 €'}
                  </p>
                  <p className="font-medium text-gray-900 mt-1 line-clamp-2">
                    {formData.title || 'Títol del teu anunci'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                    {formData.category && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {CATEGORIES.find((c) => c.value === formData.category)?.label || formData.category}
                      </span>
                    )}
                    {formData.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {formData.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Consells
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                {TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publicant...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publicar anunci
                </>
              )}
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar esborrany
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
