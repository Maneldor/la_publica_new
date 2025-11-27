interface ItemGuardat {
  id: string;
  tipus: 'blog' | 'oferta' | 'forum' | 'anunci' | 'empresa' | 'grup' | 'assessorament';
  itemId: string;
  usuariId: string;
  dataGuardat: string;
  metadata?: {
    titol: string;
    imatge?: string;
    url: string;
    description?: string;
  };
}

// Función para mostrar toast - placeholder por ahora
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // TODO: Implementar con tu sistema de toasts (sonner, react-hot-toast, etc.)
  console.log(`${type.toUpperCase()}: ${message}`);
};

// Obtenir tots els guardats de l'usuari
export const getGuardats = async (usuariId: string): Promise<ItemGuardat[]> => {
  try {
    const response = await fetch(`/api/guardats?usuariId=${usuariId}`);
    if (!response.ok) throw new Error('Error fetching guardats');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error getting guardats:', error);
    return [];
  }
};

// Obtenir guardats per tipus
export const getGuardatsByTipus = async (
  usuariId: string,
  tipus: string
): Promise<ItemGuardat[]> => {
  try {
    const response = await fetch(`/api/guardats?usuariId=${usuariId}&tipus=${tipus}`);
    if (!response.ok) throw new Error('Error fetching guardats by tipus');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error getting guardats by tipus:', error);
    return [];
  }
};

// Verificar si un item està guardat
export const isItemGuardat = async (
  usuariId: string,
  tipus: string,
  itemId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/guardats/check?usuariId=${usuariId}&tipus=${tipus}&itemId=${itemId}`
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.isGuardat;
  } catch (error) {
    console.error('Error checking if item is guardat:', error);
    return false;
  }
};

// Guardar un item
export const guardarItem = async (
  usuariId: string,
  tipus: 'blog' | 'oferta' | 'forum' | 'anunci' | 'empresa' | 'grup' | 'assessorament',
  itemId: string,
  metadata?: { titol: string; imatge?: string; url: string; description?: string }
): Promise<boolean> => {
  try {
    const response = await fetch('/api/guardats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuariId,
        tipus,
        itemId,
        metadata
      })
    });

    if (response.ok) {
      showToast(`${getTipusLabel(tipus)} guardat correctament!`, 'success');
      return true;
    } else {
      const errorData = await response.json();
      if (errorData.error === 'Aquest item ja està guardat') {
        showToast('Aquest element ja està guardat', 'error');
      } else {
        showToast('Error al guardar', 'error');
      }
      return false;
    }
  } catch (error) {
    console.error('Error saving item:', error);
    showToast('Error al guardar', 'error');
    return false;
  }
};

// Eliminar de guardats
export const eliminarGuardat = async (
  usuariId: string,
  tipus: string,
  itemId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/guardats?usuariId=${usuariId}&tipus=${tipus}&itemId=${itemId}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      showToast('Eliminat de guardats', 'success');
      return true;
    } else {
      showToast('Error al eliminar', 'error');
      return false;
    }
  } catch (error) {
    console.error('Error removing guardat:', error);
    showToast('Error al eliminar', 'error');
    return false;
  }
};

// Toggle guardar/eliminar
export const toggleGuardar = async (
  usuariId: string,
  tipus: string,
  itemId: string,
  metadata?: { titol: string; imatge?: string; url: string; description?: string }
): Promise<boolean> => {
  const isGuardat = await isItemGuardat(usuariId, tipus, itemId);

  if (isGuardat) {
    return await eliminarGuardat(usuariId, tipus, itemId);
  } else {
    return await guardarItem(usuariId, tipus as 'blog' | 'oferta' | 'forum' | 'anunci' | 'empresa' | 'grup' | 'assessorament', itemId, metadata);
  }
};

// Helper per obtenir label del tipus
export const getTipusLabel = (tipus: string): string => {
  const labels: Record<string, string> = {
    blog: 'Blog',
    oferta: 'Oferta',
    forum: 'Tema de fòrum',
    anunci: 'Anunci',
    empresa: 'Empresa',
    grup: 'Grup',
    assessorament: 'Assessorament'
  };
  return labels[tipus] || 'Element';
};

// Helper per obtenir emoji del tipus
export const getTipusEmoji = (tipus: string): string => {
  const emojis: Record<string, string> = {
    blog: '📝',
    oferta: '🎁',
    forum: '💬',
    anunci: '📢',
    empresa: '🏢',
    grup: '👥',
    assessorament: '💡'
  };
  return emojis[tipus] || '📌';
};

// Helper per obtenir el color del tipus
export const getTipusColor = (tipus: string): string => {
  const colors: Record<string, string> = {
    blog: 'blue',
    oferta: 'green',
    forum: 'purple',
    anunci: 'orange',
    empresa: 'indigo',
    grup: 'pink',
    assessorament: 'yellow'
  };
  return colors[tipus] || 'gray';
};

// Contar guardats per tipus
export const getGuardatsStats = (guardats: ItemGuardat[]) => {
  const stats = {
    total: guardats.length,
    blogs: guardats.filter(g => g.tipus === 'blog').length,
    ofertes: guardats.filter(g => g.tipus === 'oferta').length,
    forums: guardats.filter(g => g.tipus === 'forum').length,
    anuncis: guardats.filter(g => g.tipus === 'anunci').length,
    empreses: guardats.filter(g => g.tipus === 'empresa').length,
    grups: guardats.filter(g => g.tipus === 'grup').length,
    assessoraments: guardats.filter(g => g.tipus === 'assessorament').length,
  };

  return stats;
};