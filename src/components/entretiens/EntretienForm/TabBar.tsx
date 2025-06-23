// src/components/entretiens/EntretienForm/TabBar.tsx - Version optimisée
'use client';

import React from 'react';
import { 
  Heart, 
  Stethoscope, 
  ClipboardList, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
  zIndex: number;
  position: number;
  isMinimized: boolean;
}

interface TabBarProps {
  sections: Section[];
  onMaximize: (id: string) => void;
  activeSection?: string | null;
  onSectionFocus?: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ 
  sections, 
  onMaximize, 
  activeSection,
  onSectionFocus 
}) => {
  // Configuration des icônes et couleurs pour chaque section
  const getSectionConfig = (sectionId: string) => {
    switch (sectionId) {
      case 'sante':
        return {
          icon: Heart,
          color: 'from-green-500 to-emerald-600',
          hoverColor: 'from-green-600 to-emerald-700',
          bgColor: 'bg-green-50/80',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          activeClass: 'sante-tab'
        };
      case 'examen':
        return {
          icon: Stethoscope,
          color: 'from-blue-500 to-cyan-600',
          hoverColor: 'from-blue-600 to-cyan-700',
          bgColor: 'bg-blue-50/80',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          activeClass: 'examen-tab'
        };
      case 'imaa':
        return {
          icon: ClipboardList,
          color: 'from-orange-500 to-amber-600',
          hoverColor: 'from-orange-600 to-amber-700',
          bgColor: 'bg-orange-50/80',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          activeClass: 'imaa-tab'
        };
      case 'conclusion':
        return {
          icon: FileText,
          color: 'from-purple-500 to-pink-600',
          hoverColor: 'from-purple-600 to-pink-700',
          bgColor: 'bg-purple-50/80',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          activeClass: 'conclusion-tab'
        };
      default:
        return {
          icon: FileText,
          color: 'from-medical-500 to-violet-500',
          hoverColor: 'from-medical-600 to-violet-600',
          bgColor: 'bg-slate-50/80',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          activeClass: ''
        };
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (section: Section) => {
    if (!section.isMinimized) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    return <Clock className="w-3 h-3 text-slate-400" />;
  };

  // Fonction pour gérer le clic sur un onglet
  const handleTabClick = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.isMinimized) {
      onMaximize(sectionId);
    } else if (onSectionFocus) {
      onSectionFocus(sectionId);
    }
  };

  return (
    <div className="w-full">
      {/* Conteneur principal des onglets */}
      <div className="glass-card rounded-2xl p-3 border border-white/30 shadow-lg">
        <div className="flex flex-wrap gap-2">
          {sections
            .sort((a, b) => a.position - b.position)
            .map((section) => {
              const config = getSectionConfig(section.id);
              const IconComponent = config.icon;
              const isActive = activeSection === section.id;
              const isOpen = !section.isMinimized;

              return (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(section.id)}
                  className={`
                    section-tab ${config.activeClass}
                    group relative overflow-hidden
                    ${isActive ? 'active' : ''}
                    ${isOpen ? 'ring-2 ring-white/40' : ''}
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-medical-500/50
                  `}
                  title={`${section.title} ${isOpen ? '(Ouvert)' : '(Fermé)'}`}
                >
                  {/* Background gradient animé */}
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-r ${config.hoverColor}
                    transition-opacity duration-300
                  `} />
                  
                  {/* Contenu de l'onglet */}
                  <div className="relative flex items-center gap-3 px-4 py-3">
                    {/* Icône avec conteneur coloré */}
                    <div className={`
                      relative flex items-center justify-center
                      w-8 h-8 rounded-lg
                      ${isOpen ? `bg-gradient-to-r ${config.color}` : config.bgColor}
                      ${isOpen ? 'text-white' : config.textColor}
                      transition-all duration-300
                      group-hover:scale-110
                    `}>
                      <IconComponent className="w-4 h-4" />
                      
                      {/* Indicateur de statut */}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(section)}
                      </div>
                    </div>

                    {/* Texte et informations */}
                    <div className="flex flex-col items-start text-left">
                      <span className={`
                        font-semibold text-sm
                        ${isOpen ? 'text-slate-800' : 'text-slate-600'}
                        group-hover:text-slate-900
                        transition-colors duration-200
                      `}>
                        {section.title}
                      </span>
                      
                      {/* Indicateur d'état */}
                      <span className={`
                        text-xs font-medium
                        ${isOpen ? 'text-green-600' : 'text-slate-400'}
                        transition-colors duration-200
                      `}>
                        {isOpen ? 'En cours' : 'En attente'}
                      </span>
                    </div>

                    {/* Badge numérique pour l'ordre */}
                    <div className={`
                      flex items-center justify-center
                      w-6 h-6 rounded-full text-xs font-bold
                      ${isOpen 
                        ? 'bg-white/20 text-slate-700' 
                        : 'bg-slate-100 text-slate-500'
                      }
                      transition-all duration-200
                    `}>
                      {section.position + 1}
                    </div>
                  </div>

                  {/* Barre de progression en bas (si ouvert) */}
                  {isOpen && (
                    <div className="absolute bottom-0 left-0 right-0 h-1">
                      <div className={`
                        w-full h-full
                        bg-gradient-to-r ${config.color}
                        opacity-60
                      `} />
                    </div>
                  )}

                  {/* Effet de brillance au survol */}
                  <div className="
                    absolute inset-0 opacity-0 group-hover:opacity-20
                    bg-gradient-to-r from-transparent via-white to-transparent
                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700 ease-out
                  " />
                </button>
              );
            })}
        </div>

        {/* Légende et raccourcis */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            {/* Légende des statuts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Section ouverte</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Section fermée</span>
              </div>
            </div>

            {/* Compteurs */}
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {sections.filter(s => !s.isMinimized).length} sur {sections.length} ouverte(s)
              </span>
              
              {/* Indicateur de progression globale */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-medical-500 to-violet-500 transition-all duration-500"
                    style={{
                      width: `${(sections.filter(s => !s.isMinimized).length / sections.length) * 100}%`
                    }}
                  />
                </div>
                <span className="font-medium text-slate-700">
                  {Math.round((sections.filter(s => !s.isMinimized).length / sections.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions d'utilisation (masquables) */}
      <div className="mt-2 p-2 glass-card rounded-lg border border-white/20 bg-white/10">
        <p className="text-xs text-slate-600 text-center">
          💡 <strong>Astuce :</strong> Cliquez sur un onglet pour ouvrir/fermer la section correspondante. 
          Les sections ouvertes peuvent être redimensionnées et repositionnées.
        </p>
      </div>
    </div>
  );
};