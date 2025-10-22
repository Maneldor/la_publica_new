import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

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

        // Aquí iría la validación con tu base de datos
        // Por ahora, validación básica de ejemplo
        if (credentials.email === "admin@lapublica.cat" && credentials.password === "admin123") {
          return {
            id: "1",
            email: credentials.email,
            name: "Administrador",
            role: "admin",
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          provider: account.provider,
          role: user.role || "user",
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        provider: token.provider,
        user: {
          ...session.user,
          role: token.role,
        },
      }
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}