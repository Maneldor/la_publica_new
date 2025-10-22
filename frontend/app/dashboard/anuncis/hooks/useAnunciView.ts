import { useState, useCallback } from 'react';

// Tipus per al mode de vista
type ViewMode = 'grid' | 'list';

export function useAnunciView(initialViewMode: ViewMode = 'grid') {
  // Estat del mode de vista
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // Toggle entre grid i list
  const toggleView = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Setter optimitzat amb useCallback per evitar re-renders
  const handleViewChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);
  }, []);

  // Comprovar si està en mode grid
  const isGridMode = viewMode === 'grid';

  // Comprovar si està en mode llista
  const isListMode = viewMode === 'list';

  return {
    // Estat actual
    viewMode,

    // Setters
    setViewMode: handleViewChange,
    toggleView,

    // Utilitats
    isGridMode,
    isListMode
  };
}