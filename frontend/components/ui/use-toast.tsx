'use client';

import { useState, useCallback } from 'react';

interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState extends ToastMessage {
  id: string;
}

let toastCounter = 0;
const toasts: ToastState[] = [];
let setToastsFunction: ((toasts: ToastState[]) => void) | null = null;

export function useToast() {
  const [toastList, setToastList] = useState<ToastState[]>([]);
  
  // Registrar la función de actualización
  if (!setToastsFunction) {
    setToastsFunction = setToastList;
  }
  
  const toast = useCallback((message: ToastMessage) => {
    const id = `toast-${++toastCounter}`;
    const newToast = { ...message, id };
    
    toasts.push(newToast);
    setToastsFunction?.([ ...toasts]);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        setToastsFunction?.([...toasts]);
      }
    }, 5000);
  }, []);
  
  return { toast, toasts: toastList };
}

// Componente Toast para mostrar las notificaciones
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts } = useToast();
  
  return (
    <>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm p-4 rounded-md shadow-lg ${
              toast.variant === 'destructive'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}