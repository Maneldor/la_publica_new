'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/dateFormatter';

interface ClientDateProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

/**
 * Componente para renderizar fechas solo en el cliente
 * Evita errores de hidratación entre servidor y cliente
 */
export function ClientDate({ date, options, fallback = '...' }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{fallback}</span>;
  }

  return <span>{formatDate(date, options)}</span>;
}

/**
 * Hook para manejar fechas en componentes que necesitan SSR
 */
export function useClientDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return formatDate(date, options);
}