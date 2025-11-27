/**
 * Memory Cache Utility (Fallback)
 * 
 * Caché en memoria simple para desarrollo o cuando Redis no está disponible.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100; // Máximo de entradas

  /**
   * Obtener valor del caché
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Verificar si expiró
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Guardar valor en caché
   */
  set(key: string, value: any, ttl: number = 30000): void {
    // Limpiar entradas antiguas si el caché está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl,
    });
  }

  /**
   * Eliminar valor del caché
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Eliminar múltiples claves con patrón
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deleted = 0;

    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Verificar si una clave existe
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtener TTL restante de una clave (en ms)
   */
  getTTL(key: string): number {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return -1;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const remaining = entry.ttl - age;

    return remaining > 0 ? remaining : -1;
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    // Si aún está lleno después de limpiar, eliminar las más antiguas
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = this.cache.size - this.maxSize + 10; // Dejar espacio extra
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener tamaño del caché
   */
  size(): number {
    return this.cache.size;
  }
}

// Instancia singleton
const memoryCache = new MemoryCache();

// Limpiar automáticamente cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}

export default memoryCache;


