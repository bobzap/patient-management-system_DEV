// src/hooks/useAuth.ts
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type UserRole = 'ADMIN' | 'INFIRMIER' | 'INFIRMIER_CHEF' | 'MEDECIN'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user as AuthUser | undefined

  // Vérifications de sécurité
  const isAuthenticated = status === 'authenticated' && !!user
  const isLoading = status === 'loading'
  const isAdmin = user?.role === 'ADMIN'
  const isInfirmierChef = user?.role === 'INFIRMIER_CHEF'
  const isMedecin = user?.role === 'MEDECIN'
  const isInfirmier = user?.role === 'INFIRMIER'

  // Fonctions utilitaires de permission
  const hasRole = (roles: UserRole[]): boolean => {
    return !!user && roles.includes(user.role)
  }

  const hasMinimumRole = (minimumRole: UserRole): boolean => {
    if (!user) return false
    
    const roleHierarchy: Record<UserRole, number> = {
      'INFIRMIER': 1,
      'MEDECIN': 2,
      'INFIRMIER_CHEF': 3,
      'ADMIN': 4
    }
    
    return roleHierarchy[user.role] >= roleHierarchy[minimumRole]
  }

  const canAccessAdmin = (): boolean => {
    return isAdmin
  }

  const canManageUsers = (): boolean => {
    return isAdmin
  }

  const canViewPatients = (): boolean => {
    return hasMinimumRole('INFIRMIER')
  }

  const canEditPatients = (): boolean => {
    return hasMinimumRole('INFIRMIER')
  }

  const canDeletePatients = (): boolean => {
    return hasMinimumRole('INFIRMIER_CHEF')
  }

  const canViewReports = (): boolean => {
    return hasMinimumRole('INFIRMIER_CHEF')
  }

  const canViewMedicalData = (): boolean => {
    return hasRole(['ADMIN', 'MEDECIN', 'INFIRMIER_CHEF'])
  }

  // Fonction de redirection sécurisée
  const requireAuth = (redirectTo: string = '/auth/login') => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  const requireRole = (roles: UserRole[], redirectTo: string = '/auth/error?error=AccessDenied') => {
    if (!isLoading && (!isAuthenticated || !hasRole(roles))) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  const requireMinimumRole = (minimumRole: UserRole, redirectTo: string = '/auth/error?error=AccessDenied') => {
    if (!isLoading && (!isAuthenticated || !hasMinimumRole(minimumRole))) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  // Fonction pour obtenir le nom d'affichage du rôle
  const getRoleDisplayName = (role?: UserRole): string => {
    if (!role) return 'Utilisateur'
    
    const roleNames: Record<UserRole, string> = {
      'ADMIN': 'Administrateur',
      'INFIRMIER_CHEF': 'Infirmier Chef',
      'INFIRMIER': 'Infirmier',
      'MEDECIN': 'Médecin'
    }
    
    return roleNames[role] || 'Utilisateur'
  }

  // Fonction pour obtenir la couleur du badge de rôle
  const getRoleColor = (role?: UserRole): string => {
    if (!role) return 'gray'
    
    const roleColors: Record<UserRole, string> = {
      'ADMIN': 'red',
      'INFIRMIER_CHEF': 'purple',
      'INFIRMIER': 'blue',
      'MEDECIN': 'green'
    }
    
    return roleColors[role] || 'gray'
  }

  return {
    // État de base
    user,
    isAuthenticated,
    isLoading,
    
    // Rôles
    isAdmin,
    isInfirmierChef,
    isMedecin,
    isInfirmier,
    
    // Fonctions de permission
    hasRole,
    hasMinimumRole,
    canAccessAdmin,
    canManageUsers,
    canViewPatients,
    canEditPatients,
    canDeletePatients,
    canViewReports,
    canViewMedicalData,
    
    // Fonctions de sécurité
    requireAuth,
    requireRole,
    requireMinimumRole,
    
    // Utilitaires
    getRoleDisplayName,
    getRoleColor,
  }
}