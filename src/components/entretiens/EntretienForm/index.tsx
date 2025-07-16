// src/components/entretiens/EntretienForm/index.tsx - Version Harmonisée Dashboard Style
'use client';

import '@/styles/entretien.css';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { 
  ZoomIn, ZoomOut, ChevronDown, ChevronUp, Clock, Edit3, 
  PanelLeftClose, PanelLeftOpen, Save, ArrowLeft, Check
} from 'lucide-react';
import { Timer } from '@/components/ui/timer';
import { useEntretienTimer } from '@/hooks/useEntretienTimer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { validateEntretienData, getDefaultEntretienData, mergeEntretienData } from '@/utils/entretien-data';
import { safeParseResponse } from '@/utils/json';

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
    motifs: [],
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const statusButtonRef = useRef<HTMLButtonElement>(null);

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

  // Générer le titre dynamique
  const getDynamicTitle = useCallback(() => {
    if (entretienId) {
      return `${isReadOnly ? 'Consultation' : 'Modification'} de l'entretien n°${entretienData.numeroEntretien}`;
    }
    
    // Pour nouvel entretien - titre de base
    const baseTitle = `Nouvel entretien : N°${entretienData.numeroEntretien}`;
    
    // Protection renforcée pour les motifs
    const motifs = entretienData.santeTravail?.vecuTravail?.motifVisite?.motifs;
    const validMotifs = Array.isArray(motifs) ? motifs.filter(m => m && typeof m === 'string' && m.trim()) : [];
    
    if (validMotifs.length > 0) {
      const motifsToShow = validMotifs.slice(0, 2).join(' & ');
      return (
        <>
          {baseTitle}
          <div className="text-sm font-light text-blue-600/80 mt-1">
            {motifsToShow}
          </div>
        </>
      );
    }
    
    return baseTitle;
  }, [entretienId, isReadOnly, entretienData.numeroEntretien, entretienData.santeTravail?.vecuTravail?.motifVisite?.motifs]);

  // Titre pour la sidebar
  const getSidebarTitle = useCallback(() => {
    return 'Navigation';
  }, []);

  // Obtenir le style du statut
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'finalise':
        return {
          label: 'Finalisé',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-800',
          borderColor: 'border-emerald-300',
          icon: '✓'
        };
      case 'brouillon':
      default:
        return {
          label: 'Brouillon',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-300',
          icon: '✏️'
        };
    }
  }, []);

  // Fonction de sauvegarde
  const saveEntretien = useCallback(async () => {
    try {
      const currentId = localEntretienId || entretienId;
      const now = new Date();
      
      const donneesASerialiser = {
        santeTravail: entretienData.santeTravail,
        examenClinique: entretienData.examenClinique,
        imaa: entretienData.imaa,
        conclusion: entretienData.conclusion
      };
      
      const entretienToSave: EntretienToSave = {
        patientId: patient.id || 0,
        numeroEntretien: entretienData.numeroEntretien,
        status: entretienData.status,
        donneesEntretien: JSON.stringify(donneesASerialiser)
      };
      
      if (!currentId) {
        // Pour un nouvel entretien, calculer le temps de début basé sur le temps écoulé
        const tempsDebutCalcule = new Date(now.getTime() - (seconds * 1000));
        entretienToSave.tempsDebut = tempsDebutCalcule.toISOString();
        entretienToSave.enPause = isPaused;
        entretienToSave.tempsPause = 0;
      }
      
      const url = currentId ? `/api/entretiens/${currentId}` : '/api/entretiens';
      const method = currentId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entretienToSave)
      });
      
      const parseResult = await safeParseResponse(response);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Erreur de parsing de la réponse');
      }
      
      const result = parseResult.data;
      
      if (!currentId && result.data && result.data.id) {
        const newEntretienId = result.data.id;
        setLocalEntretienId(newEntretienId);
        
        // Sauvegarder immédiatement le temps écoulé après création
        if (seconds > 0) {
          await fetch(`/api/entretiens/${newEntretienId}/elapsed-time`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elapsedSeconds: seconds })
          });
        }
        
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
  }, [localEntretienId, entretienId, patient.id, entretienData, seconds, isPaused]);

  // Gérer le changement de statut
  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (isReadOnly) return;
    
    const currentId = localEntretienId || entretienId;
    const entretienToSave = {
      patientId: patient.id || 0,
      numeroEntretien: entretienData.numeroEntretien,
      status: newStatus,
      donneesEntretien: JSON.stringify({
        santeTravail: entretienData.santeTravail,
        examenClinique: entretienData.examenClinique,
        imaa: entretienData.imaa,
        conclusion: entretienData.conclusion
      })
    };
    
    try {
      const url = currentId ? `/api/entretiens/${currentId}` : '/api/entretiens';
      const method = currentId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entretienToSave)
      });
      
      const parseResult = await safeParseResponse(response);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Erreur de parsing de la réponse');
      }
      
      const result = parseResult.data;
      
      // Mettre à jour l'état local APRÈS la sauvegarde réussie
      setEntretienData(prev => ({ ...prev, status: newStatus }));
      setShowStatusDropdown(false);
      
      toast.success(`Statut mis à jour : ${newStatus === 'brouillon' ? 'Brouillon' : 'Finalisé'}`);
      
      // Si nouveau entretien créé, sauvegarder l'ID
      if (!currentId && result.data?.id) {
        setLocalEntretienId(result.data.id);
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }, [isReadOnly, localEntretienId, entretienId, patient.id, entretienData]);

  // Effet pour calculer la position du dropdown
  useEffect(() => {
    if (showStatusDropdown && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, [showStatusDropdown]);

  // Configuration des sections
  const sections: Section[] = useMemo(() => [
    {
      id: 'sante',
      title: 'Santé au Travail',
      icon: <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>,
      color: 'border-yellow-500 bg-yellow-50',
      isActive: activeSection === 'sante'
    },
    {
      id: 'examen',
      title: 'Examen Clinique',
      icon: <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>,
      color: 'border-purple-500 bg-purple-50',
      isActive: activeSection === 'examen'
    },
    {
      id: 'imaa',
      title: 'IMAA',
      icon: <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>,
      color: 'border-orange-500 bg-orange-50',
      isActive: activeSection === 'imaa'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      icon: <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>,
      color: 'border-pink-500 bg-pink-50',
      isActive: activeSection === 'conclusion'
    }
  ], [activeSection]);

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

  const handleCloseEntretien = useCallback(async () => {
    const currentId = localEntretienId || entretienId;
    
    try {
      // Vérifier s'il y a des modifications ou du temps écoulé
      const hasChanges = seconds > 0 || Object.keys(entretienData.santeTravail.vecuTravail.motifVisite.motifs).length > 0;
      
      if (!currentId && hasChanges) {
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
  }, [localEntretienId, entretienId, isPaused, entretienData.status, forcePause, onClose, seconds, entretienData.santeTravail.vecuTravail.motifVisite.motifs]);

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

  // Handlers de changement de données
  const handleSanteTravailChange = useCallback((newData: { vecuTravail: VecuTravailData; modeVie: ModeVieData }) => {
    setEntretienData(prev => {
      const updated = { 
        ...prev, 
        santeTravail: {
          vecuTravail: {
            ...prev.santeTravail.vecuTravail,
            ...newData.vecuTravail,
            motifVisite: {
              ...prev.santeTravail.vecuTravail.motifVisite,
              ...newData.vecuTravail.motifVisite
            }
          },
          modeVie: {
            ...prev.santeTravail.modeVie,
            ...newData.modeVie
          }
        }
      };
      return updated;
    });
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
      
      if (e.key === 'Escape') {
        setShowStatusDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (showStatusDropdown) {
        setShowStatusDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [saveEntretien, goToNextSection, goToPrevSection, isReadOnly, showStatusDropdown]);

  // Chargement des données d'entretien
  useEffect(() => {
    if (entretienId) {
      const fetchEntretien = async () => {
        try {
          const response = await fetch(`/api/entretiens/${entretienId}`);
          
          // Vérifier si la réponse est une redirection vers une page d'authentification
          if (response.status === 404 || response.url.includes('/auth/')) {
            toast.error('Session expirée. Veuillez vous reconnecter.');
            window.location.href = '/auth/login';
            return;
          }
          
          const parseResult = await safeParseResponse(response);
          
          if (!parseResult.success) {
            console.error('Erreur de parsing:', parseResult.error);
            toast.error('Erreur lors du chargement de l\'entretien. Données par défaut utilisées.');
            return;
          }
          
          const result = parseResult.data;
          
          if (!result.data) {
            throw new Error('Données non trouvées');
          }
          
          // Validation et parsing sécurisé des données entretien
          const validationResult = validateEntretienData(result.data.donneesEntretien);
          
          if (!validationResult.isValid) {
            console.error('Erreurs de validation des données entretien:', validationResult.errors);
            console.error('Données reçues:', result.data.donneesEntretien);
            toast.error('Erreur dans les données d\'entretien. Données par défaut utilisées.');
          }
          
          const donnees = validationResult.data;
          
          // Construction sécurisée des données avec fusion correcte
          const nouvellesDonnees = {
            numeroEntretien: result.data.numeroEntretien,
            status: result.data.status,
            santeTravail: {
              vecuTravail: {
                ...initialVecuTravailData,
                ...donnees.santeTravail?.vecuTravail,
                motifVisite: {
                  motifs: Array.isArray(donnees.santeTravail?.vecuTravail?.motifVisite?.motifs) 
                    ? donnees.santeTravail.vecuTravail.motifVisite.motifs
                    : initialVecuTravailData.motifVisite.motifs,
                  commentaires: donnees.santeTravail?.vecuTravail?.motifVisite?.commentaires || 
                                initialVecuTravailData.motifVisite.commentaires
                }
              },
              modeVie: {
                ...initialModeVieData,
                ...donnees.santeTravail?.modeVie
              }
            },
            examenClinique: {
              ...defaultExamenCliniqueData,
              ...donnees.examenClinique
            },
            imaa: donnees.imaa || {},
            conclusion: {
              ...defaultConclusionData,
              ...donnees.conclusion
            }
          };
          
          setEntretienData(nouvellesDonnees);
          
          // Gestion du timer si entretien existant
          if (result.data.tempsDebut) {
            const debut = new Date(result.data.tempsDebut);
            let elapsedSeconds = 0;
            
            // Si tempsFin est sauvegardé, l'utiliser pour le calcul précis
            if (result.data.tempsFin) {
              const fin = new Date(result.data.tempsFin);
              // tempsFin représente déjà le temps écoulé réel (sans pauses)
              elapsedSeconds = Math.floor((fin.getTime() - debut.getTime()) / 1000);
            } else {
              // Calcul traditionnel pour les anciens entretiens
              const now = new Date();
              elapsedSeconds = Math.floor((now.getTime() - debut.getTime()) / 1000);
              
              if (result.data.tempsPause) {
                elapsedSeconds -= result.data.tempsPause;
              }
              
              if (result.data.enPause && result.data.dernierePause) {
                const dernierePause = new Date(result.data.dernierePause);
                const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
                elapsedSeconds -= pauseDuration;
              }
            }
            
            // Logique améliorée pour déterminer si le timer doit être en pause
            const shouldBePaused = 
              isReadOnly || 
              result.data.status === 'finalise' || 
              result.data.status === 'archive' || 
              (result.data.status === 'brouillon' && result.data.enPause);
            
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
    <div className="h-full flex relative" style={{ zoom: `${globalZoom}%` }}>
      {/* Sidebar de navigation des sections */}
      <div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex flex-col h-screen overflow-hidden`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.02) 75%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* En-tête de navigation */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            {!sidebarCollapsed && (
              <div className="flex-1">
                <h1 className="text-xl font-medium bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  {getSidebarTitle()}
                </h1>
              </div>
            )}
            <div className="flex items-center gap-1">
              {!sidebarCollapsed && (
                <>
                  <button
                    onClick={() => setGlobalZoom(prev => Math.max(prev - 5, 80))}
                    className="p-2 hover:bg-white/40 rounded-lg text-slate-600 transition-all"
                    title="Zoom -"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-xs font-medium text-slate-600 min-w-[35px] text-center">{globalZoom}%</span>
                  <button
                    onClick={() => setGlobalZoom(prev => Math.min(prev + 5, 120))}
                    className="p-2 hover:bg-white/40 rounded-lg text-slate-600 transition-all"
                    title="Zoom +"
                  >
                    <ZoomIn size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-white/40 rounded-lg text-slate-600 transition-all"
                title={sidebarCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
          </div>
          
          {!sidebarCollapsed && (
            <p className="text-sm text-slate-700 text-center font-light">
              Navigation entre les sections
            </p>
          )}
        </div>

        {/* Liste des sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div style={{ height: '120px' }}></div>
          
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={section.id} className="relative">
                <button
                  onClick={() => scrollToSection(section.id)}
                  data-section={section.id}
                  className={`nav-item w-full ${
                    section.isActive ? 'active' : ''
                  } transition-all duration-300`}
                  title={sidebarCollapsed ? section.title : undefined}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                      <div className="relative">
                        {section.icon}
                      </div>
                      {!sidebarCollapsed && (
                        <div>
                          <span className="font-medium text-slate-800">{section.title}</span>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-slate-500">Partie {index + 1}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!sidebarCollapsed && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection(section.id);
                        }}
                        className="p-1 hover:bg-white/40 rounded cursor-pointer"
                      >
                        {expandedSections.has(section.id) ? 
                          <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">−</span>
                          </div> : 
                          <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+</span>
                          </div>
                        }
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions de navigation */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={goToPrevSection}
                disabled={activeSection === sections[0]?.id}
                className="flex-1 px-3 py-2 text-sm bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
              >
                ← Précédent
              </button>
              <button
                onClick={goToNextSection}
                disabled={activeSection === sections[sections.length - 1]?.id}
                className="flex-1 px-3 py-2 text-sm bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
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
        )}
      </div>

      {/* Zone principale avec contenu */}
      <div className="flex-1 flex flex-col">
        {/* En-tête fixe */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-bl-3xl blur-xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-medium bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    {getDynamicTitle()}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-2xl blur"></div>
                      <div className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {patient.civilites === 'Monsieur' ? 'M' : patient.civilites === 'Madame' ? 'Mme' : 'Mx'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {patient.nom} {patient.prenom}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <span>{patient.age} ans</span>
                              <span>•</span>
                              <span>{patient.poste}</span>
                              <span>•</span>
                              <span>{patient.departement}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isReadOnly && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur"></div>
                        <div className="relative bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 rounded-xl px-3 py-2 flex items-center">
                          <Clock size={16} className="text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Lecture seule</span>
                        </div>
                      </div>
                    )}

                    {/* Menu déroulant de statut */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-xl blur"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-slate-700">Statut :</label>
                          <div className="relative">
                            <button
                              ref={statusButtonRef}
                              onClick={() => !isReadOnly && setShowStatusDropdown(!showStatusDropdown)}
                              disabled={isReadOnly}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl transition-all ${
                                getStatusInfo(entretienData.status).bgColor
                              } ${getStatusInfo(entretienData.status).borderColor} ${
                                isReadOnly ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg cursor-pointer'
                              }`}
                            >
                              <span className="text-lg">{getStatusInfo(entretienData.status).icon}</span>
                              <span className={`text-sm font-medium ${getStatusInfo(entretienData.status).textColor}`}>
                                {getStatusInfo(entretienData.status).label}
                              </span>
                              {!isReadOnly && (
                                <svg 
                                  className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''} ${getStatusInfo(entretienData.status).textColor}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Timer 
                    seconds={seconds}
                    isPaused={isPaused}
                    onTogglePause={togglePause}
                    isReadOnly={isReadOnly || entretienData.status !== 'brouillon'}
                    className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-xl px-4 py-2 shadow-lg"
                  />
                  
                  
                  {onClose && (
                    <button
                      onClick={handleCloseEntretien}
                      className="px-4 py-2 text-sm font-medium bg-white/40 backdrop-blur-xl border border-white/50 rounded-xl hover:bg-white/50 transition-all duration-300 text-slate-700 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <ArrowLeft size={16} />
                      Retour
                    </button>
                  )}
                  
                  {!isReadOnly && (
                    <button 
                      onClick={saveEntretien}
                      className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Sauvegarder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Zone de contenu scrollable */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
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
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      1
                    </div>
                    <h2 className="text-lg font-medium text-slate-800">Santé au Travail</h2>
                  </div>
                  <div 
                    className="w-5 h-5 bg-gradient-to-br rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                    style={{
                      background: expandedSections.has('sante') 
                        ? 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)' 
                        : 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('sante');
                    }}
                  >
                    <span className="text-white text-sm font-bold">
                      {expandedSections.has('sante') ? '−' : '+'}
                    </span>
                  </div>
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
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                    <h2 className="text-lg font-medium text-slate-800">Examen Clinique</h2>
                  </div>
                  {expandedSections.has('examen') ? 
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">−</span>
                    </div> : 
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      3
                    </div>
                    <h2 className="text-lg font-medium text-slate-800">IMAA</h2>
                  </div>
                  {expandedSections.has('imaa') ? 
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">−</span>
                    </div> : 
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">+</span>
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

            {/* Section Conclusion */}
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
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      4
                    </div>
                    <h2 className="text-lg font-medium text-slate-800">Conclusion</h2>
                  </div>
                  {expandedSections.has('conclusion') ? 
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">−</span>
                    </div> : 
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">+</span>
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
                className="px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/50 rounded-xl hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium text-slate-700"
              >
                <ChevronUp size={16} />
                Section précédente
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-xl blur"></div>
                  <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl px-4 py-2">
                    <div className="text-sm text-slate-600 font-medium">
                      Section {sections.findIndex(s => s.id === activeSection) + 1} sur {sections.length}
                    </div>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <button 
                    onClick={saveEntretien}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                  >
                    <Save size={16} />
                    Sauvegarder les modifications
                  </button>
                )}
              </div>
              
              <button
                onClick={goToNextSection}
                disabled={activeSection === sections[sections.length - 1]?.id}
                className="px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/50 rounded-xl hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium text-slate-700"
              >
                Section suivante
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Résumé final */}
            {entretienData.status === 'finalise' && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Check size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-emerald-800">Entretien finalisé !</h3>
                      <p className="text-sm text-emerald-600 font-light">Cet entretien a été marqué comme terminé.</p>
                    </div>
                  </div>
                </div>
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

      {/* Dropdown de statut */}
      {showStatusDropdown && !isReadOnly && (
        <div 
          className="fixed w-48 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            zIndex: 2147483647,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            backgroundColor: 'white',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div className="py-1">
            <button
              onClick={() => handleStatusChange('brouillon')}
              className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors flex items-center gap-3 ${
                entretienData.status === 'brouillon' ? 'bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">✏️</span>
              <div>
                <div className="font-medium text-amber-800">Brouillon</div>
                <div className="text-xs text-amber-600">En cours de rédaction</div>
              </div>
              {entretienData.status === 'brouillon' && (
                <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => handleStatusChange('finalise')}
              className={`w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center gap-3 ${
                entretienData.status === 'finalise' ? 'bg-emerald-50' : ''
              }`}
            >
              <span className="text-lg">✓</span>
              <div>
                <div className="font-medium text-emerald-800">Finalisé</div>
                <div className="text-xs text-emerald-600">Entretien terminé</div>
              </div>
              {entretienData.status === 'finalise' && (
                <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};