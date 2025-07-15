// src/lib/auth.ts - Version avec debug
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { PrismaAdapter } from "@next-auth/prisma-adapter"

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'INFIRMIER' | 'INFIRMIER_CHEF' | 'MEDECIN'
  isActive: boolean
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Tentative de connexion')
  }
 
  if (!credentials?.email || !credentials?.password) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Credentials manquantes')
    }
    return null
  }

  try {
    const user = await prisma.authUser.findUnique({
      where: { email: credentials.email },
      include: { profile: true }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 Utilisateur trouvé:', user ? 'OUI' : 'NON')
      console.log('📋 Profil:', user?.profile ? 'OUI' : 'NON')
    }

    if (!user || !user.profile) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Utilisateur ou profil manquant')
      }
      return null
    }

    if (!user.profile.isActive) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Compte désactivé')
      }
      throw new Error('Compte désactivé')
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    )
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Vérification mot de passe terminée')
    }

    if (!isPasswordValid) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Mot de passe incorrect')
      }
      return null
    }

    // Logger la connexion pour audit (GARDEZ - c'est sécurisé)
    await prisma.authLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        success: true,
        details: {
          timestamp: new Date().toISOString()
        }
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Connexion réussie')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.profile.name || user.email,
      role: user.profile.role,
      isActive: user.profile.isActive
    }
  } catch (error) {
    console.error('❌ Erreur dans authorize:', error.message) // ← GARDEZ mais sans détails
    return null
  }
}
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 heures
    updateAge: 30 * 60,  // Mise à jour toutes les 30 minutes
  },

  jwt: {
    maxAge: 4 * 60 * 60, // 4 heures
  },

callbacks: {
    async jwt({ token, user, trigger }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎫 JWT Callback', { trigger })
      }
     
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎫 Ajout données user au token')
        }
        token.role = user.role
        token.isActive = user.isActive
        token.requiresMFA = true // MFA obligatoire pour tous
        token.mfaVerified = false // À vérifier à chaque session
        token.sessionId = `${token.sub}-${Date.now()}` // ID unique pour cette session
      }

      // Vérifier le statut MFA actuel de l'utilisateur
      if (token.sub) {
        try {
          const userProfile = await prisma.userProfile.findUnique({
            where: { userId: token.sub },
            include: { mfa: true }
          });

          if (userProfile?.mfa?.isEnabled) {
            token.mfaEnabled = true;
            // Vérifier si la MFA a été vérifiée pour cet utilisateur
            if (global.mfaVerifiedSessions && global.mfaVerifiedSessions.has(token.sub)) {
              token.mfaVerified = true;
              // Supprimer de la liste temporaire pour éviter les problèmes de sécurité
              global.mfaVerifiedSessions.delete(token.sub);
            } else {
              token.mfaVerified = false;
            }
          } else {
            token.mfaEnabled = false; // Pas encore configurée
            token.mfaVerified = false; // Pas configurée
          }
        } catch (error) {
          console.error('Erreur vérification MFA dans JWT:', error);
          token.mfaEnabled = false; // Par sécurité, forcer la configuration
          token.mfaVerified = false;
        }
      }
     
      return token
    },

    async session({ session, token }) {
      console.log('📋 Session Callback - Token sub:', token.sub, 'Role:', token.role)
      
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
        session.user.mfaEnabled = token.mfaEnabled as boolean
        session.user.mfaVerified = token.mfaVerified as boolean
      }
      
      console.log('📋 Session finale:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        mfaVerified: session.user.mfaVerified
      })
      
      return session
    },

    async signIn({ user }) {
      console.log('🚪 SignIn Callback - User actif:', user?.isActive)
      
      // Phase 1: Vérification utilisateur actif
      if (!user?.isActive) {
        return false
      }

      // Phase 2: NextAuth attend un boolean, pas une URL
      // Les redirections MFA seront gérées par le middleware
      return true
    }
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },

  events: {
    signOut: ({ token }) => {
      console.log('🚪 SignOut Event')
      // Nettoyer les sessions MFA vérifiées
      if (global.mfaVerifiedSessions && token?.sub) {
        global.mfaVerifiedSessions.delete(token.sub);
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
}

// Types pour TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      requiresMFA: boolean
      mfaVerified: boolean
    }
  }

  interface User {
    role: string
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isActive: boolean
    requiresMFA: boolean
    mfaVerified: boolean
  }
}