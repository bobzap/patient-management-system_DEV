// src/components/admin/InvitationManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Send, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Link,
  Mail
} from 'lucide-react'
import { UserRole } from '@/hooks/useAuth'

interface Invitation {
  id: string
  email: string
  role: UserRole
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  token: string
  expiresAt: string
  createdAt: string
  invitedBy: string
  acceptedAt?: string
}

interface CreateInvitationData {
  email: string
  role: UserRole
  customMessage?: string
}

export function InvitationManagement() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Charger les invitations
  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      } else {
        toast.error('Erreur lors du chargement des invitations')
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInvitation = async (invitationData: CreateInvitationData) => {
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationData)
      })

      if (response.ok) {
        const result = await response.json()
        setInvitations([result.invitation, ...invitations])
        setShowCreateModal(false)
        toast.success('Invitation créée et envoyée avec succès')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création de l\'invitation')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}/resend`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Invitation renvoyée avec succès')
      } else {
        toast.error('Erreur lors du renvoi de l\'invitation')
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette invitation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setInvitations(invitations.map(inv => 
          inv.id === invitationId ? { ...inv, status: 'REVOKED' } : inv
        ))
        toast.success('Invitation révoquée')
      } else {
        toast.error('Erreur lors de la révocation')
      }
    } catch (error) {
      console.error('Error revoking invitation:', error)
      toast.error('Erreur de connexion')
    }
  }

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/auth/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success('Lien d\'invitation copié dans le presse-papiers')
  }

  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acceptée
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Expirée
          </span>
        )
      case 'REVOKED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Révoquée
          </span>
        )
      default:
        return null
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  // Statistiques des invitations
  const stats = invitations.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">En attente</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.PENDING || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Acceptées</p>
              <p className="text-2xl font-bold text-green-900">{stats.ACCEPTED || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Expirées</p>
              <p className="text-2xl font-bold text-red-900">{stats.EXPIRED || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Total</p>
              <p className="text-2xl font-bold text-blue-900">{invitations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Invitations en cours</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchInvitations}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
                     transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                     transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Nouvelle invitation
          </button>
        </div>
      </div>

      {/* Liste des invitations */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Aucune invitation trouvée</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Créer la première invitation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email invité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{invitation.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{invitation.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invitation.status)}
                      {invitation.status === 'PENDING' && isExpired(invitation.expiresAt) && (
                        <span className="ml-2 text-xs text-red-600">(Expirée)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.expiresAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {invitation.status === 'PENDING' && !isExpired(invitation.expiresAt) && (
                          <>
                            <button
                              onClick={() => copyInvitationLink(invitation.token)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Copier le lien"
                            >
                              <Link className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Renvoyer l'invitation"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(invitation.status === 'PENDING' || invitation.status === 'EXPIRED') && (
                          <button
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Révoquer l'invitation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création d'invitation */}
      {showCreateModal && (
        <CreateInvitationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateInvitation}
        />
      )}
    </div>
  )
}

// Modal de création d'invitation
function CreateInvitationModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (data: CreateInvitationData) => void 
}) {
  const [formData, setFormData] = useState<CreateInvitationData>({
    email: '',
    role: 'INFIRMIER',
    customMessage: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onCreate(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Créer une invitation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email du destinataire
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="INFIRMIER">Infirmier</option>
              <option value="MEDECIN">Médecin</option>
              <option value="INFIRMIER_CHEF">Infirmier Chef</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={formData.customMessage}
              onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Message d'accueil personnalisé..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Informations importantes :</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• L'invitation expirera dans 7 jours</li>
                  <li>• Un email sera envoyé automatiquement</li>
                  <li>• Le destinataire devra créer son mot de passe</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer l'invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}