'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(redirectTo: string = '/login') {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('lapublica_token');

    if (!token) {
      console.log('🔒 No autenticado, redirigiendo a login...');
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('lapublica_token')
    : null;

  return { isAuthenticated: !!token };
}