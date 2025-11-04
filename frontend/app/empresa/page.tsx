'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmpresaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/empresa/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500">Redirigint al dashboard...</div>
    </div>
  );
}