import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

interface CacheOptions {
  ttl?: number; // Time to live en segundos
  keyGenerator?: (req: Request) => string; // Función personalizada para generar la clave
  skipCache?: (req: Request) => boolean; // Función para saltar el caché
  onlyMethods?: string[]; // Solo cachear ciertos métodos HTTP
}

/**
 * Middleware de caché para respuestas HTTP
 */
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 3600, // 1 hora por defecto
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    onlyMethods = ['GET']
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Solo cachear métodos específicos
    if (!onlyMethods.includes(req.method)) {
      return next();
    }

    // Verificar si debemos saltar el caché
    if (skipCache(req)) {
      return next();
    }

    // Generar clave de caché
    const cacheKey = keyGenerator(req);

    try {
      // Intentar obtener del caché
      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);

        // Establecer headers del caché
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);

        // Devolver respuesta cacheada
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      // Interceptar la respuesta original
      const originalJson = res.json;
      const originalStatus = res.status;
      let responseStatus = 200;

      // Override del método status
      res.status = function(code: number) {
        responseStatus = code;
        return originalStatus.call(this, code);
      };

      // Override del método json
      res.json = function(data: any) {
        // Solo cachear respuestas exitosas
        if (responseStatus >= 200 && responseStatus < 300) {
          const responseToCache = {
            status: responseStatus,
            data: data,
            timestamp: new Date().toISOString()
          };

          // Guardar en caché de forma asíncrona
          cacheService.set(cacheKey, responseToCache, ttl)
            .then(() => {
              console.log(`💾 Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
            })
            .catch((error) => {
              console.error(`❌ Error setting cache for ${cacheKey}:`, error);
            });
        }

        // Llamar al método original
        return originalJson.call(this, data);
      };

      next();

    } catch (error) {
      console.error('❌ Cache middleware error:', error);
      // En caso de error del caché, continuar sin caché
      next();
    }
  };
};

/**
 * Generador de clave de caché por defecto
 */
function defaultKeyGenerator(req: Request): string {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const query = JSON.stringify(req.query);
  const userId = (req as any).user?.id || 'anonymous';

  return `${method}:${url}:${query}:${userId}`;
}

/**
 * Middleware para invalidar caché por patrón
 */
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedCount = await cacheService.delPattern(pattern);
      console.log(`🗑️ Cache invalidated: ${deletedCount} keys matching pattern '${pattern}'`);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
    next();
  };
};

/**
 * Middleware específico para cachear listas con paginación
 */
export const cacheList = (options: {
  baseKey: string;
  ttl?: number;
  includeUser?: boolean;
}) => {
  const { baseKey, ttl = 3600, includeUser = false } = options;

  return cache({
    ttl,
    keyGenerator: (req: Request) => {
      const page = req.query.page || '1';
      const limit = req.query.limit || '10';
      const sort = req.query.sort || '';
      const filter = JSON.stringify(req.query.filter || {});
      const userId = includeUser ? ((req as any).user?.id || 'anonymous') : '';

      return `${baseKey}:page:${page}:limit:${limit}:sort:${sort}:filter:${filter}${userId ? `:user:${userId}` : ''}`;
    }
  });
};

/**
 * Middleware para cachear datos específicos de usuario
 */
export const cacheUser = (options: {
  baseKey: string;
  ttl?: number;
}) => {
  const { baseKey, ttl = 1800 } = options; // 30 minutos por defecto para datos de usuario

  return cache({
    ttl,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id || 'anonymous';
      const params = JSON.stringify(req.params);
      const query = JSON.stringify(req.query);

      return `${baseKey}:user:${userId}:params:${params}:query:${query}`;
    }
  });
};

/**
 * Middleware para saltarse el caché si hay ciertos headers
 */
export const skipCacheMiddleware = (req: Request): boolean => {
  // Saltar caché si se envía el header Cache-Control: no-cache
  const cacheControl = req.get('Cache-Control');
  if (cacheControl && cacheControl.includes('no-cache')) {
    return true;
  }

  // Saltar caché si se envía un header personalizado
  if (req.get('X-Skip-Cache')) {
    return true;
  }

  return false;
};