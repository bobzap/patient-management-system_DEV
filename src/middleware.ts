// src/middleware.ts - Version corrigée pour les fichiers statiques
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
    '/auth/reset-password',  // 🔧 AJOUTEZ CETTE LIGNE
    '/auth/invite',
    '/auth/activate',  // 🔧 AJOUT: Page d'activation
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

// 🔧 AJOUT: Routes à ne pas logger pour éviter le spam
const SILENT_ROUTES = [
  '/api/patients',
  '/api/entretiens',
  '/api/calendar',
  '/api/lists',
  '/_next',
  '/favicon.ico',
  '/images',
  // 🔧 AJOUT: Fichiers statiques à ne pas logger
  '/logo-amarre.png',
  '/vital-sync-logo.png',
  '/robots.txt',
  '/sitemap.xml'
]

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

// 🔧 AJOUT: Fonction pour déterminer si on doit logger
function shouldLog(pathname: string): boolean {
  // Ne pas logger les routes fréquentes pour éviter le spam
  return !SILENT_ROUTES.some(route => pathname.startsWith(route))
}

// 🔧 AJOUT: Fonction pour vérifier si c'est un fichier statique
function isStaticFile(pathname: string): boolean {
  // Vérifier les extensions de fichiers statiques
  const staticExtensions = /\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot|map)$/i
  return staticExtensions.test(pathname)
}

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    
    // 🔧 NOUVEAU: Permettre l'accès aux fichiers statiques sans auth
    if (isStaticFile(pathname)) {
      return NextResponse.next()
    }
    
   // Vérifier le timeout de session
if (token && !checkSessionTimeout(token)) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏰ Session expirée`)
  }
  const loginUrl = new URL('/auth/login', req.url)
  loginUrl.searchParams.set('error', 'SessionExpired')
  return NextResponse.redirect(loginUrl)
}

// Vérifier les permissions de rôle
if (token && !hasPermission(token.role as string, pathname)) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚫 Accès refusé: ${pathname}`)
  }
  const errorUrl = new URL('/auth/error', req.url)
  errorUrl.searchParams.set('error', 'AccessDenied')
  return NextResponse.redirect(errorUrl)
}
    
    // Vérifier si l'utilisateur est actif
    if (token && !token.isActive) {
      console.log(`⛔ Compte désactivé: ${token.email}`)
      const errorUrl = new URL('/auth/error', req.url)
      errorUrl.searchParams.set('error', 'AccountDeactivated')
      return NextResponse.redirect(errorUrl)
    }
    
    // 🔧 CORRECTION: Logger seulement les accès importants
    if (token && shouldLog(pathname)) {
      // En développement, masquer partiellement l'email
      const maskedEmail = process.env.NODE_ENV === 'development' 
        ? token.email.substring(0, 3) + '***@' + token.email.split('@')[1]
        : token.email
      
      console.log(`🔐 ${maskedEmail} -> ${pathname}`)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // 🔧 NOUVEAU: Autoriser les fichiers statiques
        if (isStaticFile(pathname)) {
          return true
        }
        
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
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico
     * - images/ (dossier images publiques)
     * - Fichiers avec extensions statiques (gérés par isStaticFile)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}