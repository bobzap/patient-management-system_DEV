// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateResetToken, logSecurityEvent } from '@/lib/tokens'

// Validation du mot de passe
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins une minuscule' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins une majuscule' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins un chiffre' }
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { valid: false, error: 'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)' }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Récupération des headers pour le logging
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    
    console.log('🔐 Tentative de reset de mot de passe depuis:', ip)
    
    // Parsing du body
    const body = await request.json()
    const { token, password, confirmPassword } = body
    
    // Validation de base
    if (!token || !password || !confirmPassword) {
      logSecurityEvent('INVALID_RESET_DATA', 'missing-fields', ip, userAgent)
      return NextResponse.json(
        { error: 'Token, mot de passe et confirmation requis' }, 
        { status: 400 }
      )
    }
    
    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      logSecurityEvent('PASSWORD_MISMATCH', 'password-mismatch', ip, userAgent)
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' }, 
        { status: 400 }
      )
    }
    
    // Validation de la force du mot de passe
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      logSecurityEvent('WEAK_PASSWORD', 'weak-password', ip, userAgent)
      return NextResponse.json(
        { error: passwordValidation.error }, 
        { status: 400 }
      )
    }
    
    // Validation du token
    const tokenValidation = validateResetToken(token)
    if (!tokenValidation.valid || !tokenValidation.payload) {
      logSecurityEvent('INVALID_RESET_TOKEN', tokenValidation.payload?.email || 'unknown', ip, userAgent)
      return NextResponse.json(
        { error: tokenValidation.error || 'Token invalide' }, 
        { status: 400 }
      )
    }
    
    const { userId, email } = tokenValidation.payload
    
    // Vérification que l'utilisateur existe encore et est actif
    const user = await prisma.authUser.findUnique({
      where: { id: userId },
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
    
    if (!user) {
      logSecurityEvent('RESET_USER_NOT_FOUND', email, ip, userAgent)
      return NextResponse.json(
        { error: 'Utilisateur introuvable' }, 
        { status: 404 }
      )
    }
    
    if (!user.profile?.isActive) {
      logSecurityEvent('RESET_INACTIVE_USER', email, ip, userAgent)
      return NextResponse.json(
        { error: 'Compte désactivé. Contactez l\'administrateur.' }, 
        { status: 403 }
      )
    }
    
    // Vérification que l'email du token correspond à l'utilisateur
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      logSecurityEvent('EMAIL_MISMATCH', email, ip, userAgent)
      return NextResponse.json(
        { error: 'Token invalide pour cet utilisateur' }, 
        { status: 400 }
      )
    }
    
    // Hachage du nouveau mot de passe
    const saltRounds = 12 // Plus sécurisé que 10 pour une app médicale
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Mise à jour du mot de passe en base
    await prisma.authUser.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        // Optionnel: forcer la déconnexion de toutes les sessions
        // sessionVersion: new Date() // Si vous avez ce champ
      }
    })
    
    logSecurityEvent('PASSWORD_RESET_SUCCESS', email, ip, userAgent)
    
    console.log(`✅ Mot de passe réinitialisé avec succès pour ${email}`)
    
    return NextResponse.json({ 
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    })
    
  } catch (error) {
    console.error('❌ Erreur API reset-password:', error)
    
    logSecurityEvent('RESET_PASSWORD_ERROR', 'system-error', 'unknown', 'unknown')
    
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