'use client';
import { NavigationTab } from '@/types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-blue-900 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Gestion Médicale</h1>
        <nav className="space-y-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-800'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => onTabChange('patients')}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === 'patients' ? 'bg-blue-800' : 'hover:bg-blue-800'
            }`}
          >
            Dossiers Patients
          </button>
          <button
            onClick={() => onTabChange('newDossier')}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === 'newDossier' ? 'bg-blue-800' : 'hover:bg-blue-800'
            }`}
          >
            Nouveau Dossier
          </button>
        </nav>
      </div>
    </aside>
  );
};