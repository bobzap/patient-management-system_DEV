// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateResetToken, validateEmail, logSecurityEvent } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

// Rate limiting simple (en mémoire - pour la production, utilisez Redis)
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const attempts = resetAttempts.get(identifier)
  
  if (!attempts) {
    resetAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset si plus d'une heure
  if (now - attempts.lastAttempt > 60 * 60 * 1000) {
    resetAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  // Maximum 3 tentatives par heure
  if (attempts.count >= 3) {
    return false
  }
  
  attempts.count++
  attempts.lastAttempt = now
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Récupération des headers pour le logging sécurisé
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    
    console.log('🔐 Demande de reset de mot de passe depuis:', ip)
    
    // Parsing du body
    const body = await request.json()
    const { email } = body
    
    // Validation de base
    if (!email || typeof email !== 'string') {
      logSecurityEvent('INVALID_RESET_REQUEST', 'no-email', ip, userAgent)
      return NextResponse.json(
        { error: 'Email requis' }, 
        { status: 400 }
      )
    }
    
    const cleanEmail = email.toLowerCase().trim()
    
    // Validation format email
    if (!validateEmail(cleanEmail)) {
      logSecurityEvent('INVALID_EMAIL_FORMAT', cleanEmail, ip, userAgent)
      return NextResponse.json(
        { error: 'Format d\'email invalide' }, 
        { status: 400 }
      )
    }
    
    // Rate limiting par IP
    if (!checkRateLimit(ip)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', cleanEmail, ip, userAgent)
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une heure.' }, 
        { status: 429 }
      )
    }
    
    // Rate limiting par email
    if (!checkRateLimit(`email:${cleanEmail}`)) {
      logSecurityEvent('EMAIL_RATE_LIMIT_EXCEEDED', cleanEmail, ip, userAgent)
      return NextResponse.json(
        { error: 'Trop de tentatives pour cet email. Réessayez dans une heure.' }, 
        { status: 429 }
      )
    }
    
    // Recherche de l'utilisateur
    const user = await prisma.authUser.findUnique({
      where: { email: cleanEmail },
      select: { 
        id: true, 
        email: true,
        profile: {
          select: {
            isActive: true,
            name: true
          }
        }
      }
    })
    
    // ⚠️ IMPORTANT: Pour la sécurité, on renvoie toujours le même message
    // que l'utilisateur existe ou non (évite l'énumération d'emails)
    const successMessage = "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes."
    
    if (!user) {
      logSecurityEvent('RESET_REQUEST_UNKNOWN_EMAIL', cleanEmail, ip, userAgent)
      // On attend un peu pour simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json({ message: successMessage })
    }
    
    if (!user.profile?.isActive) {
      logSecurityEvent('RESET_REQUEST_INACTIVE_USER', cleanEmail, ip, userAgent)
      return NextResponse.json(
        { error: 'Compte désactivé. Contactez l\'administrateur.' }, 
        { status: 403 }
      )
    }
    
    // Génération du token de reset
    const resetToken = generateResetToken(user.id, user.email)
    
    // Envoi de l'email
    await sendPasswordResetEmail(user.email, resetToken)
    
    logSecurityEvent('RESET_EMAIL_SENT', cleanEmail, ip, userAgent)
    
    console.log(`✅ Email de reset envoyé à ${user.email}`)
    
    return NextResponse.json({ 
      message: successMessage
    })
    
  } catch (error) {
    console.error('❌ Erreur API forgot-password:', error)
    
    // Log de l'erreur pour le monitoring
    logSecurityEvent('RESET_REQUEST_ERROR', 'system-error', 'unknown', 'unknown')
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}

// Méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' }, 
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' }, 
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' }, 
    { status: 405 }
  )
}