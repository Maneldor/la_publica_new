import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('\n🔒 === AUTH MIDDLEWARE ===');
  console.log('📍 URL:', req.url);
  console.log('📍 Method:', req.method);
  console.log('📍 Headers Authorization:', req.headers.authorization);

  const authHeader = req.headers['authorization'];

  console.log('🔑 Authorization header completo:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Token no proporcionado o formato incorrecto');
    console.log('🔒 === FIN AUTH MIDDLEWARE (ERROR) ===\n');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'mi-secreto-super-seguro-2024';
    
    if (!process.env.NEXTAUTH_SECRET && !process.env.JWT_SECRET) {
      console.warn('⚠️  WARNING: Using default JWT secret. Set NEXTAUTH_SECRET or JWT_SECRET in production!');
    }

    const decoded = jwt.verify(token, SECRET) as any;
    
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Token decodificado exitosamente');
      console.log('👤 Usuario ID:', decoded.id || decoded.userId);
      console.log('👤 Rol primario:', decoded.primaryRole);
      console.log('👤 Rol adicional:', decoded.role);
    }

    try {
      // Intentar obtener información del usuario desde la base de datos
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          primaryRole: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        console.log('✅ Usuario encontrado en BD:', user);
        req.user = {
          id: user.id,
          email: user.email,
          primaryRole: user.primaryRole || user.role
        };
        console.log('✅ Usuario adjuntado a request desde BD');
        console.log('🔒 === FIN AUTH MIDDLEWARE (ÉXITO BD) ===\n');
        next();
        return;
      } else {
        console.log('⚠️ Usuario no encontrado en BD o inactivo');
      }
    } catch (dbError) {
      console.log('⚠️ Error de base de datos en middleware:', dbError);
    }

    // Fallback: usar información del token JWT decodificado
    console.log('🔄 Usando fallback del token JWT...');
    if (decoded.id && decoded.email && decoded.primaryRole) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        primaryRole: decoded.primaryRole
      };
      console.log('✅ Usuario autenticado desde token JWT:', decoded.email);
      console.log('✅ Usuario adjuntado a request:', req.user);
      console.log('🔒 === FIN AUTH MIDDLEWARE (ÉXITO TOKEN) ===\n');
      next();
    } else {
      console.log('❌ Token sin información suficiente del usuario');
      console.log('📋 Campos disponibles:', {
        id: decoded.id,
        email: decoded.email,
        primaryRole: decoded.primaryRole
      });
      console.log('🔒 === FIN AUTH MIDDLEWARE (ERROR CAMPOS) ===\n');
      return res.status(401).json({ error: 'Token inválido: faltan datos del usuario' });
    }

  } catch (error: any) {
    console.error('❌ Error verificando token:', error.message);
    console.error('❌ Stack trace:', error.stack);
    console.log('🔒 === FIN AUTH MIDDLEWARE (ERROR JWT) ===\n');
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Mantener compatibilidad con el middleware anterior
export const authenticateToken = authMiddleware;

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.primaryRole)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.primaryRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }

  next();
};