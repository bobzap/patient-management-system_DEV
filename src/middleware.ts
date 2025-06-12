// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuration des routes et leurs permissions
const ROUTE_PERMISSIONS = {
  // Routes publiques (pas d'auth requise)
  public: [
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/auth/forgot-password',
    '/api/auth',
  ],
  
  // Routes protégées par rôle
  admin: [
    '/admin',
    '/api/admin',
  ],
  
  // Routes accessibles aux infirmiers et plus
  infirmier: [
    '/',
    '/patients',
    '/entretiens',
    '/calendar',
    '/api/patients',
    '/api/entretiens',
    '/api/calendar',
    '/api/lists',
  ],
  
  // Routes pour infirmiers chefs et plus
  infirmier_chef: [
    '/reports',
    '/api/reports',
  ],
  
  // Routes pour médecins
  medecin: [
    '/medical',
    '/api/medical',
  ]
}

// Fonction pour vérifier les permissions
function hasPermission(userRole: string, pathname: string): boolean {
  // Routes publiques
  if (ROUTE_PERMISSIONS.public.some(route => pathname.startsWith(route))) {
    return true
  }
  
  // Routes admin
  if (ROUTE_PERMISSIONS.admin.some(route => pathname.startsWith(route))) {
    return userRole === 'ADMIN'
  }
  
  // Routes infirmier chef
  if (ROUTE_PERMISSIONS.infirmier_chef.some(route => pathname.startsWith(route))) {
    return ['ADMIN', 'INFIRMIER_CHEF'].includes(userRole)
  }
  
  // Routes médecin
  if (ROUTE_PERMISSIONS.medecin.some(route => pathname.startsWith(route))) {
    return ['ADMIN', 'MEDECIN'].includes(userRole)
  }
  
  // Routes infirmier (par défaut)
  if (ROUTE_PERMISSIONS.infirmier.some(route => pathname.startsWith(route))) {
    return ['ADMIN', 'INFIRMIER_CHEF', 'INFIRMIER', 'MEDECIN'].includes(userRole)
  }
  
  // Par défaut, refuser l'accès
  return false
}

// Fonction pour gérer les timeouts de session
function checkSessionTimeout(token: any): boolean {
  if (!token?.iat) return false
  
  const now = Math.floor(Date.now() / 1000)
  const sessionAge = now - token.iat
  const maxAge = 4 * 60 * 60 // 4 heures en secondes
  
  return sessionAge < maxAge
}


export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    
    // Vérifier le timeout de session
    if (token && !checkSessionTimeout(token)) {
      // Session expirée, rediriger vers login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('error', 'SessionExpired')
      return NextResponse.redirect(loginUrl)
    }
    
    // Vérifier les permissions de rôle
    if (token && !hasPermission(token.role as string, pathname)) {
      // Pas d'autorisation, rediriger vers une page d'erreur
      const errorUrl = new URL('/auth/error', req.url)
      errorUrl.searchParams.set('error', 'AccessDenied')
      return NextResponse.redirect(errorUrl)
    }
    
    // Vérifier si l'utilisateur est actif
    if (token && !token.isActive) {
      const errorUrl = new URL('/auth/error', req.url)
      errorUrl.searchParams.set('error', 'AccountDeactivated')
      return NextResponse.redirect(errorUrl)
    }
    
    // Logger l'accès pour audit
    if (token && !pathname.startsWith('/api/auth')) {
      // Note: En production, implémenter un système de logging async
      console.log(`Access: ${token.email} -> ${pathname}`)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Routes publiques toujours autorisées
        if (ROUTE_PERMISSIONS.public.some(route => pathname.startsWith(route))) {
          return true
        }
        
        // Pour toutes les autres routes, un token est requis
        return !!token
      }
    }
  }
)

// Configuration des routes à protéger
export const config = {
  matcher: [
    /*
     * Protéger toutes les routes sauf :
     * - api/auth (NextAuth)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - images publiques
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
