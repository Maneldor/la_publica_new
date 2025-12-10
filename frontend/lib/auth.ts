import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { prismaClient } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Función para generar JWT duradero compatible con el backend
const generateBackendJWT = (user: any) => {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';

  // Mapear roles del frontend de vuelta al backend
  let backendRole = user.role;
  if (user.role === 'SUPER_ADMIN') {
    backendRole = 'SUPER_ADMIN';
  } else if (user.role === UserRole.COMPANY) {
    backendRole = 'EMPRESA';
  } else if (user.role === UserRole.COMPANY_MANAGER) {
    backendRole = 'GESTOR_EMPRESAS';
  } else if (user.role === UserRole.PUBLIC_EMPLOYEE) {
    backendRole = 'EMPLEADO';
  } else if (user.role === UserRole.ADMIN) {
    backendRole = 'ADMIN';
  }

  const payload = {
    // Campos que espera el backend middleware
    id: user.id,
    email: user.email,
    primaryRole: backendRole, // El backend usa 'primaryRole'
    // Campos adicionales para compatibilidad
    userId: user.id,
    role: backendRole,
    communityId: user.communityId,
    name: user.name,
    isActive: user.isActive
  };

  // Token duradero: 30 días
  return jwt.sign(payload, secret, {
    expiresIn: '30d',
    issuer: 'lapublica-frontend',
    audience: 'lapublica-backend'
  });
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "exemple@lapublica.cat"
        },
        password: {
          label: "Contrasenya",
          type: "password"
        }
      },
      async authorize(credentials, req) {
        console.log('🔵 [AUTHORIZE] Iniciando autenticación');
        console.log('🔵 [AUTHORIZE] Email recibido:', credentials?.email);

        // Validación básica
        if (!credentials?.email || !credentials?.password) {
          console.log('🔴 [AUTHORIZE] Credenciales incompletas');
          return null;
        }

        try {
          console.log('🔵 [AUTHORIZE] Consultando Prisma para:', credentials.email);

          // Buscar usuario en la base de datos
          const user = await prismaClient.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              ownedCompany: true,
              memberCompany: true
            }
          });

          console.log('🔵 [AUTHORIZE] Usuario encontrado:', !!user);

          // Si no existe el usuario
          if (!user) {
            console.log('❌ Usuario no encontrado:', credentials.email);
            return null;
          }

          console.log('🔵 [AUTHORIZE] Datos del usuario:');
          console.log('  - ID:', user.id);
          console.log('  - Email:', user.email);
          console.log('  - Name:', user.name);
          console.log('  - Role:', user.role);
          console.log('  - UserType:', user.userType);
          console.log('  - Tiene password:', !!user.password);

          // Si el usuario no tiene password (OAuth only)
          if (!user.password) {
            console.log('❌ Usuario sin contraseña (OAuth only):', credentials.email);
            return null;
          }

          console.log('🔵 [AUTHORIZE] Verificando contraseña con bcrypt...');

          // Validar contraseña con bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔵 [AUTHORIZE] Resultado bcrypt:', isValidPassword);

          if (!isValidPassword) {
            console.log('❌ Contraseña incorrecta para:', credentials.email);
            return null;
          }

          // Usuario autenticado correctamente
          console.log('✅ Usuario autenticado:', user.email);

          // Determinar el rol - priorizar campo 'role' si existe, sino usar 'userType'
          let role = 'USER';

          // Usar el campo 'role' directament si existeix i és vàlid
          const validRoles = [
            'SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO',
            'CRM_COMERCIAL', 'CRM_CONTINGUT',
            'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE',
            'MODERATOR', 'COMPANY', 'USER'
          ];

          if (user.role && validRoles.includes(user.role)) {
            role = user.role;
          } else if (user.userType) {
            // Fallback a userType per compatibilitat legacy
            switch (user.userType) {
              case 'ADMIN':
                role = 'ADMIN';
                break;
              case 'ACCOUNT_MANAGER':
                // Els Account Managers ara són CRM_COMERCIAL
                role = 'CRM_COMERCIAL';
                break;
              case 'COMPANY_OWNER':
                role = 'COMPANY';
                break;
              case 'COMPANY_MEMBER':
                role = 'COMPANY';
                break;
              case 'EMPLOYEE':
                role = 'USER';
                break;
              default:
                role = 'USER';
            }
          }

          console.log('🔵 [AUTHORIZE] Rol asignado:', role);

          // Determinar companyId según el tipo de usuario
          let companyId = null;

          if (user.ownedCompanyId) {
            companyId = user.ownedCompanyId;
          } else if (user.memberCompanyId) {
            companyId = user.memberCompanyId;
          } else if (user.userType === 'ACCOUNT_MANAGER') {
            // Para Account Managers, buscar la primera empresa que gestionan
            const managedCompany = await prismaClient.company.findFirst({
              where: {
                accountManagerId: user.id
              },
              select: {
                id: true
              }
            });
            if (managedCompany) {
              companyId = managedCompany.id;
            }
          }

          console.log('🔵 [AUTHORIZE] CompanyId asignado:', companyId);

          // Retornar usuario en formato compatible con NextAuth
          const legacyBackendToken = (user as any).backendToken;
          const legacyBackendRefreshToken = (user as any).backendRefreshToken;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: role as UserRole,
            userType: user.userType, // Añadir userType
            image: user.image,
            companyId,
            communityId: user.communityId ?? undefined,
            isActive: user.isActive ?? true,
            apiToken: legacyBackendToken ?? undefined,
            backendToken: legacyBackendToken ?? undefined,
            backendRefreshToken: legacyBackendRefreshToken ?? undefined
          };

        } catch (error) {
          console.error('🔴 [AUTHORIZE] Error crítico:', error);
          console.error('🔴 [AUTHORIZE] Stack:', error instanceof Error ? error.stack : 'No stack');
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Primera vez que el usuario se autentica
      if (user) {
        // Para OAuth providers, necesitamos buscar/crear el usuario en DB
        if (account?.provider === "google" || account?.provider === "github") {
          // TODO: Implementar búsqueda/creación en DB
          // const dbUser = await prisma.user.findUnique({
          //   where: { email: user.email! },
          //   select: { id: true, email: true, name: true, role: true, communityId: true, isActive: true }
          // });

          // if (!dbUser) {
          //   // Crear nuevo usuario con rol USER por defecto
          //   dbUser = await prisma.user.create({
          //     data: {
          //       email: user.email!,
          //       name: user.name,
          //       role: UserRole.USER,
          //       isActive: true
          //     }
          //   });
          // }

          // Mock para OAuth - REMOVER EN PRODUCCIÓN
          token.role = UserRole.USER;
          token.communityId = undefined;
          token.isActive = true;

          // Generar token JWT duradero para OAuth users
          const backendJWT = generateBackendJWT({
            id: user.id,
            email: user.email,
            name: user.name,
            role: UserRole.USER,
            communityId: undefined,
            isActive: true
          });
          token.apiToken = backendJWT;
        } else {
          // Para credentials provider, ya tenemos los datos del usuario
          token.role = user.role;
          token.userType = (user as any).userType; // Añadir userType
          token.communityId = (user as any).communityId;
          token.isActive = (user as any).isActive;
          (token as any).companyId = (user as any).companyId;

          // Si ya tiene token del backend, usarlo; si no, generar uno nuevo
          const legacyBackendToken = (user as any).backendToken;
          const legacyBackendRefreshToken = (user as any).backendRefreshToken;

          if (legacyBackendToken) {
            token.apiToken = legacyBackendToken;
          } else {
            // Generar token JWT duradero
            const backendJWT = generateBackendJWT(user);
            token.apiToken = backendJWT;
          }

          token.backendRefreshToken = legacyBackendRefreshToken;
        }

        token.accessToken = account?.access_token;
        token.provider = account?.provider;
      }

      return token;
    },

    async session({ session, token }) {
      // Inyectar datos del token en la session
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.userType = token.userType; // Añadir userType
        session.user.communityId = token.communityId;
        session.user.isActive = token.isActive;
        session.user.companyId = (token as any).companyId;

        // Exponer el token JWT duradero para el API
        session.user.apiToken = token.apiToken as string;
        session.user.backendRefreshToken = token.backendRefreshToken;
      }

      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;

      return session;
    },
    async signIn({ user, account, profile }) {
      // Lógica personalizada para el login
      // Aquí puedes validar contra tu base de datos

      if (account?.provider === "google" || account?.provider === "github") {
        // Permitir OAuth providers
        return true
      }

      if (account?.provider === "credentials") {
        // Ya validado en authorize()
        return true
      }

      return false
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });

      // Si viene con callbackUrl específico, respetarlo
      if (url.includes('callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrl && callbackUrl.startsWith('/')) {
          return `${baseUrl}${callbackUrl}`;
        }
      }

      // Permite redirecciones a rutas relativas o del mismo origen
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Permite callback URLs en el mismo origen
      else if (new URL(url).origin === baseUrl) return url
      // Por defecto, ir al dashboard de empresa para usuarios de empresa
      return `${baseUrl}/empresa/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    // Sesión duradera: 30 días
    maxAge: 30 * 24 * 60 * 60, // 30 días en segundos
    updateAge: 24 * 60 * 60, // Actualizar cada 24 horas
  },
  jwt: {
    // JWT duradero: 30 días
    maxAge: 30 * 24 * 60 * 60, // 30 días en segundos
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.lapublica.cat' : undefined,
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}