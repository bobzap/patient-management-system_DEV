// src/components/entretiens/EntretienForm/index.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Patient } from '@/types';
import { TabBar } from './TabBar';
import { ResizableSection } from './ResizableSection';
import { SanteTravail } from '../sections/SanteAuTravail';
import { ExamenClinique } from '../sections/ExamenClinique';
import { Conclusion } from '../sections/Conclusion';
import { defaultExamenCliniqueData } from '../types/defaultData';
import { defaultConclusionData } from '../types/defaultData';
import type { VecuTravailData } from '../sections/SanteAuTravail/VecuTravail';
import type { ModeVieData } from '../sections/SanteAuTravail/ModeVie';
import { IMAA } from '../sections/IMAA';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Timer } from '@/components/ui/timer';
import { useEntretienTimer } from '@/hooks/useEntretienTimer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Interfaces et types
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
  color: string;
  width: number;
  height: number;
  zIndex: number;
  position: number;
  isMinimized: boolean;
}

interface EntretienFormProps {
  patient: Patient;
  entretienId?: number | null;
  isReadOnly?: boolean;
  onClose?: () => void;
}

// Données initiales
const initialVecuTravailData: VecuTravailData = {
  motifVisite: { motif: '', commentaires: '' },
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

const initialSections: Section[] = [
  { 
    id: 'sante', 
    title: 'SANTÉ AU TRAVAIL', 
    color: 'bg-amber-50', 
    width: 900, 
    height: 500, 
    zIndex: 1, 
    position: 0,
    isMinimized: true
  },
  { 
    id: 'examen', 
    title: 'EXAMEN CLINIQUE', 
    color: 'bg-purple-50', 
    width: 900, 
    height: 500, 
    zIndex: 1, 
    position: 1,
    isMinimized: true
  },
  { 
    id: 'imaa', 
    title: 'IMAA', 
    color: 'bg-green-50', 
    width: 900, 
    height: 500, 
    zIndex: 1, 
    position: 2,
    isMinimized: true
  },
  { 
    id: 'conclusion', 
    title: 'CONCLUSION', 
    color: 'bg-pink-50', 
    width: 900, 
    height: 500, 
    zIndex: 1, 
    position: 3,
    isMinimized: true
  }
];

// Le composant principal
export const EntretienForm = ({ patient, entretienId, isReadOnly = false, onClose }: EntretienFormProps) => {
  // État pour suivre l'ID de l'entretien localement (après sauvegarde initiale)
  const [localEntretienId, setLocalEntretienId] = useState<number | null>(entretienId || null);
  
  // États UI
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [globalZoom, setGlobalZoom] = useState(100);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  
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
  
  // État pour initialiser le timer
  const [initialTimerState, setInitialTimerState] = useState({
    initialSeconds: 0,
    initialPaused: entretienId ? true : false
  });
  
  // Hook pour la gestion du timer
  const { 
    seconds, 
    isPaused, 
    isStarted, 
    formatTime, 
    togglePause, 
    forcePause 
  } = useEntretienTimer({
    entretienId: localEntretienId || entretienId || null,
    isReadOnly,
    status: entretienData.status,
    initialSeconds: initialTimerState.initialSeconds,
    initialPaused: initialTimerState.initialPaused
  });
  
  // Effet pour synchroniser localEntretienId avec entretienId
  useEffect(() => {
    if (entretienId) {
      setLocalEntretienId(entretienId);
    }
  }, [entretienId]);
  
  // Fonction de sauvegarde optimisée
  const saveEntretien = useCallback(async () => {
    try {
      const currentId = localEntretienId || entretienId;
      console.log(`Sauvegarde de l'entretien ${currentId || 'nouveau'}`);
      
      // Préparation des données
      const now = new Date();
      const entretienToSave: EntretienToSave = {
        patientId: patient.id,
        numeroEntretien: entretienData.numeroEntretien,
        status: entretienData.status,
        donneesEntretien: JSON.stringify({
          santeTravail: entretienData.santeTravail,
          examenClinique: entretienData.examenClinique,
          imaa: entretienData.imaa,
          conclusion: entretienData.conclusion
        })
      };
      
      // Si c'est un nouvel entretien, ajouter les données du timer
      if (!currentId) {
        entretienToSave.tempsDebut = now.toISOString();
        entretienToSave.enPause = false;
        entretienToSave.tempsPause = 0;
      }
      
      // URL et méthode selon création ou modification
      const url = currentId ? 
        `/api/entretiens/${currentId}` : 
        '/api/entretiens';
      
      const method = currentId ? 'PUT' : 'POST';
      
      // Envoi de la requête
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
      console.log("Sauvegarde réussie:", result);
      
      // Si c'est un nouvel entretien, mettre à jour l'ID local
      if (!currentId && result.data && result.data.id) {
        const newEntretienId = result.data.id;
        console.log(`Nouvel entretien créé avec ID: ${newEntretienId}`);
        
        // Mettre à jour l'état local
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
  
  // Fonction optimisée pour fermer l'entretien
  const handleCloseEntretien = useCallback(() => {
    console.log("Fermeture d'entretien demandée");
    const currentId = localEntretienId || entretienId;
    
    // Pour un nouvel entretien ou un entretien non sauvegardé avec des modifications
    if (!currentId && !isPaused) {
      // Afficher la boîte de dialogue personnalisée au lieu de window.confirm
      setShowSaveConfirmDialog(true);
      return; // Important: arrêter l'exécution ici
    } 
    // Pour un entretien existant, mettre en pause puis quitter
    else if (currentId && !isPaused && entretienData.status === 'brouillon') {
      // Mettre en pause avant de quitter
      forcePause();
    }
    
    // Pour tous les autres cas, fermer directement
    if (onClose) {
      onClose();
    }
  }, [localEntretienId, entretienId, isPaused, entretienData.status, forcePause, onClose]);
  
  // Ajoutez cette fonction pour gérer la confirmation
  const handleConfirmSave = useCallback(async () => {
    // Fermer la boîte de dialogue
    setShowSaveConfirmDialog(false);
    
    // Sauvegarder l'entretien
    const savedId = await saveEntretien();
    
    if (savedId) {
      try {
        console.log(`Entretien sauvegardé avec l'ID ${savedId}, mise en pause`);
        await fetch(`/api/entretiens/${savedId}/timer`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enPause: true })
        });
      } catch (error) {
        console.error("Erreur lors de la mise en pause après sauvegarde:", error);
      }
    }
    
    // Fermer l'entretien
    if (onClose) {
      onClose();
    }
  }, [saveEntretien, onClose]);
  
  // Ajoutez cette fonction pour gérer l'annulation
  // Dans le composant EntretienForm, modifiez la fonction handleCancelSave
  const handleCancelSave = useCallback(() => {
    // Fermer la boîte de dialogue
    setShowSaveConfirmDialog(false);
    
    // Fermer l'entretien directement sans sauvegarder
    if (onClose) {
      onClose();
    }
  }, [onClose]);


  // Effet pour assurer la mise en pause au démontage
  useEffect(() => {
    return () => {
      const currentId = localEntretienId || entretienId;
      
      if (currentId && !isPaused && entretienData.status === 'brouillon') {
        console.log(`Démontage - Mise en pause forcée de l'entretien ${currentId}`);
        
        // Appel synchrone pour s'assurer qu'il s'exécute même pendant le démontage
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
  
  // Fonctions de gestion des sections
  const updateSectionOrder = useCallback((sectionId: string, newPosition: number) => {
    // Obtenir les indices actuels
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1 || newPosition === currentIndex) return;
    
    // Créer une copie des sections et réordonner
    const newSections = [...sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newPosition, 0, movedSection);
    
    // Mettre à jour les positions
    setSections(newSections.map((section, index) => ({
      ...section,
      position: index
    })));
  }, [sections]);
  
  // Gestion de l'affichage des sections
  const arrangeWindowsVertically = useCallback(() => {
    // Récupérer les sections non minimisées
    const visibleSections = sections.filter(s => !s.isMinimized);
    
    if (visibleSections.length === 0) return;
    
    // Obtenir les dimensions réelles du conteneur
    const container = document.querySelector('.max-w-\\[98\\%\\]');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 40;
    const containerHeight = window.innerHeight - containerRect.top - 150;
    
    // Calculer les dimensions optimales
    const sectionMargin = 20;
    const totalMargins = sectionMargin * (visibleSections.length - 1);
    const optimalWidth = Math.max(400, (containerWidth - totalMargins) / visibleSections.length);
    const optimalHeight = Math.max(550, containerHeight - 100);
    
    // Mettre à jour chaque section
    setSections(prev => prev.map(section => {
      if (section.isMinimized) return section;
      
      // Calculer la position
      const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
      const leftPosition = visibleIndex * (optimalWidth + sectionMargin);
      
      // Appliquer directement les styles au DOM
      const element = document.querySelector(`[data-section-id="${section.id}"]`);
      if (element instanceof HTMLElement) {
        element.style.left = `${leftPosition}px`;
        element.style.top = '20px';
        element.style.width = `${optimalWidth}px`;
        element.style.height = `${optimalHeight}px`;
      }
      
      return {
        ...section,
        width: optimalWidth,
        height: optimalHeight,
        position: visibleIndex
      };
    }));
  }, [sections]);
  
  const arrangeWindowsEvenly = useCallback(() => {
    // Récupérer les sections non minimisées
    const visibleSections = sections.filter(s => !s.isMinimized);
    
    if (visibleSections.length === 0) return;
    
    // Obtenir les dimensions du conteneur
    const container = document.querySelector('.max-w-\\[98\\%\\]');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 40;
    const containerHeight = window.innerHeight - containerRect.top - 150;
    
    // Calculer la grille optimale
    const columns = visibleSections.length <= 2 ? Math.min(visibleSections.length, 2) : 2;
    const rows = Math.ceil(visibleSections.length / columns);
    
    const sectionMargin = 20;
    const totalHorizontalMargins = sectionMargin * (columns - 1);
    const totalVerticalMargins = sectionMargin * (rows - 1);
    
    const optimalWidth = Math.max(450, (containerWidth - totalHorizontalMargins) / columns);
    const optimalHeight = Math.max(400, (containerHeight - totalVerticalMargins) / rows);
    
    // Mettre à jour chaque section
    setSections(prev => prev.map(section => {
      if (section.isMinimized) return section;
      
      // Calculer la position
      const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
      const rowIndex = Math.floor(visibleIndex / columns);
      const colIndex = visibleIndex % columns;
      
      const leftPosition = colIndex * (optimalWidth + sectionMargin);
      const topPosition = rowIndex * (optimalHeight + sectionMargin);
      
      // Appliquer directement les styles au DOM
      const element = document.querySelector(`[data-section-id="${section.id}"]`);
      if (element instanceof HTMLElement) {
        element.style.left = `${leftPosition}px`;
        element.style.top = `${topPosition}px`;
        element.style.width = `${optimalWidth}px`;
        element.style.height = `${optimalHeight}px`;
      }
      
      return {
        ...section,
        width: optimalWidth,
        height: optimalHeight,
        position: visibleIndex
      };
    }));
  }, [sections]);
  
  const resetSizes = useCallback(() => {
    // Minimiser toutes les sections
    setSections(prev => prev.map(section => ({
      ...section,
      isMinimized: true
    })));
    
    setMaxZIndex(1);
    setFocusedSection(null);
  }, []);
  
  // Gestion des sections
  const handleMinimize = useCallback((id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: true } : section
    ));
    
    if (focusedSection === id) {
      setFocusedSection(null);
    }
  }, [focusedSection]);
  
  const handleMaximize = useCallback((id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: false } : section
    ));
  }, []);
  
  const handleToggleFocus = useCallback((id: string) => {
    setFocusedSection(prev => prev === id ? null : id);
  }, []);
  
  const bringToFront = useCallback((id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, zIndex: newZIndex } : section
    ));
  }, [maxZIndex]);
  
  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    bringToFront(id);
    
    setSections(prev => prev.map(section =>
      section.id === id 
        ? { ...section, width: size.width, height: size.height }
        : section
    ));
  }, [bringToFront]);
  
  // Gestionnaires de mise à jour des sections
  const handleSanteTravailChange = useCallback((newData: { vecuTravail: VecuTravailData; modeVie: ModeVieData }) => {
    setEntretienData(prev => ({
      ...prev,
      santeTravail: newData
    }));
  }, []);
  
  const handleExamenCliniqueChange = useCallback((newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      examenClinique: newData
    }));
  }, []);
  
  const handleImaaChange = useCallback((newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      imaa: newData
    }));
  }, []);
  
  const handleConclusionChange = useCallback((newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      conclusion: newData
    }));
  }, []);
  
  // Fonction pour rendre le contenu de chaque section
  const renderSectionContent = useCallback((sectionId: string) => {
    switch (sectionId) {
      case 'sante':
        return (
          <SanteTravail 
            data={entretienData.santeTravail}
            onChange={handleSanteTravailChange}
            isReadOnly={isReadOnly}
          />
        );
        
      case 'examen':
        return (
          <ExamenClinique 
            data={entretienData.examenClinique}
            onChange={handleExamenCliniqueChange}
            isReadOnly={isReadOnly}
          />
        );
        
      case 'imaa':
        return (
          <IMAA 
            data={entretienData.imaa || {}}
            onChange={handleImaaChange}
            isReadOnly={isReadOnly}
          />
        );
        
      case 'conclusion':
        return (
          <Conclusion 
            data={entretienData.conclusion}
            onChange={handleConclusionChange}
            isReadOnly={isReadOnly}
          />
        );
        
      default:
        return null;
    }
  }, [entretienData, handleSanteTravailChange, handleExamenCliniqueChange, handleImaaChange, handleConclusionChange, isReadOnly]);
  
  // Fonction pour rendre les sections
  const renderSections = useCallback(() => {
    const visibleSections = sections.filter(s => !s.isMinimized);
    
    return (
      <div 
        className="max-w-[98%] mx-auto"
        style={{
          height: '80vh',
          overflow: 'auto',
          position: 'relative',
          padding: '20px'
        }}
      >
        {visibleSections.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Cliquez sur un onglet pour commencer
          </div>
        ) : (
          visibleSections
            .filter(section => !focusedSection || section.id === focusedSection)
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
                className="transition-all duration-200"
                style={{
                  position: 'absolute',
                  width: `${section.width}px`,
                  height: `${section.height}px`,
                  zIndex: section.zIndex,
                }}
              >
                <ResizableSection
                  {...section}
                  isFocused={focusedSection === section.id}
                  onMinimize={handleMinimize}
                  onMaximize={handleMaximize}
                  onToggleFocus={handleToggleFocus}
                  onResize={handleResize}
                  onBringToFront={bringToFront}
                >
                  {renderSectionContent(section.id)}
                </ResizableSection>
              </div>
            ))
        )}
      </div>
    );
  }, [sections, focusedSection, handleMinimize, handleMaximize, handleToggleFocus, handleResize, bringToFront, renderSectionContent]);
  
  // Effet pour charger les données de l'entretien
  useEffect(() => {
    if (entretienId) {
      // Charger un entretien existant
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
          
          console.log(`Entretien ${entretienId} chargé:`, {
            status: result.data.status,
            enPause: result.data.enPause,
            tempsDebut: result.data.tempsDebut,
            tempsFin: result.data.tempsFin,
            tempsPause: result.data.tempsPause,
            dernierePause: result.data.dernierePause
          });
          
          // Traiter les données d'entretien
          let donnees = {};
          if (typeof result.data.donneesEntretien === 'string') {
            donnees = JSON.parse(result.data.donneesEntretien);
          } else {
            donnees = result.data.donneesEntretien || {};
          }
          
          // Mise à jour de l'état
          setEntretienData({
            numeroEntretien: result.data.numeroEntretien,
            status: result.data.status,
            santeTravail: donnees.santeTravail || {
              vecuTravail: initialVecuTravailData,
              modeVie: initialModeVieData
            },
            examenClinique: donnees.examenClinique || defaultExamenCliniqueData,
            imaa: donnees.imaa || {},
            conclusion: donnees.conclusion || defaultConclusionData
          });
          
          // Charger les données du timer
          if (result.data.tempsDebut) {
            // Calculer le temps écoulé
            const debut = new Date(result.data.tempsDebut);
            const now = new Date();
            let elapsedSeconds = Math.floor((now.getTime() - debut.getTime()) / 1000);
            
            // Soustraire le temps de pause si disponible
            if (result.data.tempsPause) {
              elapsedSeconds -= result.data.tempsPause;
            }
            
            // Si en pause et qu'il y a une dernière pause, soustraire ce temps aussi
            if (result.data.enPause && result.data.dernierePause) {
              const dernierePause = new Date(result.data.dernierePause);
              const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
              elapsedSeconds -= pauseDuration;
            }
            
            // Déterminer l'état de pause initial
            const shouldBePaused = 
              isReadOnly || // En mode lecture seule, toujours en pause
              result.data.status === 'finalise' || // Entretiens finalisés toujours en pause
              result.data.status === 'archive' || // Entretiens archivés toujours en pause
              result.data.enPause; // Respecter l'état de pause enregistré
            
            console.log(`Timer - Configuration initiale: ${Math.max(0, elapsedSeconds)}s, pause: ${shouldBePaused}`);
            
            // Mettre à jour l'état initial du timer
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
      // Pour un nouvel entretien
      console.log("Initialisation d'un nouvel entretien");
      
      // Initialiser le timer
      setInitialTimerState({
        initialSeconds: 0,
        initialPaused: false // Démarrer automatiquement pour un nouvel entretien
      });
      
      // Récupérer le prochain numéro d'entretien
      const fetchNextEntretienNumber = async () => {
        try {
          const response = await fetch(`/api/patients/${patient.id}/entretiens`);
          const result = await response.json();
          
          // Calculer le prochain numéro
          let nextNumber = 1;
          if (result.success && result.data && result.data.length > 0) {
            const maxNumber = Math.max(...result.data.map(e => e.numeroEntretien || 0));
            nextNumber = maxNumber + 1;
          }
          
          // Mettre à jour l'état
          setEntretienData(prev => ({
            ...prev,
            numeroEntretien: nextNumber
          }));
        } catch (error) {
          // Silencieux en cas d'erreur
          console.warn('Erreur lors de la récupération du numéro d\'entretien:', error);
        }
      };
      
      fetchNextEntretienNumber();
    }
  }, [entretienId, patient.id, isReadOnly]);

  
  return (
    <div>
      {/* Boutons de zoom global */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-50 bg-white rounded-lg shadow-md p-1">
        <button
          onClick={() => setGlobalZoom(prev => Math.max(prev - 5, 80))}
          className="p-1 hover:bg-gray-100 rounded"
          title="Réduire la taille"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-medium">{globalZoom}%</span>
        <button
          onClick={() => setGlobalZoom(prev => Math.min(prev + 5, 120))}
          className="p-1 hover:bg-gray-100 rounded"
          title="Augmenter la taille"
        >
          <ZoomIn size={16} />
        </button>
      </div>
      
      {/* Appliquer le zoom à tout le contenu */}
      <div style={{ zoom: `${globalZoom}%` }}>
        {/* Reste du contenu existant */}
        <div className="p-6">
          {/* En-tête avec navigation et informations */}
          <div className="max-w-[98%] mx-auto bg-white rounded-xl shadow-lg p-3 mb-3">
  {/* Barre de navigation supérieure */}
  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
    {/* Boutons de navigation - côté gauche */}
    {/* Boutons de navigation - côté gauche */}
<div className="flex items-center gap-3">
  {onClose && (
    <button
      onClick={handleCloseEntretien}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Retour au dossier
    </button>
  )}
</div>

{/* Actions principales - côté droit */}
<div className="flex items-center gap-3">
  <button
    onClick={resetSizes}
    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
  >
    Mise en page par défaut
  </button>
  
  {/* Action contextuelle (Modifier ou Sauvegarder) */}
  {isReadOnly ? (
    <button 
      onClick={() => onClose && onClose()}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Fermer
    </button>
  ) : (
    <button 
      onClick={saveEntretien}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Sauvegarder
    </button>
  )}
      </div>
            </div>
          
            {/* Informations du patient et statut */}
            <div className="mt-4 pt-4 border-t border-gray-200">
  <div className="flex flex-wrap justify-between items-start gap-4">
    <div>
      <h2 className="text-xl font-bold text-blue-900">
        {entretienId 
          ? `${isReadOnly ? 'Consultation' : 'Modification'} de l'entretien n°${entretienData.numeroEntretien}` 
          : 'Nouvel entretien'} - {patient.civilites} {patient.nom} {patient.prenom}
      </h2>
      <div className="mt-1 text-sm text-gray-600">
        {patient.age} ans • {patient.poste} • {patient.departement}
      </div>
      <div className="mt-1 text-sm text-gray-600">
        Ancienneté : {patient.anciennete} • Horaire : {patient.horaire}
      </div>
    </div>

    {/* Timer - Toujours afficher le timer, sans condition sur isStarted */}
<div className="flex-shrink-0">
  <Timer 
    seconds={seconds}
    isPaused={isPaused}
    onTogglePause={togglePause}
    isReadOnly={isReadOnly || entretienData.status !== 'brouillon'}
    className="border border-gray-200"
  />
</div>

    {/* Sélecteur de statut */}
    {!isReadOnly && (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Statut :</label>
        <select
          value={entretienData.status}
          onChange={(e) => setEntretienData(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="brouillon">Brouillon</option>
          <option value="finalise">Finalisé</option>
          <option value="archive">Archivé</option>
        </select>
      </div>
    )}
  </div>
              
              
              {/* Indicateur de mode lecture seule - si applicable */}
              {isReadOnly && (
                <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Mode consultation
                </div>
              )}
            </div>
          </div>
          
          {/* TabBar */}
          <div className="max-w-[98%] mx-auto mb-4">
            <TabBar 
              sections={sections}
              onMaximize={handleMaximize}
            />
            {/* Boutons de disposition améliorés avec des noms plus clairs */}
            <div className="flex items-center gap-2">
  <span className="text-sm text-gray-500 mr-2">Disposition:</span>
  <button
    onClick={arrangeWindowsVertically}
    className="p-1.5 rounded hover:bg-gray-100 flex flex-col items-center justify-center"
    title="Côte à côte"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="7" height="12" rx="1" />
      <rect x="14" y="6" width="7" height="12" rx="1" />
    </svg>
    <span className="text-xs mt-1">Côte à côte</span>
  </button>
  
  <button
    onClick={arrangeWindowsEvenly}
    className="p-1.5 rounded hover:bg-gray-100 flex flex-col items-center justify-center"
    title="Grille"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
    <span className="text-xs mt-1">Grille</span>
  </button>
  
  <button
    onClick={resetSizes}
    className="p-1.5 rounded hover:bg-gray-100 flex flex-col items-center justify-center"
    title="Réinitialiser"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" />
      <path d="M12 3v9l3.5 3.5" />
    </svg>
    <span className="text-xs mt-1">Réinitialiser</span>
  </button>
            </div>
          </div>

          {/* Sections - Utilisation de la fonction renderSections */}
          {renderSections()}
        </div>
      </div>




    
      <ConfirmDialog
  isOpen={showSaveConfirmDialog}
  onClose={() => setShowSaveConfirmDialog(false)}
  onConfirm={handleConfirmSave}
  onCancel={() => setShowSaveConfirmDialog(false)} // Bouton pour annuler et revenir à l'entretien
  onThirdOption={handleCancelSave} // Fonction pour quitter sans sauvegarder
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