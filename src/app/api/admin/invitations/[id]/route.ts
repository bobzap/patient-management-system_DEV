// src/app/api/admin/invitations/[id]/route.ts - VERSION RÉELLE
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// DELETE: Révoquer une invitation RÉELLE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id: invitationId } = await params

    console.log('🗑️ Révocation invitation:', invitationId)

    // 🔧 VRAIE RÉVOCATION: Chercher et supprimer l'invitation
    const invitation = await prisma.invitationToken.findUnique({
      where: { id: invitationId },
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
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    // Si l'invitation est déjà utilisée, ne pas permettre la révocation
    if (invitation.isUsed) {
      return NextResponse.json(
        { error: 'Impossible de révoquer une invitation déjà acceptée' },
        { status: 400 }
      )
    }

    // Supprimer l'invitation et l'utilisateur associé (s'il n'est pas activé)
    await prisma.$transaction(async (tx) => {
      // Supprimer le token d'invitation
      await tx.invitationToken.delete({
        where: { id: invitationId }
      })

      // Si l'utilisateur n'est pas actif, le supprimer aussi
      if (invitation.user && !invitation.user.profile?.isActive) {
        // Supprimer d'abord le profil
        await tx.userProfile.delete({
          where: { userId: invitation.userId }
        })
        
        // Puis l'utilisateur
        await tx.authUser.delete({
          where: { id: invitation.userId }
        })
      }
    })

    // Logger l'action
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_REVOKED',
        success: true,
        details: {
          invitationId,
          invitedEmail: invitation.email
        }
      }
    })

    console.log('✅ Invitation révoquée:', invitationId)

    return NextResponse.json({
      success: true,
      message: 'Invitation révoquée avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur révocation invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la révocation de l\'invitation' },
      { status: 500 }
    )
  }
}

// src/app/api/admin/invitations/[id]/resend/route.ts - RENVOYER INVITATION
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id: invitationId } = await params

    console.log('📧 Renvoi invitation:', invitationId)

    // Trouver l'invitation
    const invitation = await prisma.invitationToken.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    if (invitation.isUsed) {
      return NextResponse.json(
        { error: 'Cette invitation a déjà été acceptée' },
        { status: 400 }
      )
    }

    // Générer un nouveau token et prolonger l'expiration
    const newToken = crypto.randomBytes(32).toString('base64url')
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7)

    // Mettre à jour l'invitation
    const updatedInvitation = await prisma.invitationToken.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt
      }
    })

    // Logger l'action
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_RESENT',
        success: true,
        details: {
          invitationId,
          newToken: newToken.substring(0, 10) + '...' // Partial token pour sécurité
        }
      }
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/auth/activate?token=${newToken}`

    console.log('✅ Nouvelle invitation envoyée:', inviteUrl)

    return NextResponse.json({
      success: true,
      message: 'Invitation renvoyée avec succès',
      inviteUrl,
      expiresAt: newExpiresAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur renvoi invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renvoi de l\'invitation' },
      { status: 500 }
    )
  }
}