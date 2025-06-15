// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour mise à jour d'utilisateur
const updateUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  role: z.enum(['ADMIN', 'INFIRMIER', 'INFIRMIER_CHEF', 'MEDECIN']).optional(),
  isActive: z.boolean().optional()
})

// PATCH: Mettre à jour un utilisateur (Admin uniquement)
export async function PATCH(
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

    const { id } = params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.authUser.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher l'auto-désactivation
    if (session.user.id === id && validatedData.isActive === false) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous désactiver vous-même' },
        { status: 400 }
      )
    }

    // Si email change, vérifier qu'il n'existe pas déjà
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.authUser.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur et son profil dans une transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'email dans authUser si nécessaire
      let user = existingUser
      if (validatedData.email && validatedData.email !== existingUser.email) {
        user = await tx.authUser.update({
          where: { id },
          data: { email: validatedData.email }
        })
      }

      // Mettre à jour le profil
      const profile = await tx.userProfile.update({
        where: { userId: id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email && { email: validatedData.email }),
          ...(validatedData.role && { role: validatedData.role }),
          ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
        }
      })

      return { user, profile }
    })

    // Logger la modification
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_UPDATED',
        success: true,
        details: {
          updatedUserId: id,
          updatedUserEmail: updatedUser.user.email,
          changes: validatedData
        }
      }
    })

    // Réponse formatée
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        name: updatedUser.profile.name,
        role: updatedUser.profile.role,
        isActive: updatedUser.profile.isActive,
        isWhitelisted: updatedUser.profile.isWhitelisted,
        createdAt: updatedUser.user.createdAt.toISOString(),
        lastLogin: updatedUser.profile.lastLogin?.toISOString() || null
      },
      message: 'Utilisateur mis à jour avec succès'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE: Supprimer un utilisateur (Admin uniquement)
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

    const { id } = params

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.authUser.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher l'auto-suppression
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur et ses données liées dans une transaction
    await prisma.$transaction(async (tx) => {
      // Supprimer d'abord le profil (foreign key constraint)
      await tx.userProfile.delete({
        where: { userId: id }
      })

      // Supprimer les logs (optionnel, ou les garder pour audit)
      // await tx.authLog.deleteMany({
      //   where: { userId: id }
      // })

      // Supprimer l'utilisateur
      await tx.authUser.delete({
        where: { id }
      })
    })

    // Logger la suppression
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_DELETED',
        success: true,
        details: {
          deletedUserId: id,
          deletedUserEmail: existingUser.email,
          deletedUserName: existingUser.profile?.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    
    // Erreur de contrainte de clé étrangère
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Impossible de supprimer cet utilisateur car il a des données liées' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// GET: Récupérer un utilisateur spécifique (Admin uniquement)
export async function GET(
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

    const { id } = params

    const user = await prisma.authUser.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            logs: {
              where: {
                action: 'LOGIN',
                success: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Réponse formatée
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name || 'Non défini',
        role: user.profile?.role || 'INFIRMIER',
        isActive: user.profile?.isActive ?? true,
        isWhitelisted: user.profile?.isWhitelisted ?? false,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.profile?.lastLogin?.toISOString() || null,
        loginCount: user._count.logs
      }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}