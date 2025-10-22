'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlataformaPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/plataforma/configuracion');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-600">Redirigiendo...</p>
    </div>
  );
}