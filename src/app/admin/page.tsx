// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ListManager } from '@/components/admin/ListManager';
import { FormBuilder } from '@/components/admin/FormBuilder';
import { RisquesProfessionnels } from '@/components/admin/RisquesProfessionnels';
import { List, Settings, AlertCircle } from 'lucide-react';

type AdminSection = 'lists' | 'forms' | 'risques';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('lists');
  
  useEffect(() => {
    console.log("AdminPage: Section active:", activeSection);
  }, [activeSection]);

  return (
    <div className="space-y-6">
      {/* Sous-navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4 flex-wrap">
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
          
          <button
            onClick={() => setActiveSection('risques')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeSection === 'risques'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Risques Professionnels
          </button>
        </div>
        
        {/* Description de la section active */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {activeSection === 'lists' && "Gérez les listes déroulantes utilisées dans les formulaires"}
            {activeSection === 'forms' && "Configurez la structure et l'apparence des formulaires"}
            {activeSection === 'risques' && "Administrez la base de données des risques professionnels"}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeSection === 'lists' && (
          <ListManager />
        )}
        
        {activeSection === 'forms' && (
          <div className="p-6">
            <FormBuilder />
          </div>
        )}
        
        {activeSection === 'risques' && (
          <div className="p-6">
            <RisquesProfessionnels />
          </div>
        )}
      </div>
    </div>
  );
}