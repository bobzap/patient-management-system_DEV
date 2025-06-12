// src/app/api/admin/users/route.ts
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
  sendInvite: z.boolean().default(false)
})

// GET: Récupérer tous les utilisateurs (Admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer tous les utilisateurs avec leurs profils
    const users = await prisma.authUser.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater la réponse
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile?.name || 'Non défini',
      role: user.profile?.role || 'INFIRMIER',
      isActive: user.profile?.isActive ?? true,
      isWhitelisted: user.profile?.isWhitelisted ?? false,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.profile?.lastLogin?.toISOString() || null,
      loginCount: user._count.logs
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST: Créer un nouvel utilisateur (Admin uniquement)
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
    const validatedData = createUserSchema.parse(body)

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

    // Générer un mot de passe temporaire sécurisé
    const tempPassword = crypto.randomBytes(12).toString('base64')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Créer l'utilisateur et son profil dans une transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.authUser.create({
        data: {
          email: validatedData.email,
          password: hashedPassword
        }
      })

      // Créer le profil
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          isActive: true,
          isWhitelisted: validatedData.role === 'ADMIN'
        }
      })

      return { user, profile }
    })

    // Logger la création
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_CREATED',
        success: true,
        details: {
          createdUserId: newUser.user.id,
          createdUserEmail: validatedData.email,
          createdUserRole: validatedData.role
        }
      }
    })

    // Envoyer l'email d'invitation si demandé
    if (validatedData.sendInvite) {
      try {
        await sendInvitationEmail(validatedData.email, validatedData.name, tempPassword)
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Continuer même si l'email échoue
      }
    }

    // Réponse (sans le mot de passe)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        isActive: true,
        isWhitelisted: validatedData.role === 'ADMIN',
        createdAt: newUser.user.createdAt.toISOString(),
        tempPassword: validatedData.sendInvite ? undefined : tempPassword // Seulement si pas d'email
      },
      message: 'Utilisateur créé avec succès'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// Fonction pour envoyer l'email d'invitation
async function sendInvitationEmail(email: string, name: string, tempPassword: string) {
  // À implémenter selon votre provider email (Resend, SendGrid, etc.)
  // Pour l'instant, juste un log
  console.log(`Invitation email would be sent to ${email}:`, {
    name,
    tempPassword,
    loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`
  })
  
  // Exemple d'implémentation avec un service email:
  /*
  const emailService = new EmailService()
  await emailService.send({
    to: email,
    subject: 'Invitation à rejoindre Vital Sync',
    template: 'invitation',
    data: {
      name,
      email,
      tempPassword,
      loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
      companyName: 'Vital Sync'
    }
  })
  */
}