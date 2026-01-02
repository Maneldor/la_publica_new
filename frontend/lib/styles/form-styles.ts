/**
 * Estilos globales para formularios
 * IMPORTANTE: Siempre usar estas constantes para inputs, selects y textareas
 * para evitar problemas de texto invisible
 */

// Estilos base para todos los inputs
export const INPUT_BASE = 'bg-white text-gray-900 placeholder:text-gray-400';

// Input estandar
export const INPUT_STYLES = `w-full px-4 py-3 rounded-lg border border-gray-300 ${INPUT_BASE} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

// Input con error
export const INPUT_ERROR_STYLES = `w-full px-4 py-3 rounded-lg border border-red-500 bg-red-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`;

// Input pequeno
export const INPUT_SM_STYLES = `w-full px-3 py-2 rounded-lg border border-gray-300 ${INPUT_BASE} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`;

// Select estandar
export const SELECT_STYLES = `w-full px-4 py-3 rounded-lg border border-gray-300 ${INPUT_BASE} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

// Textarea estandar
export const TEXTAREA_STYLES = `w-full px-4 py-3 rounded-lg border border-gray-300 ${INPUT_BASE} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`;

// Funcion helper para generar clases de input con estado de error
export const getInputStyles = (hasError: boolean, size: 'sm' | 'md' = 'md') => {
  const base = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-3';
  const border = hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white';
  const focus = hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500';

  return `w-full ${base} rounded-lg border ${border} text-gray-900 placeholder:text-gray-400 focus:ring-2 ${focus} focus:border-transparent transition-all`;
};

// Funcion helper para select con estado de error
export const getSelectStyles = (hasError: boolean) => {
  const border = hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white';
  const focus = hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500';

  return `w-full px-4 py-3 rounded-lg border ${border} text-gray-900 focus:ring-2 ${focus} focus:border-transparent transition-all`;
};

// Funcion helper para textarea con estado de error
export const getTextareaStyles = (hasError: boolean) => {
  const border = hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white';
  const focus = hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500';

  return `w-full px-4 py-3 rounded-lg border ${border} text-gray-900 placeholder:text-gray-400 focus:ring-2 ${focus} focus:border-transparent transition-all resize-none`;
};

// Estilos para divs que muestran valores (como la contrasenya generada)
export const VALUE_DISPLAY_STYLES = 'bg-white text-gray-900 px-3 py-2 border rounded';

// Option dentro de select
export const OPTION_STYLES = 'text-gray-900';
