// src/app/auth/login/page.tsx - VERSION UNIFORMISÉE AVEC LE DASHBOARD
'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Lock, Mail, CheckCircle, Shield, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/Logo';

// 🔧 WRAPPER VOTRE COMPOSANT EXISTANT AVEC LE STYLE DASHBOARD
function LoginContent() {
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
        window.location.href = callbackUrl
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
        redirect: false,
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
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header modernisé style dashboard */}
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
                  <h1 className="text-2xl font-light text-slate-900">Connexion sécurisée</h1>
                  <p className="text-slate-600 font-light">Accédez à votre espace professionnel</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-500 font-light">SSL/TLS Actif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire style dashboard */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message de succès */}
              {successMessage && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur"></div>
                  <div className="relative bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-emerald-800 font-medium">{successMessage}</div>
                  </div>
                </div>
              )}

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

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pr-12 pl-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500/50 border-slate-300 rounded transition-colors"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-700 font-medium">
                    Se souvenir de moi
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
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
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Se connecter
                  </div>
                )}
              </button>
            </form>

            {/* Aide pour l'activation */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur"></div>
                <div className="relative bg-blue-50/60 backdrop-blur-xl border border-blue-200/40 rounded-2xl p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Nouveau sur Vital Sync ?
                  </h3>
                  <p className="text-sm text-blue-800 font-light">
                    Si vous avez reçu un lien d'invitation, cliquez dessus pour activer votre compte 
                    et définir votre mot de passe avant de vous connecter.
                  </p>
                </div>
              </div>
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
                        Amarres®
                      </span>
                    </p>
                    <div className="flex items-center">
                      <img
  src="/logo-amarre.png"
  alt="Logo Amarre"
  className="w-9 h-9 object-contain transition-transform duration-300 hover:scale-150"
  onError={() => console.log('Logo Amarre failed to load')}
  onLoad={() => console.log('Logo Amarre loaded successfully')}
/>
                    </div>
                  </div>
                  
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
        {/* Informations de sécurité */}
<div className="text-center text-xs space-y-1">
  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
    <p className="flex items-center justify-center space-x-2 text-slate-800">
      <Lock className="h-3 w-3 text-slate-700" />
      <span>Connexion chiffrée SSL/TLS</span>
    </p>
    <p className="text-slate-700">⏱ Session automatiquement fermée après 4h d'inactivité</p>
  </div>
</div>
      </div>
    </div>
  )
}

// 🔧 SEUL CHANGEMENT : Wrapper avec Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 text-center shadow-xl max-w-xl w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 font-light">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}