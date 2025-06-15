// src/app/auth/login/page.tsx - Version avec redirection améliorée
'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Lock, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const urlError = searchParams.get('error')
  const message = searchParams.get('message')

  // Gestion des messages de succès
  useEffect(() => {
    if (message) {
      switch (message) {
        case 'AccountActivated':
          setSuccessMessage('Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.')
          break
        default:
          break
      }
    }
  }, [message])

  // Gestion des erreurs URL
  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case 'SessionExpired':
          setError('Votre session a expiré. Veuillez vous reconnecter.')
          break
        case 'AccessDenied':
          setError('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
          break
        case 'AccountDeactivated':
          setError('Votre compte a été désactivé. Contactez l\'administrateur.')
          break
        default:
          setError('Une erreur est survenue lors de la connexion.')
      }
    }
  }, [urlError])

  // Vérifier si déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        console.log('🔐 Session existante détectée, redirection...')
        window.location.href = callbackUrl // 🔧 Utiliser window.location pour forcer la redirection
      }
    }
    checkSession()
  }, [callbackUrl])

  const validateForm = () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return false
    }
    
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Format d\'email invalide')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      console.log('🔐 Tentative de connexion pour:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // 🔧 Important: pas de redirection automatique
      })

      console.log('🔐 Résultat connexion:', result)

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setError('Email ou mot de passe incorrect')
            break
          default:
            setError('Erreur de connexion. Veuillez réessayer.')
        }
      } else if (result?.ok) {
        console.log('✅ Connexion réussie, redirection vers:', callbackUrl)
        toast.success('Connexion réussie')
        
        // 🔧 Redirection améliorée avec délai
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 500)
      }
    } catch (error) {
      console.error('❌ Erreur login:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vital Sync</h1>
          <p className="text-gray-600">Connexion sécurisée</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message de succès */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">{successMessage}</div>
              </div>
            )}

            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder-gray-400"
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder-gray-400"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
                onClick={() => router.push('/auth/forgot-password')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Aide pour l'activation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Nouveau sur Vital Sync ?
            </h3>
            <p className="text-sm text-blue-700">
              Si vous avez reçu un lien d'invitation, cliquez dessus pour activer votre compte 
              et définir votre mot de passe avant de vous connecter.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
             <p className="mt-1">© 2025 Vital Sync - Tous droits réservés</p>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Connexion chiffrée SSL/TLS</p>
          <p>⏱ Session automatiquement fermée après 4h d'inactivité</p>
        </div>
      </div>
    </div>
  )
}