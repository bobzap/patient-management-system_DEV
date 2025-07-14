// src/components/auth/ChangePasswordForm.tsx
'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PasswordStrength {
  score: number
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
  }
}

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculer la force du mot de passe
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }
    
    const score = Object.values(requirements).filter(Boolean).length
    
    return { score, requirements }
  }

  const passwordStrength = calculatePasswordStrength(formData.newPassword)

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500'
    if (score < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Faible'
    if (score < 4) return 'Moyen'
    return 'Fort'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          // Erreurs de validation
          setErrors(result.details)
        } else {
          toast.error(result.error || 'Erreur lors du changement de mot de passe')
        }
        return
      }

      // Succès
      toast.success('Mot de passe changé avec succès !')
      
      // Réinitialiser le formulaire
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Changer le mot de passe
            </h2>
            <p className="text-slate-600">
              Assurez-vous de choisir un mot de passe sécurisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                           focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                           placeholder-slate-400 text-slate-800 transition-all duration-300"
                  placeholder="Votre mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                           focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                           placeholder-slate-400 text-slate-800 transition-all duration-300"
                  placeholder="Votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.newPassword && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Force du mot de passe</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score < 2 ? 'text-red-600' :
                      passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                      <div key={key} className={`flex items-center ${met ? 'text-green-600' : 'text-slate-400'}`}>
                        <CheckCircle className={`w-3 h-3 mr-1 ${met ? 'text-green-500' : 'text-slate-300'}`} />
                        <span>
                          {key === 'length' && '8+ caractères'}
                          {key === 'lowercase' && 'Minuscule'}
                          {key === 'uppercase' && 'Majuscule'}
                          {key === 'number' && 'Chiffre'}
                          {key === 'special' && 'Spécial'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl 
                           focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80
                           placeholder-slate-400 text-slate-800 transition-all duration-300"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Indicateur de correspondance */}
              {formData.confirmPassword && (
                <div className={`mt-2 text-sm flex items-center ${
                  formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {formData.newPassword === formData.confirmPassword 
                    ? 'Les mots de passe correspondent' 
                    : 'Les mots de passe ne correspondent pas'
                  }
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 5 || formData.newPassword !== formData.confirmPassword}
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
                  Changement en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </div>
              )}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  )
}