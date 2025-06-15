// src/app/api/auth/activate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schéma de validation pour l'activation
const activationSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

// GET: Vérifier la validité d'un token d'invitation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Vérifier le token
    const invitation = await prisma.invitationToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 404 }
      )
    }

    // Vérifier si le token est expiré
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expiré' },
        { status: 410 }
      )
    }

    // Vérifier si le token a déjà été utilisé
    if (invitation.isUsed) {
      return NextResponse.json(
        { success: false, error: 'Token déjà utilisé' },
        { status: 410 }
      )
    }

    // Token valide
    return NextResponse.json({
      success: true,
      user: {
        email: invitation.user.email,
        name: invitation.user.profile?.name || '',
        role: invitation.user.profile?.role || 'INFIRMIER'
      },
      expiresAt: invitation.expiresAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur vérification token:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST: Activer un compte avec un token d'invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Tentative d\'activation avec token')
    
    const validatedData = activationSchema.parse(body)

    // Vérifier le token
    const invitation = await prisma.invitationToken.findUnique({
      where: { token: validatedData.token },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Token d\'invitation invalide' },
        { status: 404 }
      )
    }

    // Vérifications de sécurité
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Le lien d\'invitation a expiré' },
        { status: 410 }
      )
    }

    if (invitation.isUsed) {
      return NextResponse.json(
        { success: false, error: 'Ce lien d\'invitation a déjà été utilisé' },
        { status: 410 }
      )
    }

    // Validation du mot de passe (sécurité renforcée)
    const passwordValidation = validatePassword(validatedData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe non conforme', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Activer le compte dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le mot de passe et activer le compte
      const updatedUser = await tx.authUser.update({
        where: { id: invitation.userId },
        data: {
          password: hashedPassword
        }
      })

      // Activer le profil utilisateur
      const updatedProfile = await tx.userProfile.update({
        where: { userId: invitation.userId },
        data: {
          isActive: true,
          lastLogin: new Date()
        }
      })

      // Marquer le token comme utilisé
      await tx.invitationToken.update({
        where: { id: invitation.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })

      // Logger l'activation
      await tx.authLog.create({
        data: {
          userId: invitation.userId,
          action: 'ACCOUNT_ACTIVATED',
          success: true,
          details: {
            activationMethod: 'invitation_token',
            activatedAt: new Date().toISOString()
          }
        }
      })

      return { user: updatedUser, profile: updatedProfile }
    })

    console.log('✅ Compte activé avec succès:', result.user.email)

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.profile.name,
        role: result.profile.role,
        isActive: result.profile.isActive
      }
    })

  } catch (error) {
    console.error('❌ Erreur activation compte:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'activation du compte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Fonction de validation de mot de passe renforcée
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }
  
  // Vérifier que le mot de passe n'est pas trop commun
  const commonPasswords = ['password', '123456', 'azerty', 'qwerty', 'admin', 'password123']
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop commun')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}