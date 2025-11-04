'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnunciosPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de listado
    router.replace('/admin/anuncios/listar');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Redirigint...</div>
    </div>
  );
}