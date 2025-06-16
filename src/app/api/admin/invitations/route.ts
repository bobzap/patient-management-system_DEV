// src/app/api/admin/invitations/route.ts - VERSION RÉELLE avec vraie DB
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

// Schéma de validation pour création d'invitation
const createInvitationSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['ADMIN', 'INFIRMIER', 'INFIRMIER_CHEF', 'MEDECIN']),
  customMessage: z.string().optional()
})

// GET: Récupérer toutes les invitations RÉELLES
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    console.log('📋 Récupération des invitations réelles...')

    // 🔧 VRAIE REQUÊTE: Récupérer les tokens d'invitation de la DB
    const invitations = await prisma.invitationToken.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                name: true,
                role: true,
                isActive: true
              }
            }
          }
        },
        creator: {
          select: {
            email: true,
            profile: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ ${invitations.length} invitations trouvées`)

    // Formater les données pour l'interface
    const formattedInvitations = invitations.map(invitation => {
      // Déterminer le statut
      let status = 'PENDING'
      if (invitation.isUsed) {
        status = 'ACCEPTED'
      } else if (invitation.expiresAt < new Date()) {
        status = 'EXPIRED'
      }

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.user?.profile?.role || 'INFIRMIER',
        status,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
        usedAt: invitation.usedAt?.toISOString() || null,
        invitedBy: invitation.creator?.profile?.name || invitation.creator?.email || 'Système',
        // Informations sur l'utilisateur cible
        targetUser: {
          name: invitation.user?.profile?.name,
          isActive: invitation.user?.profile?.isActive,
          hasAccount: !!invitation.user
        }
      }
    })

    return NextResponse.json({
      success: true,
      invitations: formattedInvitations
    })

  } catch (error) {
    console.error('❌ Erreur récupération invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
}

// POST: Créer une nouvelle invitation RÉELLE
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createInvitationSchema.parse(body)

    console.log('🎫 Création d\'invitation pour:', validatedData.email)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.authUser.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Vérifier s'il y a déjà une invitation active
    const activeInvitation = await prisma.invitationToken.findFirst({
      where: {
        email: validatedData.email,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (activeInvitation) {
      return NextResponse.json(
        { error: 'Une invitation active existe déjà pour cet email' },
        { status: 400 }
      )
    }

    // Générer un token sécurisé
    const invitationToken = crypto.randomBytes(32).toString('base64url')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 jours

    // 🔧 CRÉATION RÉELLE: Pas de mock, vraie création en DB
    const newInvitation = await prisma.$transaction(async (tx) => {
      // Créer d'abord l'utilisateur (inactif)
      const user = await tx.authUser.create({
        data: {
          email: validatedData.email,
          password: crypto.randomBytes(32).toString('hex') // Temporaire, sera remplacé
        }
      })

      // Créer le profil (inactif)
      await tx.userProfile.create({
        data: {
          userId: user.id,
          email: validatedData.email,
          name: validatedData.email.split('@')[0], // Nom temporaire
          role: validatedData.role,
          isActive: false, // Inactif jusqu'à l'activation
          isWhitelisted: validatedData.role === 'ADMIN'
        }
      })

      // Créer le token d'invitation
      const invitation = await tx.invitationToken.create({
        data: {
          email: validatedData.email,
          token: invitationToken,
          userId: user.id,
          createdBy: session.user.id,
          expiresAt
        }
      })

      return invitation
    })

    // Logger la création
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_CREATED',
        success: true,
        details: {
          invitedEmail: validatedData.email,
          invitedRole: validatedData.role,
          tokenId: newInvitation.id
        }
      }
    })

    console.log('✅ Invitation créée:', newInvitation.id)

    // URL d'invitation
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/auth/activate?token=${invitationToken}`

    console.log('📧 URL d\'invitation:', inviteUrl)

    return NextResponse.json({
      success: true,
      invitation: {
        id: newInvitation.id,
        email: validatedData.email,
        role: validatedData.role,
        status: 'PENDING',
        token: invitationToken,
        expiresAt: expiresAt.toISOString(),
        createdAt: newInvitation.createdAt.toISOString(),
        invitedBy: session.user.name || session.user.email,
        inviteUrl
      },
      message: 'Invitation créée avec succès'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Erreur création invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'invitation' },
      { status: 500 }
    )
  }
}