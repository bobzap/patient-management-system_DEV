// src/components/entretiens/EntretienForm/index.tsx
'use client';

import React, { useState, useEffect, useCallback  } from 'react';
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
  isReadOnly?: boolean; // Prop pour le mode consultation
  onClose?: () => void;
}

// Après les interfaces et avant export const EntretienForm
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

export const EntretienForm = ({ patient, entretienId, isReadOnly = false, onClose }: EntretienFormProps) => {
  // États
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [globalZoom, setGlobalZoom] = useState(100);
  // Modifications à apporter au fichier src/components/entretiens/EntretienForm/index.tsx

  const { 
    seconds, 
    isPaused, 
    isStarted, 
    formatTime, 
    togglePause, 
    forcePause 
  } = useEntretienTimer({
    entretienId: entretienId || null,
    isReadOnly,
    status: entretienData.status,
    initialSeconds: timerSeconds,
    initialPaused: timerPaused
  });

  const [sections, setSections] = useState<Section[]>([
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
  ]);

  // Fonction remplaçant handleDragEnd
  const updateSectionOrder = (sectionId: string, newPosition: number) => {
    // Obtenir les indices actuels
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1 || newPosition === currentIndex) return;
    
    // Créer une copie des sections
    const newSections = [...sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newPosition, 0, movedSection);
    
    // Mettre à jour les positions
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      position: index
    }));
    
    setSections(updatedSections);
  };

// Gestionnaire de mise à jour du temps
const handleTimeUpdate = useCallback((seconds: number) => {
  setTimerSeconds(seconds);
}, []);


