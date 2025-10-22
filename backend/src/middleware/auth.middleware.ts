import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth middleware ejecutándose...');
  console.log('📋 Auth header existe:', !!authHeader);
  console.log('🎫 Token existe:', !!token);

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Token válido, usuario:', decoded.email);

    // Obtener información actualizada del usuario desde la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        primaryRole: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      console.log('❌ Usuario no encontrado o inactivo');
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      primaryRole: user.primaryRole
    };

    next();
  } catch (error: any) {
    console.error('❌ Error verificando token:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Mantener compatibilidad con el middleware anterior
export const authenticateToken = authMiddleware;

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.primaryRole)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.primaryRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }

  next();
};