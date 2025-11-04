'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAnuncio } from '@/hooks/useAnuncios';
import AnunciWizard from '@/components/wizard/AnunciWizard';

export default function EditarAnuncioPage() {
  const router = useRouter();
  const params = useParams();
  const anuncioId = params.id as string;

  // Carregar dades de l'anunci
  const { data: anuncio, isLoading: loadingAnuncio, error } = useAnuncio(anuncioId);

  const handleSuccess = () => {
    router.push('/admin/anuncios/listar');
  };

  const handleClose = () => {
    router.push('/admin/anuncios/listar');
  };

  if (loadingAnuncio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregant anunci...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error al carregar l'anunci</div>
          <button
            onClick={() => router.push('/admin/anuncios/listar')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tornar al llistat
          </button>
        </div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Anunci no trobat</div>
          <button
            onClick={() => router.push('/admin/anuncios/listar')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tornar al llistat
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnunciWizard
      mode="edit"
      initialData={anuncio}
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}