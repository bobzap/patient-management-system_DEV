// src/components/entretiens/EntretienForm/index.tsx - Version Finale Corrigée
'use client';


import '@/styles/entretien.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Patient } from '@/types';
import { SanteTravail } from '../sections/SanteAuTravail';
import { ExamenClinique } from '../sections/ExamenClinique';
import { Conclusion } from '../sections/Conclusion';
import { defaultExamenCliniqueData } from '../types/defaultData';
import { defaultConclusionData } from '../types/defaultData';
import type { VecuTravailData } from '../sections/SanteAuTravail/VecuTravail';
import type { ModeVieData } from '../sections/SanteAuTravail/ModeVie';
import { IMAA } from '../sections/IMAA';
import { ZoomIn, ZoomOut, ChevronDown, ChevronUp, Check, Clock, Edit3 } from 'lucide-react';
import { Timer } from '@/components/ui/timer';
import { useEntretienTimer } from '@/hooks/useEntretienTimer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Interfaces
interface EntretienData {
  numeroEntretien: number;
  status: string;
  santeTravail: {
    vecuTravail: VecuTravailData;
    modeVie: ModeVieData;
  };
  examenClinique: any;
  imaa: any;
  conclusion: any;
}

interface EntretienToSave {
  patientId: number;
  numeroEntretien: number;
  status: string;
  donneesEntretien: string;
  tempsDebut?: string;
  enPause?: boolean;
  tempsPause?: number;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface EntretienFormProps {
  patient: Patient;
  entretienId?: number | null;
  isReadOnly?: boolean;
  onClose?: () => void;
}

// Données initiales
const initialVecuTravailData: VecuTravailData = {
  motifVisite: { 
    motifs: [''],
    commentaires: '' 
  },
  postesOccupes: '',
  posteDeTravail: {
    descriptionTaches: '',
    risquesProfessionnels: '',
    installationMateriel: ''
  },
  ressentiTravail: {
    relationCollegues: 5,
    relationHierarchie: 5,
    stress: 5,
    satisfaction: 5,
    commentaires: ''
  },
  plaintesTravail: {
    existence: false,
    commentaires: ''
  }
};

const initialModeVieData: ModeVieData = {
  loisirs: {
    activitePhysique: false,
    frequence: '',
    commentaires: ''
  },
  addictions: {
    tabac: { consommation: false, quantiteJour: '', depuis: '' },
    medicaments: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
    alcool: { consommation: false, quantiteSupDix: false, frequence: '' },
    cannabis: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
    droguesDures: { consommation: false, depuis: '', frequence: '' },
    commentairesGeneraux: ''
  }
};

export const EntretienForm = ({ patient, entretienId, isReadOnly = false, onClose }: EntretienFormProps) => {
  // États principaux
  const [localEntretienId, setLocalEntretienId] = useState<number | null>(entretienId || null);
  const [globalZoom, setGlobalZoom] = useState(100);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sante');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['sante']));

  // Refs pour le scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // État de l'entretien
  const [entretienData, setEntretienData] = useState<EntretienData>({
    numeroEntretien: 1,
    status: 'brouillon',
    santeTravail: {
      vecuTravail: initialVecuTravailData,
      modeVie: initialModeVieData
    },
    examenClinique: defaultExamenCliniqueData,
    imaa: {},
    conclusion: defaultConclusionData
  });
  
  const [initialTimerState, setInitialTimerState] = useState({
    initialSeconds: 0,
    initialPaused: entretienId ? true : false
  });
  
  // Hook timer
  const { 
    seconds, 
    isPaused, 
    togglePause, 
    forcePause 
  } = useEntretienTimer({
    entretienId: localEntretienId || entretienId || null,
    isReadOnly,
    status: entretienData.status,
    initialSeconds: initialTimerState.initialSeconds,
    initialPaused: initialTimerState.initialPaused
  });

  // Configuration des sections avec statut de complétion
  const sections: Section[] = [
  {
    id: 'sante',
    title: 'Santé au Travail',
    icon: <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">1</div>,
    color: 'border-yellow-500 bg-yellow-50',
    isCompleted: !!(entretienData.santeTravail.vecuTravail.motifVisite.motifs[0] || entretienData.santeTravail.vecuTravail.postesOccupes),
    isActive: activeSection === 'sante'
  },
  {
    id: 'examen',
    title: 'Examen Clinique',
    icon: <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">2</div>,
    color: 'border-purple-500 bg-purple-50',
    isCompleted: !!(entretienData.examenClinique?.biometrie?.poids || entretienData.examenClinique?.biometrie?.tension),
    isActive: activeSection === 'examen'
  },
    {
      id: 'imaa',
      title: 'IMAA',
      icon: <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">3</div>,
      color: 'border-orange-500 bg-orange-50',
      isCompleted: Object.keys(entretienData.imaa || {}).length > 0,
      isActive: activeSection === 'imaa'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      icon: <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">4</div>,
      color: 'border-pink-500 bg-pink-50',
      isCompleted: !!(entretienData.conclusion?.aptitude || entretienData.conclusion?.recommandations),
      isActive: activeSection === 'conclusion'
    }
  ];

  // Fonction de scroll intelligent vers une section
  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = element.offsetTop - 80;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      
      if (!expandedSections.has(sectionId)) {
        setExpandedSections(prev => new Set([...prev, sectionId]));
      }
    }
  }, [expandedSections]);

  // Navigation suivant/précédent
  const goToNextSection = useCallback(() => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      scrollToSection(sections[currentIndex + 1].id);
    }
  }, [activeSection, sections, scrollToSection]);

  const goToPrevSection = useCallback(() => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      scrollToSection(sections[currentIndex - 1].id);
    }
  }, [activeSection, sections, scrollToSection]);

  // Toggle expansion d'une section
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    
    if (!expandedSections.has(sectionId)) {
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  }, [expandedSections, scrollToSection]);

  // Fonctions de sauvegarde
  const saveEntretien = useCallback(async () => {
    try {
      const currentId = localEntretienId || entretienId;
      const now = new Date();
      const entretienToSave: EntretienToSave = {
        patientId: patient.id || 0,
        numeroEntretien: entretienData.numeroEntretien,
        status: entretienData.status,
        donneesEntretien: JSON.stringify({
          santeTravail: entretienData.santeTravail,
          examenClinique: entretienData.examenClinique,
          imaa: entretienData.imaa,
          conclusion: entretienData.conclusion
        })
      };
      
      if (!currentId) {
        entretienToSave.tempsDebut = now.toISOString();
        entretienToSave.enPause = false;
        entretienToSave.tempsPause = 0;
      }
      
      const url = currentId ? `/api/entretiens/${currentId}` : '/api/entretiens';
      const method = currentId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entretienToSave)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!currentId && result.data && result.data.id) {
        const newEntretienId = result.data.id;
        setLocalEntretienId(newEntretienId);
        toast.success('Entretien créé avec succès');
        return newEntretienId;
      } else {
        toast.success('Entretien mis à jour avec succès');
        return currentId;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return null;
    }
  }, [localEntretienId, entretienId, patient.id, entretienData]);

  const handleCloseEntretien = useCallback(async () => {
    const currentId = localEntretienId || entretienId;
    
    try {
      if (!currentId && !isPaused) {
        setShowSaveConfirmDialog(true);
        return;
      } else if (currentId && !isPaused && entretienData.status === 'brouillon') {
        await forcePause();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la fermeture de l'entretien:", error);
      if (onClose) onClose();
    }
  }, [localEntretienId, entretienId, isPaused, entretienData.status, forcePause, onClose]);

  // Handlers de changement de données
  const handleSanteTravailChange = useCallback((newData: { vecuTravail: VecuTravailData; modeVie: ModeVieData }) => {
    setEntretienData(prev => ({ ...prev, santeTravail: newData }));
  }, []);
  
  const handleExamenCliniqueChange = useCallback((newData: any) => {
    setEntretienData(prev => ({ ...prev, examenClinique: newData }));
  }, []);
  
  const handleImaaChange = useCallback((newData: any) => {
    setEntretienData(prev => ({ ...prev, imaa: newData }));
  }, []);
  
  const handleConclusionChange = useCallback((newData: any) => {
    setEntretienData(prev => ({ ...prev, conclusion: newData }));
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (!isReadOnly) saveEntretien();
            break;
          case 'ArrowDown':
            e.preventDefault();
            goToNextSection();
            break;
          case 'ArrowUp':
            e.preventDefault();
            goToPrevSection();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveEntretien, goToNextSection, goToPrevSection, isReadOnly]);

  // Chargement des données d'entretien
  useEffect(() => {
    if (entretienId) {
      const fetchEntretien = async () => {
        try {
          console.log(`Chargement de l'entretien ${entretienId}`);
          const response = await fetch(`/api/entretiens/${entretienId}`);
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.data) {
            throw new Error('Données non trouvées');
          }
          
          let donnees = {};
          if (typeof result.data.donneesEntretien === 'string') {
            donnees = JSON.parse(result.data.donneesEntretien);
          } else {
            donnees = result.data.donneesEntretien || {};
          }
          
          setEntretienData({
            numeroEntretien: result.data.numeroEntretien,
            status: result.data.status,
            santeTravail: donnees.santeTravail || { vecuTravail: initialVecuTravailData, modeVie: initialModeVieData },
            examenClinique: donnees.examenClinique || defaultExamenCliniqueData,
            imaa: donnees.imaa || {},
            conclusion: donnees.conclusion || defaultConclusionData
          });
          
          if (result.data.tempsDebut) {
            const debut = new Date(result.data.tempsDebut);
            const now = new Date();
            let elapsedSeconds = Math.floor((now.getTime() - debut.getTime()) / 1000);
            
            if (result.data.tempsPause) {
              elapsedSeconds -= result.data.tempsPause;
            }
            
            if (result.data.enPause && result.data.dernierePause) {
              const dernierePause = new Date(result.data.dernierePause);
              const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
              elapsedSeconds -= pauseDuration;
            }
            
            const shouldBePaused = 
              isReadOnly || 
              result.data.status === 'finalise' || 
              result.data.status === 'archive' || 
              result.data.enPause;
            
            setInitialTimerState({
              initialSeconds: Math.max(0, elapsedSeconds),
              initialPaused: shouldBePaused
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast.error('Erreur lors du chargement des données');
        }
      };
      
      fetchEntretien();
    } else {
      setInitialTimerState({
        initialSeconds: 0,
        initialPaused: false
      });
      
      const fetchNextEntretienNumber = async () => {
        try {
          const response = await fetch(`/api/patients/${patient.id}/entretiens`);
          const result = await response.json();
          
          let nextNumber = 1;
          if (result.success && result.data && result.data.length > 0) {
            const maxNumber = Math.max(...result.data.map((e: any) => e.numeroEntretien || 0));
            nextNumber = maxNumber + 1;
          }
          
          setEntretienData(prev => ({
            ...prev,
            numeroEntretien: nextNumber
          }));
        } catch (error) {
          console.warn('Erreur lors de la récupération du numéro d\'entretien:', error);
        }
      };
      
      fetchNextEntretienNumber();
    }
  }, [entretienId, patient.id, isReadOnly]);

  // Effet pour assurer la mise en pause au démontage
  useEffect(() => {
    return () => {
      const currentId = localEntretienId || entretienId;
      
      if (currentId && !isPaused && entretienData.status === 'brouillon') {
        fetch(`/api/entretiens/${currentId}/timer`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enPause: true })
        }).catch(error => {
          console.error("Erreur lors de la mise en pause au démontage:", error);
        });
      }
    };
  }, [localEntretienId, entretienId, isPaused, entretienData.status]);

  return (
    <div className="h-full flex relative">
  {/* Sidebar de navigation des sections */}
  <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 shadow-2xl flex flex-col">
        {/* En-tête de navigation */}
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Navigation</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGlobalZoom(prev => Math.max(prev - 5, 80))}
                className="p-1 hover:bg-white/40 rounded text-slate-600"
                title="Zoom -"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-medium text-slate-600 min-w-[35px] text-center">{globalZoom}%</span>
              <button
                onClick={() => setGlobalZoom(prev => Math.min(prev + 5, 120))}
                className="p-1 hover:bg-white/40 rounded text-slate-600"
                title="Zoom +"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
          
          {/* Progression globale */}
