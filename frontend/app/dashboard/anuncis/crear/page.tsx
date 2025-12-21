'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ShoppingBag,
  FileText,
  MapPin,
  Phone,
  Image,
  CheckCircle
} from 'lucide-react';
import { useCreateAnunci } from './hooks/useCreateAnunci';
import { useCreateAnuncio } from '@/hooks/useAnuncios';
import { toast } from 'sonner';
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout';
import { Step1BasicInfo } from './components/steps/Step1BasicInfo';
import { Step2Details } from './components/steps/Step2Details';
import { Step3Location } from './components/steps/Step3Location';
import { Step4Contact } from './components/steps/Step4Contact';
import { Step5Images } from './components/steps/Step5ImagesNew';
import { Step6Review } from './components/steps/Step6Review';

export default function CrearAnunciPage() {
  const router = useRouter();
  const { data: session } = useSession();
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
      // Almacenar datos de marketplace en metadata para preservarlos
      const marketplaceData = {
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
        coverImage: coverImageBase64,
        galleryImages: galleryImagesBase64,
        images: allImages,
        mainImageIndex: 0
      };

      const apiData = {
        title: formData.title,
        content: `${formData.description}\n\n**Detalls:**\n- Tipus: ${formData.type === 'oferta' ? 'Oferta' : 'Demanda'}\n- Categoria: ${formData.category}${formData.price ? `\n- Preu: ${formData.price}€ (${formData.priceType})` : ''}\n- Estat: ${formData.condition === 'nou' ? 'Nou' : formData.condition === 'com_nou' ? 'Com nou' : 'Usat'}\n- Ubicació: ${formData.city}, ${formData.province}${formData.postalCode ? ` (${formData.postalCode})` : ''}`,
        type: (formData.type === 'oferta' ? 'general' : 'urgent') as 'general' | 'urgent' | 'event' | 'maintenance' | 'news' | 'alert' | 'promotion' | 'regulation',
        priority: 5, // Número para priority según el schema de Prisma
        status: 'draft' as 'draft' | 'pending' | 'published' | 'archived',
        audience: 'all' as 'all' | 'employees' | 'companies' | 'specific' | 'community',
        targetCommunities: [],
        targetRoles: [],
        sendNotification: false,
        notificationChannels: [] as ('platform' | 'email' | 'sms' | 'push' | 'all_channels')[],
        tags: [] as string[],
        isSticky: false,
        allowComments: true,
        imageUrl: coverImageBase64,
        authorId: session?.user?.id || '',
        metadata: marketplaceData
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

  // Steps para WizardLayout Enterprise
  const steps = [
    { label: 'Informació', description: 'Títol i descripció', icon: ShoppingBag },
    { label: 'Detalls', description: 'Preu i estat', icon: FileText },
    { label: 'Ubicació', description: 'Localització', icon: MapPin },
    { label: 'Contacte', description: 'Dades de contacte', icon: Phone },
    { label: 'Imatges', description: 'Fotos del producte', icon: Image },
    { label: 'Revisió', description: 'Confirmar i publicar', icon: CheckCircle },
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
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Step {currentStep} - En construcció
            </h3>
            <p className="text-gray-600">
              Aquest pas s&apos;està desenvolupant.
            </p>
          </div>
        );
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      nextStep();
    } else {
      // En el último paso, publicar
      handlePublish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      prevStep();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <WizardLayout
      title="Crear Nou Anunci"
      description="Publica el teu anunci a La Pública"
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={handleCancel}
      canProceed={true}
      isLoading={isPublishing || createAnuncioMutation.isPending}
      finalLabel="Publicar Anunci"
    >
      {renderStep()}
    </WizardLayout>
  );
}
