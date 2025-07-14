// src/app/auth/reset-password/[token]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface PasswordStrength {
  score: number
  label: string
  color: string
  bgColor: string
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  // Validation du token au chargement
  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      // Pour valider le token côté client, on peut décoder le JWT (sans vérifier la signature)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      
      if (payload.exp < now) {
        setTokenValid(false)
        setError('Ce lien a expiré. Demandez un nouveau lien de réinitialisation.')
        return
      }
      
      setUserEmail(payload.email)
      setTokenValid(true)
      
    } catch (error) {
      setTokenValid(false)
      setError('Lien invalide. Demandez un nouveau lien de réinitialisation.')
    }
  }

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++
    
    const strengths = [
      { score: 0, label: 'Très faible', color: 'text-red-600', bgColor: 'bg-red-500' },
      { score: 1, label: 'Faible', color: 'text-red-500', bgColor: 'bg-red-400' },
      { score: 2, label: 'Moyen', color: 'text-orange-500', bgColor: 'bg-orange-400' },
      { score: 3, label: 'Bon', color: 'text-yellow-600', bgColor: 'bg-yellow-400' },
      { score: 4, label: 'Fort', color: 'text-green-600', bgColor: 'bg-green-500' },
      { score: 5, label: 'Très fort', color: 'text-green-700', bgColor: 'bg-green-600' }
    ]
    
    return strengths[score]
  }

  const validatePassword = () => {
    if (!password) {
      return 'Le mot de passe est requis'
    }
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre'
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'
    }
    if (password !== confirmPassword) {
      return 'Les mots de passe ne correspondent pas'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
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
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
      
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  // Page de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <Logo width={200} height={54} className="transition-all duration-300 hover:scale-105 drop-shadow-sm" />
                  <div className="space-y-2">
                    <h1 className="text-2xl font-light text-slate-900">Mot de passe réinitialisé !</h1>
                    <p className="text-slate-600 font-light">Votre mot de passe a été mis à jour avec succès</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl text-center">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                ✅ Réinitialisation réussie
              </h2>
              <p className="text-slate-600 mb-6">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-700 hover:to-teal-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500/50 
                         transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Lock className="h-4 w-4 mr-2" />
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Token invalide ou expiré
  if (tokenValid === false) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <Logo width={200} height={54} className="transition-all duration-300 hover:scale-105 drop-shadow-sm" />
                  <div className="space-y-2">
                    <h1 className="text-2xl font-light text-slate-900">Lien invalide</h1>
                    <p className="text-slate-600 font-light">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl text-center space-y-4">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 
                         transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Demander un nouveau lien
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center py-3 px-4 border border-slate-300
                         rounded-xl shadow-sm text-sm font-medium text-slate-700
                         bg-white/60 backdrop-blur-xl
                         hover:bg-white/80 hover:border-slate-400
                         transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chargement de validation du token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 text-center shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 font-light">Validation du lien...</p>
          </div>
        </div>
      </div>
    )
  }

  const passwordStrength = calculatePasswordStrength(password)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <Logo 
                  width={200} 
                  height={54} 
                  className="transition-all duration-300 hover:scale-105 drop-shadow-sm"
                />
                <div className="space-y-2">
                  <h1 className="text-2xl font-light text-slate-900">Nouveau mot de passe</h1>
                  <p className="text-slate-600 font-light">
                    Définissez un nouveau mot de passe pour <strong>{userEmail}</strong>
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-500 font-light">Lien sécurisé validé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
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

              {/* Nouveau mot de passe */}
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
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
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
                
                {/* Vérification correspondance */}
                {confirmPassword && (
                  <div className="flex items-center mt-2">
                    {password === confirmPassword ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Les mots de passe correspondent</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Les mots de passe ne correspondent pas</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Exigences du mot de passe */}
              <div className="bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Exigences du mot de passe
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    • Au moins 8 caractères
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                    • Une lettre minuscule
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                    • Une lettre majuscule
                  </li>
                  <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                    • Un chiffre
                  </li>
                  <li className={/[@$!%*?&]/.test(password) ? 'text-green-600' : ''}>
                    • Un caractère spécial (@$!%*?&)
                  </li>
                </ul>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
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
                    Mise à jour...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Mettre à jour le mot de passe
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}