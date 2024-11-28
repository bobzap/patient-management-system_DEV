'use client';
// app/admin/page.tsx

import { useState } from 'react';
import { ListManager } from '@/components/admin/ListManager';
import { FormBuilder } from '@/components/admin/FormBuilder';
import { List, Settings } from 'lucide-react';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'lists' | 'forms'>('lists');

  return (
    <div className="space-y-6">
      {/* Sous-navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection('lists')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeSection === 'lists'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5 mr-2" />
            Gestion des Listes
          </button>
          <button
            onClick={() => setActiveSection('forms')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeSection === 'forms'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Configuration des Formulaires
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeSection === 'lists' ? (
          <ListManager />
        ) : (
          <div className="p-6">
            <FormBuilder />
          </div>
        )}
      </div>
    </div>
  );
}