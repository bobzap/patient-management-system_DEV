// src/app/api/auth/invite/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET: Valider un token d'invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    // Dans une vraie implémentation, vous chercheriez en base
    // const invitation = await prisma.invitation.findUnique({
    //   where: { token, status: 'PENDING' }
    // })

    // Pour la démo, simulation d'une invitation valide
    const mockInvitation = {
      email: 'test@example.com',
      role: 'INFIRMIER',
      invitedBy: 'admin@vital-sync.ch',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true
    }

    // Vérifier si l'invitation est expirée
    const isExpired = new Date() > new Date(mockInvitation.expiresAt)

    if (isExpired) {
      return NextResponse.json({
        valid: false,
        error: 'Cette invitation a expiré'
      }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      invitation: mockInvitation
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json({
      valid: false,
      error: 'Token d\'invitation invalide'
    }, { status: 400 })
  }
}

// src/app/api/auth/invite/[token]/accept/route.ts
// POST: Accepter une invitation et créer le compte
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const body = await request.json()
    const { name, password } = body

    // Validation des données
    if (!name?.trim() || !password) {
      return NextResponse.json(
        { error: 'Nom et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Dans une vraie implémentation, vous récupéreriez l'invitation
    // const invitation = await prisma.invitation.findUnique({
    //   where: { token, status: 'PENDING' }
    // })

    // Pour la démo
    const mockInvitation = {
      email: 'test@example.com',
      role: 'INFIRMIER',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Vérifier si déjà expiré
    if (new Date() > new Date(mockInvitation.expiresAt)) {
      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.authUser.findUnique({
      where: { email: mockInvitation.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur et son profil
    const newUser = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.authUser.create({
        data: {
          email: mockInvitation.email,
          password: hashedPassword
        }
      })

      // Créer le profil
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          email: mockInvitation.email,
          name: name.trim(),
          role: mockInvitation.role as any,
          isActive: true,
          isWhitelisted: false
        }
      })

      return { user, profile }
    })

    // Logger l'acceptation
    await prisma.authLog.create({
      data: {
        userId: newUser.user.id,
        action: 'INVITATION_ACCEPTED',
        success: true,
        details: {
          token,
          email: mockInvitation.email,
          role: mockInvitation.role
        }
      }
    })

    // Dans une vraie implémentation, marquer l'invitation comme acceptée
    // await prisma.invitation.update({
    //   where: { token },
    //   data: { 
    //     status: 'ACCEPTED',
    //     acceptedAt: new Date()
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: newUser.user.id,
        email: mockInvitation.email,
        name: name.trim(),
        role: mockInvitation.role
      }
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}