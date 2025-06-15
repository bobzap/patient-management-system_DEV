// src/app/api/admin/users/route.ts - Version corrigée pour contrainte FK
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'

// Schéma de validation pour création d'utilisateur
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['ADMIN', 'INFIRMIER', 'INFIRMIER_CHEF', 'MEDECIN']),
  generateInvitation: z.boolean().default(true)
})

// GET: Récupérer tous les utilisateurs avec leurs tokens d'invitation
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /admin/users - Début de la requête GET')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 Session récupérée:', session ? 'OK' : 'Aucune session')
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ Accès refusé - Rôle:', session?.user?.role)
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    console.log('📊 Recherche des utilisateurs...')
    
    // Récupérer tous les utilisateurs avec leurs profils et tokens d'invitation
    const users = await prisma.authUser.findMany({
      include: {
        profile: true,
        receivedInvitations: {
          where: {
            isUsed: false,
            expiresAt: {
              gt: new Date()
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Prendre seulement la plus récente
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ ${users.length} utilisateurs trouvés`)

    // Formater la réponse
    const formattedUsers = users.map(user => {
      const activeInvitation = user.receivedInvitations[0] // La plus récente
      
      return {
        id: user.id,
        email: user.email,
        name: user.profile?.name || 'Non défini',
        role: user.profile?.role || 'INFIRMIER',
        isActive: user.profile?.isActive ?? true,
        isWhitelisted: user.profile?.isWhitelisted ?? false,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.profile?.lastLogin?.toISOString() || null,
        loginCount: user._count?.logs || 0,
        // Informations sur l'invitation
        hasActiveInvitation: !!activeInvitation,
        invitationToken: activeInvitation?.token || null,
        invitationExpiresAt: activeInvitation?.expiresAt?.toISOString() || null
      }
    })

    console.log('📤 Envoi de la réponse avec', formattedUsers.length, 'utilisateurs')

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error) {
    console.error('❌ Erreur dans API /admin/users:', error)
    
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// POST: Créer un nouvel utilisateur avec token d'invitation
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /admin/users - Début de la requête POST')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📥 Données reçues:', { ...body, password: '[MASQUÉ]' })
    
    const validatedData = createUserSchema.parse(body)

    // 🔧 CORRECTION: Vérifier l'existence de l'utilisateur connecté
    console.log('🔍 Vérification de l\'utilisateur connecté:', session.user.id)
    const currentUser = await prisma.authUser.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    if (!currentUser) {
      console.error('❌ Utilisateur connecté non trouvé en base:', session.user.id)
      return NextResponse.json(
        { error: 'Session invalide - utilisateur non trouvé' },
        { status: 401 }
      )
    }

    console.log('✅ Utilisateur connecté vérifié:', currentUser.email)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.authUser.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Générer un mot de passe temporaire (sera remplacé lors de l'activation)
    const tempPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    console.log('🔐 Mot de passe temporaire généré')

    // Créer l'utilisateur, son profil et le token d'invitation dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.authUser.create({
        data: {
          email: validatedData.email,
          password: hashedPassword // Sera remplacé lors de l'activation
        }
      })

      console.log('👤 Utilisateur créé:', user.id)

      // Créer le profil
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          isActive: false, // Inactif jusqu'à l'activation
          isWhitelisted: validatedData.role === 'ADMIN'
        }
      })

      console.log('📋 Profil créé pour:', profile.email)

      // Générer le token d'invitation si demandé
      let invitationToken = null
      if (validatedData.generateInvitation) {
        const tokenValue = crypto.randomBytes(32).toString('base64url')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

        console.log('🎫 Création du token d\'invitation...')
        console.log('   - User ID:', user.id)
        console.log('   - Created by:', currentUser.id)
        console.log('   - Email:', validatedData.email)

        invitationToken = await tx.invitationToken.create({
          data: {
            email: validatedData.email,
            token: tokenValue,
            userId: user.id,
            createdBy: currentUser.id, // 🔧 Utiliser l'ID vérifié
            expiresAt
          }
        })

        console.log('✅ Token d\'invitation créé:', invitationToken.id)
      }

      return { user, profile, invitationToken }
    })

    console.log('✅ Utilisateur créé avec succès:', result.user.id)

    // Logger la création
    await prisma.authLog.create({
      data: {
        userId: currentUser.id, // 🔧 Utiliser l'ID vérifié
        action: 'USER_CREATED',
        success: true,
        details: {
          createdUserId: result.user.id,
          createdUserEmail: validatedData.email,
          createdUserRole: validatedData.role,
          invitationGenerated: !!result.invitationToken
        }
      }
    })

    // Construire l'URL d'invitation
    const invitationUrl = result.invitationToken ? 
      `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/auth/activate?token=${result.invitationToken.token}` : 
      null

    // Réponse
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        isActive: false,
        isWhitelisted: validatedData.role === 'ADMIN',
        createdAt: result.user.createdAt.toISOString(),
        hasInvitation: !!result.invitationToken,
        invitationUrl,
        invitationExpiresAt: result.invitationToken?.expiresAt?.toISOString()
      },
      message: 'Utilisateur créé avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de l\'utilisateur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Fonction pour régénérer un token d'invitation (nouvelle route)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // 🔧 CORRECTION: Vérifier l'existence de l'utilisateur connecté
    const currentUser = await prisma.authUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Session invalide - utilisateur non trouvé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, action } = body

    if (action !== 'regenerateInvitation') {
      return NextResponse.json(
        { error: 'Action non supportée' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur cible existe
    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer les anciens tokens et créer un nouveau
    const result = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens tokens
      await tx.invitationToken.deleteMany({
        where: { userId, isUsed: false }
      })

      // Créer un nouveau token
      const tokenValue = crypto.randomBytes(32).toString('base64url')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const newToken = await tx.invitationToken.create({
        data: {
          email: user.email,
          token: tokenValue,
          userId,
          createdBy: currentUser.id, // 🔧 Utiliser l'ID vérifié
          expiresAt
        }
      })

      return newToken
    })

    // Logger l'action
    await prisma.authLog.create({
      data: {
        userId: currentUser.id, // 🔧 Utiliser l'ID vérifié
        action: 'INVITATION_REGENERATED',
        success: true,
        details: {
          targetUserId: userId,
          targetUserEmail: user.email
        }
      }
    })

    const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/auth/activate?token=${result.token}`

    return NextResponse.json({
      success: true,
      invitationUrl,
      expiresAt: result.expiresAt.toISOString(),
      message: 'Nouveau lien d\'invitation généré'
    })

  } catch (error) {
    console.error('❌ Erreur régénération invitation:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la régénération du lien d\'invitation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}