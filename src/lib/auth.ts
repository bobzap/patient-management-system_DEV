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
        console.log('🔐 Tentative de connexion pour:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credentials manquantes')
          return null
        }

        try {
          // Chercher l'utilisateur dans la base
          const user = await prisma.authUser.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          })

          console.log('👤 Utilisateur trouvé:', user ? 'OUI' : 'NON')
          console.log('📋 Profil:', user?.profile ? 'OUI' : 'NON')

          if (!user || !user.profile) {
            console.log('❌ Utilisateur ou profil manquant')
            return null
          }

          // Vérifier que l'utilisateur est actif
          if (!user.profile.isActive) {
            console.log('❌ Compte désactivé')
            throw new Error('Compte désactivé')
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password, 
            user.password
          )

          console.log('🔒 Mot de passe valide:', isPasswordValid ? 'OUI' : 'NON')

          if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect')
            return null
          }

          // Logger la connexion pour audit
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

          console.log('✅ Connexion réussie pour:', user.email, 'Rôle:', user.profile.role)

          return {
            id: user.id,
            email: user.email,
            name: user.profile.name || user.email,
            role: user.profile.role,
            isActive: user.profile.isActive
          }
        } catch (error) {
          console.error('❌ Erreur dans authorize:', error)
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
    async jwt({ token, user }) {
      console.log('🎫 JWT Callback - User:', user ? 'OUI' : 'NON', 'Token sub:', token.sub)
      
      if (user) {
        console.log('🎫 Ajout données user au token:', user.role)
        token.role = user.role
        token.isActive = user.isActive
      }
      
      return token
    },

    async session({ session, token }) {
      console.log('📋 Session Callback - Token sub:', token.sub, 'Role:', token.role)
      
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
      }
      
      console.log('📋 Session finale:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      })
      
      return session
    },

    async signIn({ user }) {
      console.log('🚪 SignIn Callback - User actif:', user?.isActive)
      return user?.isActive === true
    }
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },

  events: {
    async signOut({ token }) {
      console.log('🚪 SignOut Event pour:', token?.sub)
      if (token?.sub) {
        await prisma.authLog.create({
          data: {
            userId: token.sub,
            action: 'LOGOUT',
            success: true
          }
        })
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
  }
}