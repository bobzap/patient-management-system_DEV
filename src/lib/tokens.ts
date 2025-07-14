// src/lib/tokens.ts
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

// Configuration des tokens
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || '7159f7e59f94b7c7ba01ad4d21dcfb8018c4510a31fc14b1b03b9f3717284dd1'
const RESET_TOKEN_EXPIRY = '15m' // 15 minutes pour la sécurité

export interface ResetTokenPayload {
  userId: string
  email: string
  type: 'password-reset'
  iat?: number
  exp?: number
}

export interface TokenValidationResult {
  valid: boolean
  payload?: ResetTokenPayload
  error?: string
}

/**
 * Génère un token JWT sécurisé pour la réinitialisation de mot de passe
 */
export function generateResetToken(userId: string, email: string): string {
  try {
    // Payload avec informations minimales nécessaires
    const payload: ResetTokenPayload = {
      userId,
      email: email.toLowerCase().trim(),
      type: 'password-reset'
    }

    // Génération du token avec expiration courte
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: RESET_TOKEN_EXPIRY,
      issuer: 'vital-sync',
      audience: 'vital-sync-users',
      algorithm: 'HS256'
    })

    console.log(`🔐 Token de reset généré pour ${email} (expire dans ${RESET_TOKEN_EXPIRY})`)
    return token

  } catch (error) {
    console.error('❌ Erreur génération token:', error)
    throw new Error('Erreur lors de la génération du token')
  }
}

/**
 * Valide et décode un token de réinitialisation
 */
export function validateResetToken(token: string): TokenValidationResult {
  try {
    // Vérification et décodage du token
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'vital-sync',
      audience: 'vital-sync-users',
      algorithms: ['HS256']
    }) as ResetTokenPayload

    // Vérifications supplémentaires
    if (!decoded.userId || !decoded.email || decoded.type !== 'password-reset') {
      return {
        valid: false,
        error: 'Token invalide: données manquantes ou incorrectes'
      }
    }

    console.log(`✅ Token valide pour ${decoded.email}`)
    return {
      valid: true,
      payload: decoded
    }

  } catch (error) {
    console.error('❌ Token invalide:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: 'Token expiré. Demandez un nouveau lien de réinitialisation.'
      }
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: 'Token invalide ou corrompu.'
      }
    }

    return {
      valid: false,
      error: 'Erreur de validation du token.'
    }
  }
}

/**
 * Génère un token aléatoire sécurisé (alternative aux JWT)
 * Utile si vous préférez stocker les tokens en base de données
 */
export function generateSecureRandomToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Extrait le token depuis une URL
 */
export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const tokenIndex = pathParts.findIndex(part => part === 'reset-password') + 1
    
    if (tokenIndex > 0 && tokenIndex < pathParts.length) {
      return pathParts[tokenIndex]
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Vérifie si un email est valide
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim().toLowerCase())
}

/**
 * Log de sécurité pour tracer les tentatives de reset
 */
export function logSecurityEvent(event: string, email: string, ip?: string, userAgent?: string) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    email,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown'
  }
  
  console.log(`🔒 [SECURITY] ${JSON.stringify(logEntry)}`)
  
  // TODO: En production, envoyer vers un système de logs centralisé
  // comme Winston, Sentry, ou un service de monitoring
}

/**
 * Constantes de sécurité
 */
export const SECURITY_CONSTANTS = {
  MAX_RESET_ATTEMPTS_PER_HOUR: 3,
  MAX_RESET_ATTEMPTS_PER_DAY: 10,
  TOKEN_EXPIRY_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_SPECIAL_CHARS: true
} as const