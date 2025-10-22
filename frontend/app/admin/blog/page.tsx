'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/blog/listar');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-600">Redirigiendo...</p>
    </div>
  );
}