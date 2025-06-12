'use client';

import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Users, 
  Plus, 
  Calendar, 
  Settings, 
  LogOut, 
  User,
  Shield,
  BarChart3,
  Stethoscope,
  UserCog
} from 'lucide-react'

type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin' | 'userManagement' | 'calendar';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { 
    user, 
    isLoading, 
    canAccessAdmin, 
    canViewPatients,
    getRoleDisplayName,
    getRoleColor
  } = useAuth()

  // Si en cours de chargement
  if (isLoading) {
    return (
      <div className="w-64 bg-blue-700 text-white flex flex-col h-screen">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-blue-600 rounded mb-2"></div>
            <div className="h-4 bg-blue-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur connecté
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await signOut({ callbackUrl: '/auth/login' })
    }
  }

  // Configuration des onglets selon les permissions
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Tableau de bord',
      icon: <BarChart3 className="w-5 h-5" />,
      show: true
    },
    {
      id: 'patients' as NavigationTab,
      label: 'Dossiers employés',
      icon: <Users className="w-5 h-5" />,
      show: canViewPatients()
    },
    {
      id: 'newDossier' as NavigationTab,
      label: 'Nouveau employé',
      icon: <Plus className="w-5 h-5" />,
      show: canViewPatients()
    },
    {
      id: 'calendar' as NavigationTab,
      label: 'Calendrier',
      icon: <Calendar className="w-5 h-5" />,
      show: true
    },
    {
      id: 'admin' as NavigationTab,
      label: 'Administration',
      icon: <Settings className="w-5 h-5" />,
      show: canAccessAdmin(),
      description: 'Listes, Formulaires, Risques'
    },
    {
      id: 'userManagement' as NavigationTab,
      label: 'Gestion Utilisateurs',
      icon: <UserCog className="w-5 h-5" />,
      show: canAccessAdmin(),
      description: 'Comptes et Permissions'
    }
  ].filter(tab => tab.show)

  return (
    <div className="w-64 bg-blue-700 text-white flex flex-col h-screen">
      {/* Header avec logo */}
      <div className="p-4 border-b border-blue-600">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Vital Sync</h1>
            <p className="text-blue-200 text-sm">Système Sécurisé</p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex flex-col gap-1 px-4 py-3 rounded-lg
              transition-all duration-200 ${tab.id === 'patients' ? 'patients-link' : ''}
              ${activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-lg'
                : 'text-white hover:bg-blue-600 hover:shadow-md'
              }`}
          >
            <div className="flex items-center gap-3">
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </div>
            {tab.description && (
              <span className={`text-xs ml-8 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-blue-200'
              }`}>
                {tab.description}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4 border-t border-blue-600">
        {/* Informations utilisateur */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {user.name || 'Utilisateur'}
              </p>
              <p className="text-blue-200 text-sm truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Badge de rôle */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${getRoleColor(user.role) === 'red' ? 'bg-red-100 text-red-800' :
                getRoleColor(user.role) === 'purple' ? 'bg-purple-100 text-purple-800' :
                getRoleColor(user.role) === 'blue' ? 'bg-blue-100 text-blue-800' :
                getRoleColor(user.role) === 'green' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}`}>
              <Shield className="h-3 w-3 mr-1" />
              {getRoleDisplayName(user.role)}
            </span>
            
            {user.isActive ? (
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-green-200 text-xs ml-1">En ligne</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                <span className="text-red-200 text-xs ml-1">Inactif</span>
              </div>
            )}
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                   text-white hover:bg-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* Footer avec informations de sécurité */}
      <div className="p-4 border-t border-blue-600">
        <div className="text-center text-xs text-blue-200 space-y-1">
          <p>Connexion sécurisée SSL</p>
          <p>⏱ Session active 4h max</p>
          <p className="text-blue-300">© 2024 Vital Sync</p>
        </div>
      </div>
    </div>
  );
};