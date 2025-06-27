//src\components\layout\Sidebar.tsx - Version optimisée finale

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
      <div className="w-72 sidebar-glass flex flex-col h-screen">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-12 glass rounded-xl"></div>
            <div className="h-3 glass rounded w-3/4"></div>
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
    <div 
      className="w-72 flex flex-col h-screen custom-scrollbar overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.02) 75%, rgba(255, 255, 255, 0.08) 100%)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.15)'
      }}
    >
      {/* Header avec logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Logo 
            width={160}
            height={60}
            className="transition-all duration-300 hover:scale-105 drop-shadow-sm"
          />
          <div className="text-center">
            <p className="text-slate-600 text-sm font-light">Système Médical Sécurisé</p>
            <div className="flex items-center justify-center space-x-1 mt-0.5">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-500 font-light">SSL Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-item w-full group py-3 px-4 ${
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
                  <span className={`font-light text-lg ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-slate-800 group-hover:text-slate-900'
                  }`}>
                    {tab.label}
                  </span>
                  {tab.description && (
                    <p className={`text-base mt-0.5 font-normal ${
                      activeTab === tab.id 
                        ? 'text-white/80' 
                        : 'text-slate-600 group-hover:text-slate-700'
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
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Informations utilisateur */}
        <div className="backdrop-blur-2xl border border-white/40 rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-soft">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white shadow-sm ${
                user.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-light text-slate-800 truncate text-sm">
                {user.name || 'Utilisateur'}
              </p>
              <p className="text-slate-600 text-sm truncate font-light">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Badge de rôle et statut */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-light border ${getRoleBadgeClasses(user.role)}`}>
              <Shield className="h-3 w-3 mr-1" />
              {getRoleDisplayName(user.role)}
            </span>
            
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${
                user.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-sm font-light ${
                user.isActive ? 'text-green-700' : 'text-red-600'
              }`}>
                {user.isActive ? 'En ligne' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton de déconnexion - Harmonisé et simplifié */}
        <div
          onClick={handleSignOut}
          className="w-full border border-white/40 rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:border-red-400/50 hover:shadow-lg flex items-center justify-center space-x-2 py-3 cursor-pointer"
          style={{
            background: 'none',
            backdropFilter: 'blur(16px)'
          }}
        >
          <LogOut className="h-5 w-5" style={{ color: '#dc2626' }} />
          <span className="font-medium text-base" style={{ color: '#dc2626', background: 'transparent' }}>
            Se déconnecter
          </span>
        </div>
      </div>
    </div>
  );
};