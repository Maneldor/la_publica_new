import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

/**
 * Middleware de caché para interceptar peticiones HTTP
 * @param ttl - Tiempo de vida en segundos (opcional)
 */
export const cacheMiddleware = (ttl?: number) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Solo cachear peticiones GET
      if (req.method !== 'GET') {
        return next();
      }

      // Generar clave única para el caché
      const userId = req.user?.id || 'anonymous';
      const cacheKey = `${req.method}:${req.originalUrl}:${userId}`;

      // Buscar en caché
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        // Cache HIT - devolver datos cacheados
        res.set('X-Cache-Status', 'HIT');
        return res.json(cachedData);
      }

      // Cache MISS - interceptar la respuesta para cachearla
      const originalJson = res.json.bind(res);

      res.json = function(data: any) {
        // Cachear la respuesta de forma asíncrona (no bloquear la respuesta)
        setImmediate(async () => {
          try {
            await cacheService.set(cacheKey, data, ttl);
          } catch (error) {
            console.error('Error cacheando respuesta:', error);
          }
        });

        // Añadir header de cache miss
        res.set('X-Cache-Status', 'MISS');

        // Continuar con la respuesta normal
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      // Si el caché falla, continuar sin cache
      next();
    }
  };
};

/**
 * Middleware para invalidar caché por patrón
 * @param pattern - Patrón a invalidar
 */
export const invalidateCacheMiddleware = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptar la respuesta exitosa para invalidar caché
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      // Invalidar caché de forma asíncrona después de respuesta exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            await cacheService.delPattern(pattern);
          } catch (error) {
            console.error('Error invalidando caché:', error);
          }
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware para invalidar caché específico
 * @param keyGenerator - Función que genera la clave a invalidar
 */
export const invalidateSpecificCacheMiddleware = (keyGenerator: (req: AuthenticatedRequest) => string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Interceptar la respuesta exitosa para invalidar caché específico
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      // Invalidar caché específico de forma asíncrona después de respuesta exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            const cacheKey = keyGenerator(req);
            await cacheService.del(cacheKey);
          } catch (error) {
            console.error('Error invalidando caché específico:', error);
          }
        });
      }

      return originalJson(data);
    };

    next();
  };
};