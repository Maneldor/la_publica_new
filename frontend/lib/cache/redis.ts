/**
 * Redis Cache Utility
 * 
 * Para producción, reemplaza el caché en memoria por Redis.
 * 
 * Uso:
 * 1. Instalar: npm install ioredis
 * 2. Configurar REDIS_URL en .env
 * 3. Reemplazar cache en memoria en route.ts por este módulo
 */

import Redis from 'ioredis';

let redisClient: Redis | null = null;

// Inicializar cliente Redis
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL no configurado, usando caché en memoria');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Error inicializando Redis:', error);
    return null;
  }
}

// Cache interface
interface CacheOptions {
  ttl?: number; // Time to live en segundos
}

/**
 * Obtener valor del caché
 */
export async function getCache(key: string): Promise<any | null> {
  const client = getRedisClient();
  
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error(`Error obteniendo caché para ${key}:`, error);
    return null;
  }
}

/**
 * Guardar valor en caché
 */
export async function setCache(
  key: string,
  value: any,
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    const ttl = options.ttl || 30; // Default 30 segundos
    
    await client.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error(`Error guardando caché para ${key}:`, error);
    return false;
  }
}

/**
 * Eliminar valor del caché
 */
export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Error eliminando caché para ${key}:`, error);
    return false;
  }
}

/**
 * Eliminar múltiples claves con patrón
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  
  if (!client) {
    return 0;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    
    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Error eliminando caché con patrón ${pattern}:`, error);
    return 0;
  }
}

/**
 * Verificar si una clave existe
 */
export async function existsCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client) {
    return false;
  }

  try {
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Error verificando caché para ${key}:`, error);
    return false;
  }
}

/**
 * Obtener TTL restante de una clave
 */
export async function getTTL(key: string): Promise<number> {
  const client = getRedisClient();
  
  if (!client) {
    return -1;
  }

  try {
    return await client.ttl(key);
  } catch (error) {
    console.error(`Error obteniendo TTL para ${key}:`, error);
    return -1;
  }
}

/**
 * Cerrar conexión Redis (útil para cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}








