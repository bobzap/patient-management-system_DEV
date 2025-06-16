// src/app/auth/invite/[token]/page.tsx - Corrigé pour Next.js 15
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'

interface InvitationData {
  email: string
  role: string
  invitedBy: string
  expiresAt: string
  isValid: boolean
}

// 🔧 CORRECTION: params est maintenant Promise
export default function InviteAcceptPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string>('')
  const router = useRouter()

  // 🔧 CORRECTION: Charger le token de manière asynchrone
  useEffect(() => {
    const loadToken = async () => {
      try {
        const resolvedParams = await params
        setToken(resolvedParams.token)
      } catch (error) {
        console.error('Error loading token:', error)
        router.push('/auth/login')
      }
    }
    loadToken()
  }, [params, router])

  // Charger les données de l'invitation seulement quand le token est prêt
  useEffect(() => {
    if (!token) return

    const validateInvitation = async () => {
      try {
        const response = await fetch(`/api/auth/invite/${token}`)
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setInvitationData(data.invitation)
        } else {
          toast.error(data.error || 'Invitation invalide ou expirée')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error validating invitation:', error)
        toast.error('Erreur lors de la validation de l\'invitation')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    validateInvitation()
  }, [token, router]) // 🔧 CORRECTION: Dépend maintenant de token au lieu de params.token

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis')
      return false
    }
    
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !token) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/auth/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        router.push('/auth/login?message=account-created')
      } else {
        toast.error(result.error || 'Erreur lors de la création du compte')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast.error('Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'INFIRMIER_CHEF': 'Infirmier Chef',
      'INFIRMIER': 'Infirmier',
      'MEDECIN': 'Médecin'
    }
    return roleNames[role] || role
  }

  // Affichage pendant le chargement du token ou de l'invitation
  if (isLoading || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Validation de l'invitation...</p>
        </div>
      </div>
    )
  }

  if (!invitationData) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-600">Finalisons la création de votre compte</p>
        </div>

        {/* Informations de l'invitation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Invitation reçue</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>{invitationData.email}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>Rôle : {getRoleDisplayName(invitationData.role)}</span>
            </div>
            <div className="text-xs text-blue-600">
              Invité par : {invitationData.invitedBy}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom complet */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         placeholder-gray-400"
                placeholder="Votre nom complet"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pr-10 px-3 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder-gray-400"
                  placeholder="Choisissez un mot de passe sécurisé"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Au moins 8 caractères avec chiffres et caractères spéciaux
              </p>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         placeholder-gray-400"
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>

            {/* Bouton de création */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Créer mon compte
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>En créant votre compte, vous acceptez nos conditions d'utilisation</p>
            <p className="mt-1">© 2025 Vital Sync - Système sécurisé</p>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Connexion chiffrée SSL/TLS</p>
          <p>Cette invitation expire le {new Date(invitationData.expiresAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}