<div className="bg-slate-300 rounded-full h-3 mb-2 shadow-inner border border-slate-400">
  <div 
    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-lg"
    style={{ width: `${(sections.filter(s => s.isCompleted).length / sections.length) * 100}%` }}
  />
</div>
          <p className="text-sm text-slate-700 text-center font-medium">
  {sections.filter(s => s.isCompleted).length} sur {sections.length} sections complétées
</p>
        </div>

        {/* Liste des sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {sections.map((section, index) => (
            <div key={section.id} className="relative">
              <button
                onClick={() => scrollToSection(section.id)}
                data-section={section.id}
                className={`nav-item w-full text-left p-3 rounded-lg transition-all duration-200 border-2 ${
                  section.isActive ? 'active' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {section.icon}
                      {section.isCompleted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">{section.title}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-slate-500">Partie {index + 1}</span>
                        {section.isCompleted && (
                          <span className="text-xs text-green-600 font-medium">✓ Complétée</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(section.id);
                    }}
                    className="p-1 hover:bg-white/40 rounded"
                  >
                    {expandedSections.has(section.id) ? 
  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-white text-xs font-bold">−</span>
  </div> : 
  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
    <span className="text-white text-xs font-bold">+</span>
  </div>
}
                  </button>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Actions de navigation */}
        <div className="p-4 border-t border-white/30 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={goToPrevSection}
              disabled={activeSection === sections[0]?.id}
              className="flex-1 px-3 py-2 text-sm btn-glass disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Précédent
            </button>
            <button
              onClick={goToNextSection}
              disabled={activeSection === sections[sections.length - 1]?.id}
              className="flex-1 px-3 py-2 text-sm btn-glass disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Suivant →
            </button>
          </div>
          
          {/* Raccourcis clavier */}
          <div className="text-xs text-slate-500 text-center space-y-1">
            <div>⌘/Ctrl + S : Sauvegarder</div>
            <div>⌘/Ctrl + ↑/↓ : Navigation</div>
          </div>
        </div>
      </div>

      {/* Zone principale avec contenu */}
      <div className="flex-1 flex flex-col">
        {/* En-tête fixe */}
        <div className="bg-white/90 backdrop-blur-md border-b border-white/40 shadow-sm">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent">
                  {entretienId 
                    ? `${isReadOnly ? 'Consultation' : 'Modification'} de l'entretien n°${entretienData.numeroEntretien}` 
                    : 'Nouvel entretien'} - {patient.civilites} {patient.nom} {patient.prenom}
                </h1>
                <div className="text-sm text-slate-600 mt-1">
                  {patient.age} ans • {patient.poste} • {patient.departement}
                  {isReadOnly && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      <Clock size={12} className="mr-1" />
                      Lecture seule
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Timer 
                  seconds={seconds}
                  isPaused={isPaused}
                  onTogglePause={togglePause}
                  isReadOnly={isReadOnly || entretienData.status !== 'brouillon'}
                  className="glass-card"
                />
                
                {onClose && (
                  <button
                    onClick={handleCloseEntretien}
                    className="px-4 py-2 text-sm font-medium text-slate-700 btn-glass"
                  >
                    ← Retour
                  </button>
                )}
                
                {!isReadOnly && (
                  <button 
                    onClick={saveEntretien}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Edit3 size={14} />
                    Sauvegarder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Zone de contenu scrollable */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ zoom: `${globalZoom}%` }}
        >
          <div className="p-6 space-y-6">
           
            {/* Section Santé au Travail */}
            <div 
              ref={(el) => sectionRefs.current['sante'] = el}
              className={`section-container sante-section transition-all duration-300 ${
                expandedSections.has('sante') ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div 
                className={`section-header ${activeSection === 'sante' ? 'active' : ''}`}
                onClick={() => toggleSection('sante')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
          1
        </div>
                    <h2 className="text-lg font-semibold text-slate-800">Santé au Travail</h2>
                    {sections.find(s => s.id === 'sante')?.isCompleted && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </div>
                  {expandedSections.has('sante') ? 
  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">−</span>
  </div> : 
  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">+</span>
  </div>
}
                </div>
              </div>
              
              {expandedSections.has('sante') && (
                <div className="section-content">
                  <SanteTravail 
                    data={entretienData.santeTravail}
                    onChange={handleSanteTravailChange}
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}
            </div>

            {/* Section Examen Clinique */}
            <div 
              ref={(el) => sectionRefs.current['examen'] = el}
              className={`section-container examen-section transition-all duration-300 ${
                expandedSections.has('examen') ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div 
                className={`section-header ${activeSection === 'examen' ? 'active' : ''}`}
                onClick={() => toggleSection('examen')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          2
        </div>
                    <h2 className="text-lg font-semibold text-slate-800">Examen Clinique</h2>
                    {sections.find(s => s.id === 'examen')?.isCompleted && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </div>
                  {expandedSections.has('examen') ? 
  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">−</span>
  </div> : 
  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">+</span>
  </div>
}
                </div>
              </div>
              
              {expandedSections.has('examen') && (
                <div className="section-content">
                  <ExamenClinique 
                    data={entretienData.examenClinique}
                    onChange={handleExamenCliniqueChange}
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}
            </div>

            {/* Section IMAA */}
            <div 
              ref={(el) => sectionRefs.current['imaa'] = el}
              className={`section-container imaa-section transition-all duration-300 ${
                expandedSections.has('imaa') ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div 
                className={`section-header ${activeSection === 'imaa' ? 'active' : ''}`}
                onClick={() => toggleSection('imaa')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">IMAA</h2>
                    {sections.find(s => s.id === 'imaa')?.isCompleted && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </div>
                  {expandedSections.has('imaa') ? 
  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">−</span>
  </div> : 
  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">+</span>
  </div>
}
                </div>
              </div>
              
              {expandedSections.has('imaa') && (
                <div className="section-content">
                  <IMAA 
                    data={entretienData.imaa || {}}
                    onChange={handleImaaChange}
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}
            </div>

            {/* Section Conclusion - ROSE */}
            <div 
              ref={(el) => sectionRefs.current['conclusion'] = el}
              className={`section-container conclusion-section transition-all duration-300 ${
                expandedSections.has('conclusion') ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div 
                className={`section-header ${activeSection === 'conclusion' ? 'active' : ''}`}
                onClick={() => toggleSection('conclusion')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Conclusion</h2>
                    {sections.find(s => s.id === 'conclusion')?.isCompleted && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </div>
                  {expandedSections.has('conclusion') ? 
  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">−</span>
  </div> : 
  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-bold">+</span>
  </div>
}
                </div>
              </div>
              
              {expandedSections.has('conclusion') && (
                <div className="section-content">
                  <Conclusion 
                    data={entretienData.conclusion}
                    onChange={handleConclusionChange}
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}
            </div>

            {/* Boutons de navigation en bas */}
            <div className="flex justify-between items-center py-8">
              <button
                onClick={goToPrevSection}
                disabled={activeSection === sections[0]?.id}
                className="px-6 py-3 btn-glass disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                <ChevronUp size={16} />
                Section précédente
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  Section {sections.findIndex(s => s.id === activeSection) + 1} sur {sections.length}
                </div>
                
                {!isReadOnly && (
                  <button 
                    onClick={saveEntretien}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Sauvegarder les modifications
                  </button>
                )}
              </div>
              
              <button
                onClick={goToNextSection}
                disabled={activeSection === sections[sections.length - 1]?.id}
                className="px-6 py-3 btn-glass disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                Section suivante
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Résumé final si toutes les sections sont complétées */}
            {sections.every(s => s.isCompleted) && (
              <div className="glass-card bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Entretien complété !</h3>
                    <p className="text-sm text-green-600">Toutes les sections ont été remplies.</p>
                  </div>
                </div>
                
                {!isReadOnly && entretienData.status === 'brouillon' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEntretienData(prev => ({ ...prev, status: 'finalise' }));
                        saveEntretien();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      Finaliser l'entretien
                    </button>
                    <button
                      onClick={saveEntretien}
                      className="px-4 py-2 btn-glass text-green-700 border border-green-300"
                    >
                      Sauvegarder en brouillon
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={showSaveConfirmDialog}
        onClose={() => setShowSaveConfirmDialog(false)}
        onConfirm={async () => {
          setShowSaveConfirmDialog(false);
          await saveEntretien();
          if (onClose) onClose();
        }}
        onCancel={() => setShowSaveConfirmDialog(false)}
        onThirdOption={() => {
          setShowSaveConfirmDialog(false);
          if (onClose) onClose();
        }}
        title="Sauvegarder l'entretien"
        message="Voulez-vous sauvegarder cet entretien avant de quitter ?"
        confirmText="Sauvegarder"
        cancelText="Annuler" 
        thirdOptionText="Quitter sans sauvegarder"
        variant="info"
      />
    </div>
  );
};