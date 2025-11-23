import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// NOTA: Se asume que el archivo src/types/express.d.ts proporciona la interfaz Request.user con primaryRole.
// Si el token aún usa 'role' internamente, lo mapeamos a 'primaryRole'.
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

// Definición para la carga útil decodificada (asumiendo que el token tiene estos campos)
interface DecodedToken {
  id: string;
  email: string;
  // ASUMIMOS que el campo en el token JWT se llama 'role' o 'primaryRole'.
  // Para compatibilidad y según tu schema.prisma, usaremos 'primaryRole' para la asignación.
  role?: string; // Podría ser 'role' si tu token aún lo genera así
  primaryRole?: string; // O 'primaryRole' si el token lo genera así
}


export const adminAuth = async (
  req: Request, // Usamos Request global, ya extendida por express.d.ts
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtenir token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7); // Treure "Bearer "

    // Verificar token
    // Se utiliza 'as any' para permitir el acceso temporal a las propiedades antes de la verificación
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // DETERMINAR EL ROL ASIGNADO EN EL TOKEN
    const assignedRole = decoded.primaryRole || decoded.role; // Intenta usar primaryRole, si no, usa role.

    if (!assignedRole) {
        return res.status(401).json({
            success: false,
            error: 'Token is missing role information.'
        });
    }

    // LISTA DE ROLES DE ADMINISTRACIÓN permitidos (de tu schema.prisma UserRole enum)
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'GESTOR_EMPRESAS', 'GESTOR_ADMINISTRACIONES', 'GESTOR_CONTENIDO'];

    // Verificar que sea admin
    if (!adminRoles.includes(assignedRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Admin access required.'
      });
    }

    // Afegir user info a la request
    // CORRECCIÓN CLAVE: ASIGNAMOS A primaryRole para cumplir con express.d.ts
    req.user = {
      id: decoded.id,
      email: decoded.email,
      primaryRole: assignedRole // <-- CORREGIDO
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};