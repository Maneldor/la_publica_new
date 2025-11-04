import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, AdministrationType } from '@prisma/client';
import prisma from '../../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      nick,
      firstName,
      lastName,
      administration,
      avatarInitials,
      avatarColor,
      coverGradient
    } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Check if nick already exists
    if (nick) {
      const existingNick = await prisma.employee.findFirst({
        where: { nick }
      });
      if (existingNick) {
        return res.status(400).json({ error: 'El nick ya está en uso' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          primaryRole: UserRole.EMPLEADO_PUBLICO,
          isActive: true,
          isEmailVerified: false
        }
      });


      // Create employee profile
      const profile = await tx.employee.create({
        data: {
          userId: user.id,
          firstName: firstName || 'Usuario',
          lastName: lastName || 'Nuevo',
          nick,
          community: 'Catalunya',
          administrationType: administration || AdministrationType.AUTONOMICA,
          avatar: JSON.stringify({
            initials: avatarInitials || 'UN',
            color: avatarColor || '#3b82f6'
          }),
          bio: '',
          socialNetworks: JSON.stringify({}),
          privacySettings: JSON.stringify({
            avatar: 'public',
            bio: 'public'
          })
        }
      });

      return { user, profile };
    });

    const { user } = result;

    const token = jwt.sign(
      { id: user.id, email: user.email, primaryRole: user.primaryRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' } // Token dura 30 días
    );

    // Generar refresh token
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '90d' } // Refresh token dura 90 días
    );

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        primaryRole: user.primaryRole
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 Intento de login desde NextAuth:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email o password faltante');
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    try {
      // Intentar buscar usuario en la base de datos
      const user = await prisma.user.findUnique({ where: { email } });

      if (user && user.isActive) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          // Generar token JWT
          const token = jwt.sign(
            { id: user.id, email: user.email, primaryRole: user.primaryRole },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' } // Token dura 30 días
          );

          // Generar refresh token
          const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '90d' } // Refresh token dura 90 días
          );

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          console.log('✅ Login exitoso para:', email);

          return res.json({
            success: true,
            data: {
              id: user.id,
              email: user.email,
              name: user.email,
              role: user.primaryRole,
              communityId: null,
              isActive: user.isActive,
              token: token,
              refreshToken: refreshToken
            }
          });
        }
      }
    } catch (dbError) {
      console.log('⚠️ Error de base de datos, usando usuarios mock:', dbError);
    }

    // Fallback a usuarios mock para desarrollo (COINCIDEN con los del seed)
    const mockUsers = [
      {
        id: "user-admin-mock",
        email: "admin@lapublica.es",
        name: "Admin LaPublica",
        password: "admin123456",
        role: "ADMIN",
        communityId: null,
        isActive: true
      },
      {
        id: "user-empleado-mock",
        email: "empleado@lapublica.cat",
        name: "Joan Martínez",
        password: "empleado123",
        role: "EMPLEADO_PUBLICO",
        communityId: "catalunya",
        isActive: true
      },
      {
        id: "user-empleado1-mock",
        email: "empleado1@lapublica.cat",
        name: "Maria García",
        password: "empleado123",
        role: "EMPLEADO_PUBLICO",
        communityId: "catalunya",
        isActive: true
      }
    ];

    const mockUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!mockUser || !mockUser.isActive) {
      console.log('❌ Credenciales inválidas para:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token JWT para usuario mock
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, primaryRole: mockUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' } // Token dura 30 días
    );

    console.log('✅ Login exitoso (mock) para:', email);

    res.json({
      success: true,
      data: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        communityId: mockUser.communityId,
        isActive: mockUser.isActive,
        token: token
      }
    });

  } catch (error: any) {
    console.error('🔴 Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Generar nuevo token con la misma información
    const newToken = jwt.sign(
      { id: user.id, email: user.email, primaryRole: user.primaryRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' } // Token dura 30 días
    );

    // También generamos un refresh token de larga duración
    const newRefreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '90d' } // Refresh token dura 90 días
    );

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('🔴 Error al refrescar token:', error);
    res.status(500).json({ error: 'Error al refrescar token' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        primaryRole: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.json({ success: true, user: userData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check if nick is available
export const checkNick = async (req: Request, res: Response) => {
  try {
    const { nick } = req.params;

    const existingProfile = await prisma.employee.findFirst({
      where: { nick }
    });

    res.json({ available: !existingProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check if email is available
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    res.json({ available: !existingUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};