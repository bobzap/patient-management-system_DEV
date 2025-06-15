// src/app/api/admin/invitations/route.ts
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

// GET: Récupérer toutes les invitations (Admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Note: Pour cet exemple, nous simulons des invitations
    // Dans une vraie implémentation, vous auriez une table `invitations`
    const mockInvitations = [
      {
        id: '1',
        email: 'infirmier.test@example.com',
        role: 'INFIRMIER',
        status: 'PENDING',
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        invitedBy: session.user.email
      },
      {
        id: '2',
        email: 'medecin.test@example.com',
        role: 'MEDECIN',
        status: 'ACCEPTED',
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: session.user.email,
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      invitations: mockInvitations
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
}

// POST: Créer une nouvelle invitation (Admin uniquement)
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

    // Générer un token sécurisé
    const invitationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    // Dans une vraie implémentation, vous stockeriez ceci en base
    const newInvitation = {
      id: crypto.randomUUID(),
      email: validatedData.email,
      role: validatedData.role,
      status: 'PENDING' as const,
      token: invitationToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      invitedBy: session.user.email,
      customMessage: validatedData.customMessage
    }

    // Envoyer l'email d'invitation
    try {
      await sendInvitationEmail(
        validatedData.email,
        validatedData.role,
        invitationToken,
        validatedData.customMessage
      )
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Continuer même si l'email échoue pour permettre le test
    }

    // Logger la création
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_CREATED',
        success: true,
        details: {
          invitedEmail: validatedData.email,
          invitedRole: validatedData.role,
          token: invitationToken
        }
      }
    })

    return NextResponse.json({
      success: true,
      invitation: newInvitation,
      message: 'Invitation créée et envoyée avec succès'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'invitation' },
      { status: 500 }
    )
  }
}

// Fonction pour envoyer l'email d'invitation
async function sendInvitationEmail(
  email: string, 
  role: string, 
  token: string, 
  customMessage?: string
) {
  const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/invite/${token}`
  
  // Pour l'instant, juste un log
  console.log(`📧 Email d'invitation pour ${email}:`, {
    role,
    inviteUrl,
    customMessage
  })
  
  // TODO: Implémenter l'envoi d'email réel avec votre service préféré
  // Exemple avec Resend, SendGrid, ou autre service
}