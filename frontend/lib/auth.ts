import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from '@/lib/permissions'
import jwt from 'jsonwebtoken'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Función para generar JWT duradero compatible con el backend
const generateBackendJWT = (user: any) => {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';

  // Mapear roles del frontend de vuelta al backend
  let backendRole = user.role;
  if (user.role === UserRole.COMPANY) {
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Validar contra el backend
          const res = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          if (res.ok) {
            const data = await res.json();

            if (data.success && data.data) {
              // Guardar tokens en localStorage para persistencia
              if (typeof window !== 'undefined') {
                localStorage.setItem('lapublica_token', data.data.token);
                localStorage.setItem('lapublica_refresh_token', data.data.refreshToken || '');
              }

              // Mapear roles del backend al frontend
              let frontendRole = data.data.role;
              if (data.data.role === 'EMPRESA') {
                frontendRole = UserRole.COMPANY;
              } else if (data.data.role === 'GESTOR_EMPRESAS') {
                frontendRole = UserRole.COMPANY_MANAGER;
              } else if (data.data.role === 'EMPLEADO') {
                frontendRole = UserRole.PUBLIC_EMPLOYEE;
              } else if (data.data.role === 'ADMIN') {
                frontendRole = UserRole.ADMIN;
              }

              return {
                id: data.data.id,
                email: data.data.email,
                name: data.data.name || data.data.email,
                role: frontendRole,
                communityId: data.data.communityId,
                isActive: data.data.isActive !== false,
                backendToken: data.data.token, // JWT del backend
                backendRefreshToken: data.data.refreshToken // Refresh token del backend
              };
            }
          } else {
            console.error('Backend auth falló:', res.status, res.statusText);
            // NO retornar null aquí - continuar al fallback
          }
        } catch (error) {
          console.error('Error conectando con backend:', error);
        }

        // Fallback a usuarios mock para desarrollo (SIEMPRE se ejecuta si backend falla)
        console.log('🔄 Usando fallback de usuarios mock para desarrollo');
        const mockUsers = [
          {
            id: "1",
            email: "superadmin@lapublica.com",
            name: "Super Administrador",
            password: "super123",
            role: UserRole.SUPER_ADMIN,
            communityId: undefined,
            isActive: true
          },
          {
            id: "2",
            email: "admin@lapublica.com",
            name: "Administrador",
            password: "admin123",
            role: UserRole.ADMIN,
            communityId: undefined,
            isActive: true
          },
          {
            id: "3",
            email: "manager@barcelona.com",
            name: "Community Manager Barcelona",
            password: "manager123",
            role: UserRole.COMMUNITY_MANAGER,
            communityId: "barcelona",
            isActive: true
          },
          {
            id: "4",
            email: "moderator@barcelona.com",
            name: "Moderador Barcelona",
            password: "mod123",
            role: UserRole.MODERATOR,
            communityId: "barcelona",
            isActive: true
          },
          {
            id: "5",
            email: "user@lapublica.com",
            name: "Usuario Normal",
            password: "user123",
            role: UserRole.USER,
            communityId: undefined,
            isActive: true
          },
          // Gestores reales del backend para testing
          {
            id: "cmhdlcjmz0000hwn5cy1l5shi",
            email: "gestor@lapublica.es",
            name: "Gestor Comercial",
            password: "gestor123",
            role: UserRole.COMPANY_MANAGER,
            communityId: undefined,
            isActive: true
          },
          {
            id: "cmhdmyx6z0000hwyqojppwc9i",
            email: "gestor1@lapublica.es",
            name: "Marc García",
            password: "gestor123",
            role: UserRole.COMPANY_MANAGER,
            communityId: undefined,
            isActive: true
          },
          {
            id: "cmhdmyxu30002hwyqd9y784x4",
            email: "gestor2@lapublica.es",
            name: "Laura Martínez",
            password: "gestor123",
            role: UserRole.COMPANY_MANAGER,
            communityId: undefined,
            isActive: true
          },
          {
            id: "cmhdmyxyf0004hwyqofwk74zj",
            email: "gestor3@lapublica.es",
            name: "Joan Sánchez",
            password: "gestor123",
            role: UserRole.COMPANY_MANAGER,
            communityId: undefined,
            isActive: true
          },
          // Usuarios de empresa
          {
            id: "empresa1",
            email: "empresa@lapublica.es",
            name: "Tech Solutions BCN",
            password: "empresa123",
            role: UserRole.COMPANY,
            communityId: undefined,
            isActive: true
          },
          // Empleados públicos
          {
            id: "empleado1",
            email: "empleado@lapublica.es",
            name: "Maria García - Empleado Público",
            password: "empleado123",
            role: UserRole.PUBLIC_EMPLOYEE,
            communityId: "barcelona",
            isActive: true
          }
        ];

        const user = mockUsers.find(u =>
          u.email === credentials.email && u.password === credentials.password
        );

        if (user && user.isActive) {
          console.log('✅ Usuario mock encontrado:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            communityId: user.communityId,
            isActive: user.isActive
          }
        }

        console.log('❌ Credenciales no coinciden con usuarios mock');
        return null;
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
          token.communityId = user.communityId;
          token.isActive = user.isActive;

          // Si ya tiene token del backend, usarlo; si no, generar uno nuevo
          if (user.backendToken) {
            token.apiToken = user.backendToken;
          } else {
            // Generar token JWT duradero
            const backendJWT = generateBackendJWT(user);
            token.apiToken = backendJWT;
          }

          token.backendRefreshToken = user.backendRefreshToken;
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
        session.user.communityId = token.communityId;
        session.user.isActive = token.isActive;

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
      // Permite redirecciones a rutas relativas o del mismo origen
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Permite callback URLs en el mismo origen
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
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
  secret: process.env.NEXTAUTH_SECRET,
}