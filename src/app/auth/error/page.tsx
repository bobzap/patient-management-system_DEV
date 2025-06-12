'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { AlertCircle, Home, Lock, ShieldOff, Clock } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorDetails = (errorType: string | null) => {
    switch (errorType) {
      case 'SessionExpired':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: 'Session expirée',
          message: 'Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.',
          color: 'amber',
          action: 'Se reconnecter',
          actionUrl: '/auth/login'
        }
      
      case 'AccessDenied':
        return {
          icon: <ShieldOff className="h-12 w-12 text-red-500" />,
          title: 'Accès refusé',
          message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
          color: 'red',
          action: 'Retour à l\'accueil',
          actionUrl: '/'
        }
      
      case 'AccountDeactivated':
        return {
          icon: <Lock className="h-12 w-12 text-red-500" />,
          title: 'Compte désactivé',
          message: 'Votre compte a été désactivé. Contactez l\'administrateur pour plus d\'informations.',
          color: 'red',
          action: 'Contacter l\'admin',
          actionUrl: 'mailto:admin@vital-sync.ch'
        }
      
      case 'Configuration':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: 'Erreur de configuration',
          message: 'Une erreur de configuration du serveur s\'est produite. Contactez le support technique.',
          color: 'red',
          action: 'Contacter le support',
          actionUrl: 'mailto:support@vital-sync.ch'
        }
      
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: 'Erreur d\'authentification',
          message: 'Une erreur inattendue s\'est produite lors de l\'authentification.',
          color: 'red',
          action: 'Réessayer',
          actionUrl: '/auth/login'
        }
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6">
            {errorDetails.icon}
          </div>
          
          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {errorDetails.title}
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {errorDetails.message}
          </p>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (errorDetails.actionUrl.startsWith('mailto:')) {
                  window.location.href = errorDetails.actionUrl
                } else {
                  router.push(errorDetails.actionUrl)
                }
              }}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors
                ${errorDetails.color === 'amber'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : errorDetails.color === 'red'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {errorDetails.action}
            </button>
            
            {/* Bouton secondaire pour retour à l'accueil */}
            {errorDetails.actionUrl !== '/' && (
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium 
                         text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </button>
            )}
          </div>
        </div>
        
        {/* Informations de contact */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Problème persistant ?</p>
          <p className="mt-1">
            Contactez le support : 
            <a 
              href="mailto:support@vital-sync.ch" 
              className="text-blue-600 hover:text-blue-500 ml-1"
            >
              support@vital-sync.ch
            </a>
          </p>
        </div>

        {/* Détails techniques pour debug (en dev uniquement) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white text-sm font-medium mb-2">Debug Info</h3>
            <code className="text-green-400 text-xs">
              Error: {error}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}