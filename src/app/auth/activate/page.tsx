// src/app/auth/activate/page.tsx - VERSION UNIFORMISÉE AVEC LE DASHBOARD
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Lock, Mail, User, Shield, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface UserInfo {
  email: string
  name: string
  role: string
}

// 🔧 FONCTION NORMALE (pas export default)
function ActivationContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [tokenValid, setTokenValid] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant')
      setIsValidating(false)
      return
    }

    validateToken()
  }, [token])

  // Vérifier la force du mot de passe
  useEffect(() => {
    if (password) {
      checkPasswordStrength(password)
    }
  }, [password])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/activate?token=${token}`)
      const result = await response.json()

      if (result.success) {
        setTokenValid(true)
        setUserInfo(result.user)
      } else {
        setError(result.error || 'Token invalide')
        setTokenValid(false)
      }
    } catch (error) {
      setError('Erreur lors de la vérification du token')
      setTokenValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const checkPasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }

    const score = Object.values(checks).filter(Boolean).length
    setPasswordStrength({ score, checks })
  }

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500'
    if (score < 4) return 'bg-yellow-500'
    if (score < 5) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Faible'
    if (score < 4) return 'Moyen'
    if (score < 5) return 'Bon'
    return 'Excellent'
  }

  const getRoleDisplayName = (role: string) => {
    const roles = {
      'ADMIN': 'Administrateur',
      'INFIRMIER_CHEF': 'Infirmier Chef',
      'INFIRMIER': 'Infirmier',
      'MEDECIN': 'Médecin'
    }
    return roles[role as keyof typeof roles] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'ADMIN': 'text-red-600 bg-red-100',
      'INFIRMIER_CHEF': 'text-purple-600 bg-purple-100',
      'INFIRMIER': 'text-blue-600 bg-blue-100',
      'MEDECIN': 'text-green-600 bg-green-100'
    }
    return colors[role as keyof typeof colors] || 'text-slate-600 bg-slate-100'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations côté client
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordStrength.score < 5) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Compte activé avec succès !')
        setTimeout(() => {
          router.push('/auth/login?message=AccountActivated')
        }, 2000)
      } else {
        setError(result.error || 'Erreur lors de l\'activation')
      }
    } catch (error) {
      console.error('Activation error:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  // Affichage pendant la validation du token
  if (isValidating) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 text-center shadow-xl max-w-md w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-light text-slate-900 mb-2">Vérification en cours</h2>
            <p className="text-slate-600 font-light">Validation de votre lien d'invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage si token invalide
  if (!tokenValid) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-xl text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
              <div className="relative mx-auto w-fit p-4 bg-white/40 backdrop-blur-xl rounded-2xl">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-light text-slate-900 mb-4">Lien invalide</h2>
            <p className="text-slate-600 mb-6 font-light">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                       hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Header style dashboard */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-light text-slate-900">Activation du compte</h1>
                  <p className="text-slate-600 font-light">Définissez votre mot de passe pour accéder à Vital Sync</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations utilisateur style dashboard */}
        {userInfo && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur"></div>
            <div className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations du compte
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-slate-700 font-medium">{userInfo.email}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-slate-700 font-medium">{userInfo.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-slate-400 mr-3" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userInfo.role)}`}>
                    {getRoleDisplayName(userInfo.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire style dashboard */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Affichage des erreurs */}
              {error && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl blur"></div>
                  <div className="relative bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-800 font-medium">{error}</div>
                  </div>
                </div>
              )}

              {/* Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pr-12 pl-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="••••••••"
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

                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score < 2 ? 'text-red-600' :
                        passwordStrength.score < 4 ? 'text-yellow-600' :
                        passwordStrength.score < 5 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {getStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Critères de sécurité */}
                    <div className="grid grid-cols-1 gap-1 mt-3">
                      {[
                        { key: 'length', label: 'Au moins 8 caractères' },
                        { key: 'uppercase', label: 'Une majuscule' },
                        { key: 'lowercase', label: 'Une minuscule' },
                        { key: 'number', label: 'Un chiffre' },
                        { key: 'special', label: 'Un caractère spécial' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center text-xs">
                          {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-3 w-3 text-slate-400 mr-2" />
                          )}
                          <span className={passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? 'text-green-700 font-medium' : 'text-slate-500'}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pr-12 pl-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/20 rounded-r-xl transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                
                {/* Indicateur de correspondance */}
                {confirmPassword && (
                  <div className="mt-1 flex items-center text-xs">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-700 font-medium">Les mots de passe correspondent</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-700 font-medium">Les mots de passe ne correspondent pas</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bouton d'activation */}
              <button
                type="submit"
                disabled={isLoading || passwordStrength.score < 5 || password !== confirmPassword}
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Activation en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Activer mon compte
                  </div>
                )}
              </button>
            </form>

            {/* Informations de sécurité */}
            <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
              <p className="flex items-center justify-center space-x-2">
                <Lock className="h-3 w-3" />
                <span>Ce lien est à usage unique et expire sous 7 jours</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>Votre mot de passe sera chiffré et sécurisé</span>
              </p>
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
      </div>
    </div>
  )
}

// 🔧 SEUL EXPORT DEFAULT - Wrapper avec Suspense
export default function ActivationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 text-center shadow-xl max-w-md w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-light text-slate-900 mb-2">Chargement</h2>
            <p className="text-slate-600 font-light">Préparation de la page d'activation...</p>
          </div>
        </div>
      </div>
    }>
      <ActivationContent />
    </Suspense>
  )
}