// Gestionnaire de changement d'état de pause
const handlePauseChange = useCallback((isPaused: boolean) => {
  console.log(`Timer - Changement d'état de pause: ${isPaused ? 'pause' : 'reprise'}`);
  setTimerPaused(isPaused);
  
  // Mettre à jour l'état de pause en base de données si c'est un entretien existant
  if (entretienId) {
    fetch(`/api/entretiens/${entretienId}/timer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enPause: isPaused })
    }).catch(error => {
      console.error('Erreur lors de la mise à jour du timer:', error);
    });
  }
}, [entretienId]);


  // src/components/entretiens/EntretienForm/index.tsx
// Modifiez la fonction arrangeWindowsVertically
const arrangeWindowsVertically = () => {
  // Récupérer les sections non minimisées
  const visibleSections = sections.filter(s => !s.isMinimized);
  
  if (visibleSections.length === 0) return;
  
  // Obtenir les dimensions réelles du conteneur
  const container = document.querySelector('.max-w-\\[98\\%\\]');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width - 40; // Marge de 20px de chaque côté
  const containerHeight = window.innerHeight - containerRect.top - 150; // Hauteur disponible
  
  // Largeur pour chaque section (répartie équitablement)
  const sectionMargin = 20;
  const totalMargins = sectionMargin * (visibleSections.length - 1);
  const optimalWidth = Math.max(400, (containerWidth - totalMargins) / visibleSections.length);
  
  // Hauteur adaptative, utilisant plus d'espace vertical
  const optimalHeight = Math.max(550, containerHeight - 100);
  
  // Mettre à jour chaque section
  const updatedSections = sections.map(section => {
    if (section.isMinimized) return section;
    
    // L'index dans les sections visibles
    const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
    
    // Calculer la position horizontale
    const leftPosition = visibleIndex * (optimalWidth + sectionMargin);
    
    // Mise à jour du style qui sera appliqué directement à l'élément
    if (section.id) {
      const element = document.querySelector(`[data-section-id="${section.id}"]`);
      if (element instanceof HTMLElement) {
        element.style.left = `${leftPosition}px`;
        element.style.top = '20px';
        element.style.width = `${optimalWidth}px`;
        element.style.height = `${optimalHeight}px`;
      }
    }
    
    return {
      ...section,
      width: optimalWidth,
      height: optimalHeight,
      position: visibleIndex
    };
  });
  
  setSections(updatedSections);
};

const arrangeWindowsEvenly = () => {
  // Récupérer les sections non minimisées
  const visibleSections = sections.filter(s => !s.isMinimized);
 
  if (visibleSections.length === 0) return;
 
  // Obtenir les dimensions réelles du conteneur
  const container = document.querySelector('.max-w-\\[98\\%\\]');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width - 40; // Marge de 20px de chaque côté
  const containerHeight = window.innerHeight - containerRect.top - 150; // Hauteur disponible
 
  // Déterminer le nombre optimal de colonnes et lignes
  const columns = visibleSections.length <= 2 ? Math.min(visibleSections.length, 2) : 2;
  const rows = Math.ceil(visibleSections.length / columns);
 
  // Calculer les dimensions optimales avec des marges entre les sections
  const sectionMargin = 20;
  const totalHorizontalMargins = sectionMargin * (columns - 1);
  const totalVerticalMargins = sectionMargin * (rows - 1);
 
  // Dimensions plus grandes pour chaque section
  const optimalWidth = Math.max(450, (containerWidth - totalHorizontalMargins) / columns);
  const optimalHeight = Math.max(400, (containerHeight - totalVerticalMargins) / rows);
 
  // Mettre à jour chaque section
  const updatedSections = sections.map(section => {
    if (section.isMinimized) return section;
   
    // L'index dans les sections visibles
    const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
   
    // Calculer la position en grille
    const rowIndex = Math.floor(visibleIndex / columns);
    const colIndex = visibleIndex % columns;
   
    const leftPosition = colIndex * (optimalWidth + sectionMargin);
    const topPosition = rowIndex * (optimalHeight + sectionMargin);
   
    // Mise à jour du style qui sera appliqué directement à l'élément
    if (section.id) {
      const element = document.querySelector(`[data-section-id="${section.id}"]`);
      if (element instanceof HTMLElement) {
        element.style.left = `${leftPosition}px`;
        element.style.top = `${topPosition}px`;
        element.style.width = `${optimalWidth}px`;
        element.style.height = `${optimalHeight}px`;
      }
    }
   
    return {
      ...section,
      width: optimalWidth,
      height: optimalHeight,
      position: visibleIndex
    };
  });
 
  setSections(updatedSections);
};





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

  // Gestionnaires d'événements
  const handleMinimize = (id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: true } : section
    ));
    if (focusedSection === id) {
      setFocusedSection(null);
    }
  };

  const handleMaximize = (id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: false } : section
    ));
  };

  const handleToggleFocus = (id: string) => {
    setFocusedSection(focusedSection === id ? null : id);
  };

  const bringToFront = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, zIndex: newZIndex } : section
      )
    );
  }

  const handleResize = (id: string, size: { width: number; height: number }) => {
    bringToFront(id);
    setSections(prev =>
      prev.map(section =>
        section.id === id 
          ? { ...section, width: size.width, height: size.height }
          : section
      )
    );
  };

  // Ajustez le resetSizes pour réinitialiser les sections
  // Fonction améliorée pour réinitialiser complètement les sections
  const resetSizes = () => {
    // Minimiser toutes les sections
    const defaultSections = sections.map(section => ({
      ...section,
      isMinimized: true
    }));
  
    setSections(defaultSections);
    setMaxZIndex(1);
    setFocusedSection(null);
  };

  // Gestionnaires de mise à jour des sections
  const handleSanteTravailChange = (newData: { vecuTravail: VecuTravailData; modeVie: ModeVieData }) => {
    setEntretienData(prev => ({
      ...prev,
      santeTravail: newData
    }));
  };

  const handleExamenCliniqueChange = (newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      examenClinique: newData
    }));
  };

  const handleImaaChange = (newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      imaa: newData
    }));
  };

  // Correction du gestionnaire pour la Conclusion
  const handleConclusionChange = (newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      conclusion: newData
    }));
  };

  // Fonction pour rendre le contenu de chaque section
  const renderSectionContent = (sectionId: string) => {
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
  };

  // Fonction pour rendre les sections
  const renderSections = () => {
    const visibleSections = sections.filter(s => !s.isMinimized);
    const zoomFactor = 1 / (window.outerWidth / window.innerWidth);

    return (
      <div 
        className="max-w-[98%] mx-auto"
        style={{
          height: '80vh',  // Utilise 80% de la hauteur de la fenêtre
          overflow: 'auto', // Scrollable si nécessaire
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
                  // Les positions sont gérées par les fonctions de mise en page
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
  };

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
          
          console.log(`Timer - Temps calculé: ${elapsedSeconds}s`);
          setTimerSeconds(Math.max(0, elapsedSeconds));
          
          // Déterminer l'état de pause initial
          const shouldBePaused = 
            isReadOnly || // En mode lecture seule, toujours en pause
            result.data.status === 'finalise' || // Entretiens finalisés toujours en pause
            result.data.status === 'archive'; // Entretiens archivés toujours en pause
          
          console.log(`Timer - État de pause initial: ${shouldBePaused ? 'pause' : 'actif'}`);
          setTimerPaused(shouldBePaused);
          setTimerStarted(true);
          
          // Si on est en mode édition d'un entretien en brouillon qui était en pause,
          // le sortir automatiquement de pause
          if (result.data.status === 'brouillon' && !isReadOnly && result.data.enPause) {
            console.log(`Timer - Sortie automatique de pause pour l'entretien ${entretienId}`);
            fetch(`/api/entretiens/${entretienId}/timer`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enPause: false })
            }).catch(error => {
              console.error('Erreur lors de la sortie de pause:', error);
            });
          }
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
    setTimerStarted(true);
    setTimerPaused(false);
    setTimerSeconds(0);
    
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
        // Silencieux en cas d'erreur, garder le numéro par défaut
      }
    };

    fetchNextEntretienNumber();
  }
}, [entretienId, patient.id, isReadOnly]);

