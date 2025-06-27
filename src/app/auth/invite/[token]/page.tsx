// src/app/auth/invite/[token]/page.tsx - VERSION UNIFORMISÉE AVEC LE DASHBOARD
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, Lock, Mail, User, Shield, ExternalLink } from 'lucide-react'
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
  }, [token, router])

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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 text-center shadow-xl max-w-xl w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 font-light">Validation de l'invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!invitationData) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header style dashboard */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative mx-auto h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-light text-slate-900">Bienvenue !</h1>
                  <p className="text-slate-600 font-light">Finalisons la création de votre compte</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de l'invitation style dashboard */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur"></div>
          <div className="relative bg-blue-50/60 backdrop-blur-xl border border-blue-200/40 rounded-2xl p-6">
            <h3 className="font-medium text-blue-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Invitation reçue
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">{invitationData.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Rôle : {getRoleDisplayName(invitationData.role)}</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 pt-2 border-t border-blue-200/30">
                Invité par : {invitationData.invitedBy}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire style dashboard */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nom complet */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                           focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                           placeholder-slate-400 text-slate-800 transition-all duration-300"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pr-12 px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="Choisissez un mot de passe sécurisé"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/20 rounded-r-xl transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-light">
                  Au moins 8 caractères avec chiffres et caractères spéciaux
                </p>
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                           focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                           placeholder-slate-400 text-slate-800 transition-all duration-300"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>

              {/* Bouton de création */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
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

            {/* Conditions d'utilisation */}
            <div className="mt-6 text-center text-sm text-slate-600">
              <p className="font-light">En créant votre compte, vous acceptez nos conditions d'utilisation</p>
            </div>
          </div>
        </div>

        {/* Footer style dashboard */}
        <div className="flex justify-center">
          <div className="relative group">
            {/* Effet de glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            {/* Container principal */}
            <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-8">
                
                {/* Section sécurité */}
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://www.ssllabs.com/ssltest/analyze.html?d=app.vital-sync.ch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <Shield className="h-4 w-4 text-green-600 group-hover:text-green-500 transition-colors" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm group-hover:bg-green-400/40 transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-800 transition-colors">
                      Audit SSL/TLS
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-600 transition-colors" />
                  </a>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section développeur */}
                <div className="text-center lg:text-right space-y-1">
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Développé par{' '}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                        Amarre®
                      </span>
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="/logo-amarre.png" 
                        alt="Logo Amarre" 
                        className="w-6 h-6 object-contain transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    Software Development
                  </p>
                </div>
              </div>

              {/* Ligne décorative */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center space-x-2">
            <Lock className="h-3 w-3" />
            <span>Connexion chiffrée SSL/TLS</span>
          </p>
          <p>Cette invitation expire le {new Date(invitationData.expiresAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}