/**
 * Middleware de Autenticación con NextAuth
 * Next.js 14 - Protege rutas y maneja redirecciones por rol
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware principal integrado con NextAuth
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rutas públicas que no requieren autenticación
  const isPublicPath = path === '/login' ||
                       path === '/register' ||
                       path === '/' ||
                       path.startsWith('/api/auth')

  // Obtener token de NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  console.log(`🔍 [MIDDLEWARE] Ruta: ${path}, Token: ${!!token}, Público: ${isPublicPath}`)
  if (token) {
    console.log(`👤 [MIDDLEWARE] Usuario: ${token.email} (${token.role})`)
  }

  // Si no hay token y la ruta es privada → redirigir a login
  if (!token && !isPublicPath) {
    console.log(`🚫 [MIDDLEWARE] Sin token, redirigiendo a login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token y está en login → redirigir según rol
  if (token && path === '/login') {
    const role = token.role as string
    console.log(`🔄 [MIDDLEWARE] Usuario logueado en /login, redirigiendo por rol: ${role}`)

    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (role === 'COMPANY_MANAGER') {
      return NextResponse.redirect(new URL('/gestor-empreses/dashboard', request.url))
    } else if (role === 'COMPANY') {
      return NextResponse.redirect(new URL('/empresa/dashboard', request.url))
    } else if (role === 'PUBLIC_EMPLOYEE') {
      return NextResponse.redirect(new URL('/empleat/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Verificar permisos por rol
  if (token) {
    const role = token.role as string

    // Solo ADMIN puede acceder a /admin
    if (path.startsWith('/admin') && role !== 'ADMIN') {
      console.log(`🚫 [MIDDLEWARE] Acceso denegado: ${role} no puede acceder a ${path}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Solo COMPANY_MANAGER puede acceder a /gestor-empreses
    if (path.startsWith('/gestor-empreses') && role !== 'COMPANY_MANAGER') {
      console.log(`🚫 [MIDDLEWARE] Acceso denegado: ${role} no puede acceder a ${path}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Solo COMPANY puede acceder a /empresa
    if (path.startsWith('/empresa') && role !== 'COMPANY') {
      console.log(`🚫 [MIDDLEWARE] Acceso denegado: ${role} no puede acceder a ${path}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Solo PUBLIC_EMPLOYEE puede acceder a /empleat
    if (path.startsWith('/empleat') && role !== 'PUBLIC_EMPLOYEE') {
      console.log(`🚫 [MIDDLEWARE] Acceso denegado: ${role} no puede acceder a ${path}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log(`✅ [MIDDLEWARE] Acceso permitido: ${token.email} → ${path}`)
  }

  return NextResponse.next()
}

/**
 * Configuración del matcher para aplicar el middleware
 */
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - Archivos estáticos (_next/static, _next/image, favicon.ico)
     * - API routes de NextAuth
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}