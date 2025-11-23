import 'express';

// Extendemos la interfaz 'Request' del módulo 'express'
declare module 'express' {
  export interface Request {
    // Definimos la propiedad 'user' que es opcional (puede ser undefined)
    user?: {
      id: string;
      email: string;
      // Este es el campo clave que debe coincidir con el schema.prisma
      primaryRole: string; 
    };
  }
}

// Interfaz para solicitudes que ya han sido autenticadas 
// (se usa a menudo para hacer un 'type guard' o 'casting' en el código).
export interface AuthenticatedRequest extends Request {
  // Aquí se define que 'user' es obligatorio (no undefined) después de la autenticación.
  user: {
    id: string;
    email: string;
    primaryRole: string;
  };
}