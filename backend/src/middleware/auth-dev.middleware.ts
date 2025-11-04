import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

/**
 * Middleware de autenticación temporal para desarrollo
 * Acepta headers X-User-* desde NextAuth frontend
 */
export const authDevMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('🔐 Auth DEV middleware ejecutándose...');

  // Buscar headers de usuario
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;

  console.log('📋 Headers recibidos:', {
    userId,
    userEmail,
    userRole
  });

  // Si no hay información de usuario, es una petición sin autenticar
  if (!userId && !userEmail) {
    console.log('ℹ️ Petición sin autenticación - permitiendo acceso público');
    // Para endpoints públicos, continuar sin usuario
    next();
    return;
  }

  // Si hay información parcial, validar
  if (userId && userEmail) {
    req.user = {
      id: userId,
      email: userEmail,
      primaryRole: userRole || 'USER'
    };

    console.log('✅ Usuario autenticado:', req.user);
    next();
  } else {
    console.log('❌ Información de usuario incompleta');
    return res.status(401).json({
      error: 'Información de autenticación incompleta',
      success: false
    });
  }
};

// Middleware que requiere autenticación obligatoria
export const requireAuthDev = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('🔐 Require Auth DEV middleware...');

  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;

  console.log('📋 Headers recibidos:', { userId, userEmail, userRole });

  if (!userId) {
    console.log('❌ No hay userId en headers');
    return res.status(401).json({
      error: 'No autenticado - falta X-User-Id header',
      success: false
    });
  }

  if (!userEmail) {
    console.log('❌ No hay userEmail en headers');
    return res.status(401).json({
      error: 'No autenticado - falta X-User-Email header',
      success: false
    });
  }

  req.user = {
    id: userId,
    email: userEmail,
    primaryRole: userRole || 'USER'
  };

  console.log('✅ Usuario autenticado (requerido):', req.user);
  next();
};