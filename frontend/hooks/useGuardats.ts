import { useState, useEffect } from 'react';
import { guardarItem, eliminarGuardat, isItemGuardat } from '@/lib/guardats';

export const useGuardats = (
  tipus: string,
  itemId: string,
  usuariId: string
) => {
  const [isGuardat, setIsGuardat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si està guardat al muntar
  useEffect(() => {
    const checkGuardat = async () => {
      try {
        const guardat = await isItemGuardat(usuariId, tipus, itemId);
        setIsGuardat(guardat);
      } catch (error) {
        console.error('Error checking guardat status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (usuariId && tipus && itemId) {
      checkGuardat();
    }
  }, [usuariId, tipus, itemId]);

  // Toggle guardar/eliminar
  const handleToggleGuardar = async (metadata?: any) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isGuardat) {
        const success = await eliminarGuardat(usuariId, tipus, itemId);
        if (success) setIsGuardat(false);
      } else {
        const success = await guardarItem(usuariId, tipus, itemId, metadata);
        if (success) setIsGuardat(true);
      }
    } catch (error) {
      console.error('Error toggling guardat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isGuardat, isLoading, handleToggleGuardar };
};

// Hook per obtenir tots els guardats de l'usuari
export const useGuardatsList = (usuariId: string, tipus?: string) => {
  const [guardats, setGuardats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuardats = async () => {
      try {
        setIsLoading(true);
        const url = `/api/guardats?usuariId=${usuariId}${tipus ? `&tipus=${tipus}` : ''}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setGuardats(data.data || []);
        } else {
          setError('Error al carregar guardats');
        }
      } catch (err) {
        setError('Error de connexió');
        console.error('Error fetching guardats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (usuariId) {
      fetchGuardats();
    }
  }, [usuariId, tipus]);

  const refetch = () => {
    if (usuariId) {
      const fetchGuardats = async () => {
        try {
          const url = `/api/guardats?usuariId=${usuariId}${tipus ? `&tipus=${tipus}` : ''}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setGuardats(data.data || []);
          }
        } catch (err) {
          console.error('Error refetching guardats:', err);
        }
      };
      fetchGuardats();
    }
  };

  return { guardats, isLoading, error, refetch };
};