'use client';

import { useEffect } from 'react';

export default function DevWarningsFilter() {
  useEffect(() => {
    // Solo aplicar en entorno de desarrollo
    if (process.env.NODE_ENV !== 'development') return;

    // Atributos de extensiones del navegador que causan warnings
    const browserExtensionAttributes = [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'cz-shortcut-listen',
      'data-gramm_editor',
      'data-gramm',
      'data-lt-tmp-id',
      'data-languagetool'
    ];

    // Guardar el console.error original
    const originalConsoleError = console.error;

    // Función de filtro para console.error
    console.error = (...args: any[]) => {
      const message = args[0];

      // Si es un string, verificar si contiene warnings de atributos de extensiones
      if (typeof message === 'string') {
        const isExtensionWarning = browserExtensionAttributes.some(attr =>
          message.includes(`Extra attributes from the server: ${attr}`) ||
          message.includes(`Warning: Extra attributes from the server:`) && message.includes(attr)
        );

        // Si es un warning de extensión, no mostrarlo
        if (isExtensionWarning) {
          return;
        }
      }

      // Para cualquier otro error, usar el console.error original
      originalConsoleError.apply(console, args);
    };

    // Cleanup function para restaurar console.error original
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}