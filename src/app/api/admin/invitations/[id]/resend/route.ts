// src/app/api/admin/invitations/[id]/resend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST: Renvoyer une invitation (Admin uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const invitationId = params.id

    // Dans une vraie implémentation, vous récupéreriez l'invitation de la base
    // const invitation = await prisma.invitation.findUnique({
    //   where: { id: invitationId }
    // })

    // Pour la démo, on simule une invitation
    const mockInvitation = {
      id: invitationId,
      email: 'example@test.com',
      role: 'INFIRMIER',
      token: crypto.randomBytes(32).toString('hex')
    }

    // Générer un nouveau token si nécessaire
    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Dans une vraie implémentation, mettre à jour le token et la date d'expiration
    // await prisma.invitation.update({
    //   where: { id: invitationId },
    //   data: {
    //     token: newToken,
    //     expiresAt: newExpiresAt
    //   }
    // })

    // Renvoyer l'email d'invitation
    try {
      await sendInvitationEmail(
        mockInvitation.email,
        mockInvitation.role,
        newToken
      )
    } catch (emailError) {
      console.error('Error resending invitation email:', emailError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    // Logger l'action
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_RESENT',
        success: true,
        details: {
          invitationId,
          newToken
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation renvoyée avec succès'
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renvoi de l\'invitation' },
      { status: 500 }
    )
  }
}

// Fonction pour renvoyer l'email d'invitation
async function sendInvitationEmail(
  email: string, 
  role: string, 
  token: string
) {
  const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/invite/${token}`
  
  console.log(`📧 Renvoi d'invitation pour ${email}:`, {
    role,
    inviteUrl
  })
  
  // TODO: Implémenter l'envoi d'email réel
}