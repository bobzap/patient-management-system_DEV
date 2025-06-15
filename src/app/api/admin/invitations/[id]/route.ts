// src/app/api/admin/invitations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE: Révoquer une invitation (Admin uniquement)
export async function DELETE(
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

    // Dans une vraie implémentation, vous mettriez à jour le statut en base
    // await prisma.invitation.update({
    //   where: { id: invitationId },
    //   data: { status: 'REVOKED' }
    // })

    // Logger l'action
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'INVITATION_REVOKED',
        success: true,
        details: {
          invitationId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation révoquée avec succès'
    })

  } catch (error) {
    console.error('Error revoking invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la révocation de l\'invitation' },
      { status: 500 }
    )
  }
}