// Effet pour assurer la mise en pause à la fermeture
useEffect(() => {
  return () => {
    console.log("Démontage du composant EntretienForm");
    
    // Si on a un entretien en brouillon non pausé, le mettre en pause
    if (entretienId && entretienData.status === 'brouillon' && !timerPaused) {
      console.log(`Timer - Mise en pause de l'entretien ${entretienId} au démontage`);
      fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: true })
      }).catch(error => {
        console.error('Erreur lors de la mise en pause au démontage:', error);
      });
    }
  };
}, [entretienId, entretienData.status, timerPaused]);



// Fonction pour sauvegarder l'entretien
const saveEntretien = async () => {
  try {
    console.log(`Sauvegarde de l'entretien ${entretienId || 'nouveau'}`);
    
    // Préparation des données
    const now = new Date();
    const entretienToSave = {
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
    if (!entretienId) {
      entretienToSave.tempsDebut = now.toISOString();
      entretienToSave.enPause = false;
      entretienToSave.tempsPause = 0;
    }
    
    // URL et méthode selon création ou modification
    const url = entretienId ? 
      `/api/entretiens/${entretienId}` : 
      '/api/entretiens';
    
    const method = entretienId ? 'PUT' : 'POST';
    
    // Envoi de la requête
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entretienToSave)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Sauvegarde réussie:", result);
    
    // Si c'est un nouvel entretien, mettre à jour l'ID local
    if (!entretienId && result.data && result.data.id) {
      // On pourrait rediriger vers l'entretien avec l'ID nouvellement créé
      // ou mettre à jour l'état local
      console.log(`Nouvel entretien créé avec ID: ${result.data.id}`);
    }
    
    toast.success(entretienId ? 
      'Entretien mis à jour avec succès' : 
      'Entretien créé avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    toast.error('Une erreur est survenue lors de la sauvegarde');
  }
};


// Fonction pour fermer l'entretien (avec mise en pause automatique)
const handleCloseEntretien = useCallback(async () => {
  console.log("Fermeture d'entretien demandée");
  
  // Si c'est un entretien existant en brouillon, le mettre en pause avant de fermer
  if (entretienId && entretienData.status === 'brouillon' && !timerPaused) {
    try {
      console.log(`Timer - Mise en pause de l'entretien ${entretienId} avant fermeture`);
      const response = await fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: true })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de la mise en pause: ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise en pause:', error);
    }
  }
  
  // Appeler la fonction de fermeture passée en prop
  await forcePause(); // Force la pause avant de fermer
  if (onClose) {
    onClose();
  }
}, [entretienId, entretienData.status, timerPaused, onClose]);



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

    {/* Timer */}
    {isStarted && (
  <div className="flex-shrink-0">
    <Timer 
      seconds={seconds}
      isPaused={isPaused}
      onTogglePause={togglePause}
      isReadOnly={isReadOnly || entretienData.status !== 'brouillon'}
      className="border border-gray-200"
    />
  </div>
)}

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
    </div>
  );
};