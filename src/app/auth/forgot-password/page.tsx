// src/app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim().toLowerCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email')
      return
    }
    
    if (!validateEmail(email)) {
      setError('Format d\'email invalide')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <Logo 
                    width={200} 
                    height={54} 
                    className="transition-all duration-300 hover:scale-105 drop-shadow-sm"
                  />
                  <div className="space-y-2">
                    <h1 className="text-2xl font-light text-slate-900">Email envoyé !</h1>
                    <p className="text-slate-600 font-light">Vérifiez votre boîte de réception</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message de succès */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
              
              {/* Icône de succès */}
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Instructions envoyées
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, 
                  vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {/* Informations importantes */}
              <div className="mt-6 bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Vérifiez votre email
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Le lien expire dans <strong>15 minutes</strong></li>
                  <li>• Vérifiez aussi vos <strong>spams</strong></li>
                  <li>• L'email provient de <strong>info@vital-sync.ch</strong></li>
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full flex items-center justify-center py-3 px-4 border border-slate-300
                           rounded-xl shadow-sm text-sm font-medium text-slate-700
                           bg-white/60 backdrop-blur-xl
                           hover:bg-white/80 hover:border-slate-400
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50
                           transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </button>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                    setError('')
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Renvoyer un email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <Logo 
                  width={200} 
                  height={54} 
                  className="transition-all duration-300 hover:scale-105 drop-shadow-sm"
                />
                <div className="space-y-2">
                  <h1 className="text-2xl font-light text-slate-900">Mot de passe oublié</h1>
                  <p className="text-slate-600 font-light">Saisissez votre email pour recevoir un lien de réinitialisation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-3xl blur-xl"></div>
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
                             focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/80
                             placeholder-slate-400 text-slate-800 transition-all duration-300"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Bouton d'envoi */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-orange-600 to-amber-600 
                         hover:from-orange-700 hover:to-amber-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50 
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le lien de réinitialisation
                  </div>
                )}
              </button>
            </form>

            {/* Bouton retour */}
            <div className="mt-6">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center py-3 px-4 border border-slate-300
                         rounded-xl shadow-sm text-sm font-medium text-slate-700
                         bg-white/60 backdrop-blur-xl
                         hover:bg-white/80 hover:border-slate-400
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50
                         transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-yellow-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-800">
                  🔒 Sécurité renforcée
                </h3>
                <p className="text-xs text-slate-600">
                  Le lien de réinitialisation expire automatiquement après 15 minutes pour votre sécurité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}