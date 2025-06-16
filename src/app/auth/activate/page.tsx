// src/app/auth/activate/page.tsx - CORRIGÉ
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Lock, Mail, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface UserInfo {
  email: string
  name: string
  role: string
}

// 🔧 CHANGEMENT : Fonction normale (pas export default)
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
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-100'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérification en cours</h2>
          <p className="text-gray-600">Validation de votre lien d'invitation...</p>
        </div>
      </div>
    )
  }

  // Affichage si token invalide
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lien invalide</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activation du compte</h1>
          <p className="text-gray-600">Définissez votre mot de passe pour accéder à Vital Sync</p>
        </div>

        {/* Informations utilisateur */}
        {userInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">{userInfo.email}</span>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">{userInfo.name}</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userInfo.role)}`}>
                  {getRoleDisplayName(userInfo.role)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder-gray-400"
                  placeholder="••••••••"
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

              {/* Indicateur de force du mot de passe */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score < 2 ? 'text-red-600' :
                      passwordStrength.score < 4 ? 'text-yellow-600' :
                      passwordStrength.score < 5 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Critères de sécurité */}
                  <div className="mt-2 grid grid-cols-1 gap-1">
                    {[
                      { key: 'length', label: 'Au moins 8 caractères' },
                      { key: 'uppercase', label: 'Une majuscule' },
                      { key: 'lowercase', label: 'Une minuscule' },
                      { key: 'number', label: 'Un chiffre' },
                      { key: 'special', label: 'Un caractère spécial' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center text-xs">
                        {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400 mr-1" />
                        )}
                        <span className={passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? 'text-green-700' : 'text-gray-500'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Indicateur de correspondance */}
              {confirmPassword && (
                <div className="mt-1 flex items-center text-xs">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-700">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-700">Les mots de passe ne correspondent pas</span>
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
                       rounded-lg shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Activation en cours...
                </div>
              ) : (
                'Activer mon compte'
              )}
            </button>
          </form>

          {/* Informations de sécurité */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>🔒 Ce lien est à usage unique et expire sous 7 jours</p>
            <p>📧 Votre mot de passe sera chiffré et sécurisé</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement</h2>
          <p className="text-gray-600">Préparation de la page d'activation...</p>
        </div>
      </div>
    }>
      <ActivationContent />
    </Suspense>
  )
}