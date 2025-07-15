// src/types/auth.ts - Types d'authentification NextAuth étendus

import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare global {
  var mfaVerifiedSessions: Set<string> | undefined;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      isActive: boolean
      mfaEnabled: boolean
      mfaVerified: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    isActive: boolean
    mfaEnabled?: boolean
    mfaVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    isActive: boolean
    mfaEnabled: boolean
    mfaVerified: boolean
    sessionId: string
  }
}