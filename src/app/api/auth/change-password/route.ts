// src/app/api/auth/change-password/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation des données
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Le mot de passe doit contenir : minuscule, majuscule, chiffre et caractère spécial'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Changement de mot de passe - Début')

    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ Utilisateur non authentifié')
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validationResult = changePasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Validation échouée:', validationResult.error.flatten())
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Récupérer l'utilisateur actuel
    const user = await prisma.authUser.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé en base')
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' }, 
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Mot de passe actuel incorrect')
      
      // Log de l'échec
      await logPasswordChange(
        user.id, 
        user.password, 
        request, 
        false, 
        'FAILED_CURRENT_PASSWORD'
      )
      
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' }, 
        { status: 400 }
      )
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      console.log('❌ Nouveau mot de passe identique à l\'ancien')
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit être différent de l\'ancien' }, 
        { status: 400 }
      )
    }

    // Générer le hash du nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    await prisma.authUser.update({
      where: { id: user.id },
      data: { 
        password: newPasswordHash,
        updatedAt: new Date()
      }
    })

    // Log du succès
    await logPasswordChange(
      user.id, 
      user.password, 
      request, 
      true, 
      'CHANGED_SUCCESSFULLY'
    )

    console.log('✅ Mot de passe changé avec succès pour:', session.user.email)

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    })

  } catch (error: any) {
    console.error('💥 Erreur changement mot de passe:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors du changement de mot de passe',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction utilitaire pour logger les changements
async function logPasswordChange(
  userId: string,
  oldPasswordHash: string,
  request: NextRequest,
  success: boolean,
  reason: string
) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await prisma.passwordChangeLog.create({
      data: {
        userId,
        oldPasswordHash,
        ipAddress,
        userAgent: userAgent.substring(0, 255), // Limiter la taille
        success,
        reason
      }
    })
  } catch (error) {
    console.error('Erreur lors du logging:', error)
    // Ne pas faire échouer la requête principale pour un problème de log
  }
}