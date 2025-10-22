/**
 * Utilidades para formatear fechas de manera consistente
 * Evita problemas de hidratación entre servidor y cliente
 */

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Forzar formato consistente sin usar toLocaleDateString directamente
  // para evitar diferencias entre servidor y cliente
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  // Usar formato ISO como base para consistencia
  if (typeof window === 'undefined') {
    // Servidor: usar formato simple
    return formatDateManual(dateObj, defaultOptions);
  } else {
    // Cliente: usar el mismo formato manual
    return formatDateManual(dateObj, defaultOptions);
  }
}

function formatDateManual(date: Date, options: Intl.DateTimeFormatOptions): string {
  const months = [
    'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
    'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  if (options.year === 'numeric' && options.month === 'long' && options.day === 'numeric') {
    // Formato consistente: "15 de gener de 2024"
    return `${day} de ${month} de ${year}`;
  }

  if (options.month === 'short') {
    const shortMonth = month.substring(0, 3);
    return `${day} ${shortMonth}`;
  }

  if (options.weekday) {
    const weekdays = ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'];
    const weekday = weekdays[date.getDay()];
    return `${weekday}, ${day} ${month}`;
  }

  return `${day}/${date.getMonth() + 1}/${year}`;
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Ara mateix';
  if (diffInMinutes < 60) return `Fa ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Fa ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Fa ${diffInDays} dies`;

  return formatDate(dateObj, { day: 'numeric', month: 'short' });
}