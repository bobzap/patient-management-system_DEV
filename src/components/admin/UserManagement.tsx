// src/components/admin/UserManagement.tsx - Version finale propre
'use client'

import { useState, useEffect } from 'react'
import { useAuth, UserRole } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Mail,
  Calendar
} from 'lucide-react'
import { InvitationManagement } from './InvitationManagement'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  isWhitelisted: boolean
  createdAt: string
  lastLogin?: string
}

interface CreateUserData {
  email: string
  name: string
  role: UserRole
  sendInvite: boolean
}

export function UserManagement() {
  const { canManageUsers, getRoleDisplayName, getRoleColor } = useAuth()
  
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState<'users' | 'invitations'>('users')

  // Fonction de chargement simple et efficace
  const loadUsers = async () => {
    if (hasLoaded || isLoading || !canManageUsers) return

    setIsLoading(true)
    setHasLoaded(true)

    try {
      const response = await fetch('/api/admin/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        toast.error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  // Chargement initial
  useEffect(() => {
    if (activeSection === 'users' && canManageUsers && !hasLoaded) {
      loadUsers()
    }
  }, [activeSection, canManageUsers])

  // Actions utilisateur
  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const result = await response.json()
        setUsers(prev => [result.user, ...prev])
        setShowCreateModal(false)
        toast.success('Utilisateur créé avec succès')
        
        if (userData.sendInvite) {
          toast.success('Email d\'invitation envoyé')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !isActive } : user
        ))
        toast.success(`Utilisateur ${!isActive ? 'activé' : 'désactivé'}`)
      } else {
        toast.error('Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('Utilisateur supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
    setSelectedUser(null)
    toast.success('Utilisateur mis à jour')
  }

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'ACTIVE' && user.isActive) ||
                         (statusFilter === 'INACTIVE' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (!canManageUsers) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">Accès non autorisé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérer les comptes, permissions et invitations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                   transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection('users')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeSection === 'users'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Utilisateurs Actifs ({users.length})
          </button>
          <button
            onClick={() => setActiveSection('invitations')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeSection === 'invitations'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mail className="w-5 h-5 mr-2" />
            Gestion des Invitations
          </button>
        </div>
      </div>

      {/* Contenu */}
      {activeSection === 'users' ? (
        <>
          {/* Filtres */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ADMIN">Administrateur</option>
                <option value="INFIRMIER_CHEF">Infirmier Chef</option>
                <option value="INFIRMIER">Infirmier</option>
                <option value="MEDECIN">Médecin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="px-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {filteredUsers.length} utilisateur(s)
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur correspond aux filtres'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getRoleColor(user.role) === 'red' ? 'bg-red-100 text-red-800' :
                              getRoleColor(user.role) === 'purple' ? 'bg-purple-100 text-purple-800' :
                              getRoleColor(user.role) === 'blue' ? 'bg-blue-100 text-blue-800' :
                              getRoleColor(user.role) === 'green' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.isActive ? (
                              <div className="flex items-center">
                                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-sm text-green-800">Actif</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="h-2 w-2 bg-red-400 rounded-full mr-2"></div>
                                <span className="text-sm text-red-800">Inactif</span>
                              </div>
                            )}
                            {user.isWhitelisted && (
                              <Shield className="h-4 w-4 text-yellow-500 ml-2" title="Utilisateur privilégié" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400">Jamais connecté</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={`p-1 rounded ${user.isActive 
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'}`}
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {user.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <InvitationManagement />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  )
}

// Modal de création
function CreateUserModal({ onClose, onCreate }: { onClose: () => void, onCreate: (data: CreateUserData) => void }) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    name: '',
    role: 'INFIRMIER',
    sendInvite: true
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
        <h2 className="text-xl font-bold mb-4">Créer un nouvel utilisateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendInvite"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">
              Envoyer un email d'invitation
            </label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal d'édition
function EditUserModal({ user, onClose, onUpdate }: { user: User, onClose: () => void, onUpdate: (user: User) => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        onUpdate(updatedUser.user)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Compte actif
            </label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}