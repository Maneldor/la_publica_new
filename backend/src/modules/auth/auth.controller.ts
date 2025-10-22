import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
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
          firstName,
          lastName,
          nick,
          community: 'Catalunya',
          administrationType: administration,
          avatar: JSON.stringify({
            initials: avatarInitials,
            color: avatarColor
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
      { expiresIn: '15m' }
    );

    res.status(201).json({
      success: true,
      token,
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
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, primaryRole: user.primaryRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      token,
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