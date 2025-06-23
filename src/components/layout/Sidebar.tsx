//src\components\layout\Sidebar.tsx

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
import { Logo } from '@/components/ui/Logo';

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

  // Chargement avec skeleton glassmorphique
  if (isLoading) {
    return (
      <div className="w-80 sidebar-glass flex flex-col h-screen">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 glass rounded-xl"></div>
            <div className="h-4 glass rounded w-3/4"></div>
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
      label: 'Gestion des listes',
      icon: <Settings className="w-5 h-5" />,
      show: true,
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

  // Fonction pour obtenir la couleur du badge de rôle
  const getRoleBadgeClasses = (role: string) => {
    const color = getRoleColor(role);
    switch (color) {
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  return (
    <div className="w-80 sidebar-glass flex flex-col h-screen custom-scrollbar">
      {/* Header avec logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Logo 
            width={200}
            height={80}
            className="transition-all duration-300 hover:scale-105 drop-shadow-sm"
          />
          <div className="text-center">
            <p className="text-slate-600 text-sm font-medium">Système Médical Sécurisé</p>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Connexion SSL Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-item w-full group ${
                activeTab === tab.id ? 'active bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg' : ''
              } ${tab.id === 'patients' ? 'patients-link' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'bg-white/5 text-slate-600 group-hover:bg-white/10 group-hover:text-slate-800'
                }`}>
                  {tab.icon}
                </div>
                <div className="flex-1 text-left">
                  <span className={`font-medium text-sm ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {tab.label}
                  </span>
                  {tab.description && (
                    <p className={`text-xs mt-0.5 ${
                      activeTab === tab.id 
                        ? 'text-white/80' 
                        : 'text-slate-500 group-hover:text-slate-600'
                    }`}>
                      {tab.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Profil utilisateur */}
      <div className="p-6 border-t border-white/10 space-y-4">
        {/* Informations utilisateur */}
        <div className="glass-card bg-white/5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-medical-400 to-medical-600 rounded-xl flex items-center justify-center shadow-soft">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                user.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate text-sm">
                {user.name || 'Utilisateur'}
              </p>
              <p className="text-slate-600 text-xs truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Badge de rôle et statut */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getRoleBadgeClasses(user.role)}`}>
              <Shield className="h-3 w-3 mr-1.5" />
              {getRoleDisplayName(user.role)}
            </span>
            
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${
                user.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                user.isActive ? 'text-green-700' : 'text-red-600'
              }`}>
                {user.isActive ? 'En ligne' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleSignOut}
          className="btn-glass w-full flex items-center justify-center space-x-3 py-3 text-slate-700 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 border border-white/20 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium text-sm">Se déconnecter</span>
        </button>
      </div>

      {/* Footer avec informations de sécurité */}
      <div className="p-6 border-t border-white/10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-600">
            <Shield className="h-3 w-3" />
            <span>Session active 4h max</span>
          </div>
          <p className="text-xs text-slate-500">© 2024 Vital Sync</p>
        </div>
      </div>
    </div>
  );
};