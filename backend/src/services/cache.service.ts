import redis from '../config/redis';
import { config } from '../config/index';

export class CacheService {
  private readonly prefix: string;
  private readonly defaultTTL: number;

  constructor() {
    this.prefix = config.cache.prefix;
    this.defaultTTL = config.cache.ttl;
  }

  /**
   * Genera una clave con prefijo
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Obtiene un valor del caché
   */
  async get(key: string): Promise<any | null> {
    try {
      const cachedValue = await redis.get(this.getKey(key));
      if (!cachedValue) {
        return null;
      }
      return JSON.parse(cachedValue);
    } catch (error) {
      console.error('❌ Cache GET error:', error);
      return null;
    }
  }

  /**
   * Almacena un valor en el caché
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      const timeToLive = ttl || this.defaultTTL;

      await redis.setex(this.getKey(key), timeToLive, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Cache SET error:', error);
      return false;
    }
  }

  /**
   * Elimina una clave del caché
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await redis.del(this.getKey(key));
      return result > 0;
    } catch (error) {
      console.error('❌ Cache DEL error:', error);
      return false;
    }
  }

  /**
   * Elimina múltiples claves del caché
   */
  async delMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      const prefixedKeys = keys.map(key => this.getKey(key));
      return await redis.del(...prefixedKeys);
    } catch (error) {
      console.error('❌ Cache DEL MANY error:', error);
      return 0;
    }
  }

  /**
   * Verifica si existe una clave en el caché
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error('❌ Cache EXISTS error:', error);
      return false;
    }
  }

  /**
   * Establece el tiempo de vida de una clave
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redis.expire(this.getKey(key), ttl);
      return result === 1;
    } catch (error) {
      console.error('❌ Cache EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Obtiene el tiempo restante de vida de una clave
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(this.getKey(key));
    } catch (error) {
      console.error('❌ Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Elimina todas las claves que coincidan con un patrón
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(this.getKey(pattern));
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      console.error('❌ Cache DEL PATTERN error:', error);
      return 0;
    }
  }

  /**
   * Obtiene todas las claves que coincidan con un patrón
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await redis.keys(this.getKey(pattern));
      // Remover el prefijo de las claves devueltas
      return keys.map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('❌ Cache KEYS error:', error);
      return [];
    }
  }

  /**
   * Incrementa un valor numérico en el caché
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      if (increment === 1) {
        return await redis.incr(this.getKey(key));
      } else {
        return await redis.incrby(this.getKey(key), increment);
      }
    } catch (error) {
      console.error('❌ Cache INCR error:', error);
      return 0;
    }
  }

  /**
   * Decrementa un valor numérico en el caché
   */
  async decr(key: string, decrement: number = 1): Promise<number> {
    try {
      if (decrement === 1) {
        return await redis.decr(this.getKey(key));
      } else {
        return await redis.decrby(this.getKey(key), decrement);
      }
    } catch (error) {
      console.error('❌ Cache DECR error:', error);
      return 0;
    }
  }

  /**
   * Operación atómica: obtener valor y establecer nuevo valor
   */
  async getSet(key: string, value: any): Promise<any | null> {
    try {
      const serializedValue = JSON.stringify(value);
      const oldValue = await redis.getset(this.getKey(key), serializedValue);
      return oldValue ? JSON.parse(oldValue) : null;
    } catch (error) {
      console.error('❌ Cache GETSET error:', error);
      return null;
    }
  }

  /**
   * Limpia todo el caché (usa con cuidado)
   */
  async flush(): Promise<boolean> {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('❌ Cache FLUSH error:', error);
      return false;
    }
  }

  /**
   * Obtiene información sobre el estado de Redis
   */
  async info(): Promise<any> {
    try {
      const info = await redis.info();
      return {
        status: 'connected',
        info: info
      };
    } catch (error) {
      console.error('❌ Cache INFO error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Exportar instancia singleton
export const cacheService = new CacheService();