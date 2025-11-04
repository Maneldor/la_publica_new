'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCreateAnunci } from './hooks/useCreateAnunci';
import { useCreateAnuncio } from '@/hooks/useAnuncios';
import { toast } from 'sonner';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Step1BasicInfo } from './components/steps/Step1BasicInfo';
import { Step2Details } from './components/steps/Step2Details';
import { Step3Location } from './components/steps/Step3Location';
import { Step4Contact } from './components/steps/Step4Contact';
import { Step5Images } from './components/steps/Step5ImagesNew';
import { Step6Review } from './components/steps/Step6Review';

export default function CrearAnunciPage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    currentStep,
    formData,
    errors,
    updateField,
    nextStep,
    prevStep,
  } = useCreateAnunci();

  // Hook per crear anuncis al backend
  const createAnuncioMutation = useCreateAnuncio();

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      // Convertir imágenes a Base64
      const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      console.log('📸 Procesando imágenes - Portada:', !!formData.coverImage, 'Galería:', formData.galleryImages.length);

      // Convertir imagen de portada
      if (!formData.coverImage) {
        throw new Error('Imatge de portada obligatòria');
      }

      const coverImageBase64 = await convertImageToBase64(formData.coverImage);

      // Convertir imágenes de galería
      const galleryPromises = formData.galleryImages.map(convertImageToBase64);
      const galleryImagesBase64 = await Promise.all(galleryPromises);

      // Combinar: [portada, ...galería]
      const allImages = [coverImageBase64, ...galleryImagesBase64];

      console.log('✅ Imágenes convertidas - Portada: 1, Galería:', galleryImagesBase64.length, 'Total:', allImages.length);

      // Mapear dades del formulari al format del backend
      const apiData = {
        title: formData.title,
        content: `${formData.description}\n\n**Detalls:**\n- Tipus: ${formData.type === 'oferta' ? 'Oferta' : 'Demanda'}\n- Categoria: ${formData.category}${formData.price ? `\n- Preu: ${formData.price}€ (${formData.priceType})` : ''}\n- Estat: ${formData.condition === 'nou' ? 'Nou' : formData.condition === 'com_nou' ? 'Com nou' : 'Usat'}\n- Ubicació: ${formData.city}, ${formData.province}${formData.postalCode ? ` (${formData.postalCode})` : ''}`,
        type: formData.type === 'oferta' ? 'general' : 'urgente',
        priority: 'media', // Prioritat mitjana per defecte per usuaris
        scope: 'global',
        targets: [],
        startDate: new Date(), // Data d'inici immediata
        expiresAt: undefined, // Sense caducitat per defecte
        status: 'pending_review', // ESTAT DE MODERACIÓ
        configuration: {
          marketplace: {
            category: formData.category,
            adType: formData.type,
            price: formData.price,
            priceType: formData.priceType,
            condition: formData.condition,
            location: {
              province: formData.province,
              city: formData.city,
              postalCode: formData.postalCode
            },
            delivery: {
              pickup: formData.pickupAvailable,
              shipping: formData.shippingAvailable,
              shippingIncluded: formData.shippingIncluded
            },
            contact: {
              name: formData.contactName,
              phone: formData.contactPhone,
              email: formData.contactEmail,
              preferredSchedule: formData.contactSchedule
            },
            coverImage: coverImageBase64,           // ✅ IMAGEN DE PORTADA
            galleryImages: galleryImagesBase64,     // ✅ GALERÍA ADICIONAL
            images: allImages,                      // ✅ TODAS LAS IMÁGENES (LEGACY)
            mainImageIndex: 0                       // ✅ PORTADA SIEMPRE ES LA PRIMERA
          }
        }
      };

      console.log('📤 Enviant anunci per revisió:', apiData);

      createAnuncioMutation.mutate(apiData, {
        onSuccess: () => {
          toast.success('📤 Anunci enviat per revisió! Un administrador el revisarà aviat.');
          router.push('/dashboard/anuncis');
        },
        onError: (error: any) => {
          console.error('❌ Error enviant anunci:', error);
          toast.error(error.message || 'Error al enviar l\'anunci per revisió');
          setIsPublishing(false);
        }
      });

    } catch (error) {
      console.error('❌ Error preparant anunci:', error);
      toast.error('Error al preparar l\'anunci');
      setIsPublishing(false);
    }
  };

  const steps = [
    'Informació',
    'Detalls',
    'Ubicació',
    'Contacte',
    'Imatges',
    'Revisió'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <Step2Details
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <Step3Location
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <Step4Contact
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 5:
        return (
          <Step5Images
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 6:
        return (
          <Step6Review
            formData={formData}
            errors={errors}
            onPublish={handlePublish}
            isPublishing={isPublishing || createAnuncioMutation.isPending}
          />
        );
      // Más steps después
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Step {currentStep} - En construcció
            </h3>
            <p className="text-gray-600">
              Aquest pas s'està desenvolupant.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Tornar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Nou Anunci
          </h1>
          <p className="text-gray-600 mt-2">
            Publica el teu anunci a La Pública
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={6}
          steps={steps}
        />

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
              ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }
            `}
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          {currentStep < 6 && (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Següent
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}