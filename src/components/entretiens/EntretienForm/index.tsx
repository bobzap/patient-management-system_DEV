// src/components/entretiens/EntretienForm/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
import Link from 'next/link';

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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

  const arrangeWindowsEvenly = () => {
    // Récupérer les sections non minimisées
    const visibleSections = sections.filter(s => !s.isMinimized);
    
    if (visibleSections.length === 0) return;
    
    // Calculer l'espace disponible (en tenant compte de la barre latérale)
    const mainWidth = window.innerWidth - 64; // Moins 64px pour la sidebar
    const mainHeight = window.innerHeight - 150; // Moins 150px pour l'en-tête
    
    // Déterminer la disposition optimale (grille)
    const columns = visibleSections.length <= 2 ? 1 : 2;
    const rows = Math.ceil(visibleSections.length / columns);
    
    // Calculer les dimensions optimales
    const optimalWidth = (mainWidth / columns) - 20;
    const optimalHeight = (mainHeight / rows) - 20;
    
    // Mettre à jour chaque section
    const updatedSections = sections.map(section => {
      if (section.isMinimized) return section;
      
      // L'index dans les sections visibles
      const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
      
      // Calculer la position en grille
      const col = visibleIndex % columns;
      const row = Math.floor(visibleIndex / columns);
      
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

  // Ajoutez ce nouveau gestionnaire
  const handleExpand = (id: string) => {
    if (expandedSection === id) {
      setExpandedSection(null);
    } else {
      setExpandedSection(id);
      // Quand on expand une section, on la met au premier plan
      bringToFront(id);
      // Et on sort du mode focus si actif
      if (focusedSection) {
        setFocusedSection(null);
      }
    }
  };

  // Ajustez le resetSizes pour inclure l'expanded state
  const resetSizes = () => {
    setSections(prev =>
      prev.map(section => ({
        ...section,
        width: 750,
        height: 400,
        zIndex: 1,
        isMinimized: true
      }))
    );
    setMaxZIndex(1);
    setFocusedSection(null);
    setExpandedSection(null); // Réinitialise l'état d'expansion
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

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newSections = Array.from(sections);
    const [reorderedItem] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedItem);
    
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      position: index
    }));
    
    setSections(updatedSections);
  };

  // Effet pour charger les données d'un entretien existant
  useEffect(() => {
    if (entretienId) {
      // Charger un entretien existant
      const fetchEntretien = async () => {
        try {
          const response = await fetch(`/api/entretiens/${entretienId}`);
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.data) {
            throw new Error('Données non trouvées');
          }
          
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
        } catch (error) {
          toast.error('Erreur lors du chargement des données');
        }
      };
  
      fetchEntretien();
    } else {
      // Pour un nouvel entretien, récupérer le numéro suivant
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
  }, [entretienId, patient.id]);

  // Fonction de sauvegarde
  const saveEntretien = async () => {
    try {
      // Préparation des données
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
      
      toast.success(entretienId ? 
        'Entretien mis à jour avec succès' : 
        'Entretien créé avec succès'
      );
      
      if (onClose) onClose();
    } catch (error) {
      toast.error('Une erreur est survenue lors de la sauvegarde');
    }
  };

  return (
    <div className="p-6">
      {/* En-tête avec navigation et informations */}
      <div className="max-w-[98%] mx-auto bg-white rounded-xl shadow-lg p-6 mb-6">

        
        {/* Barre de navigation supérieure */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          
          {/* Boutons de navigation - côté gauche */}

          
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
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
                Modifier
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

            {/* Sélecteur de statut - visible seulement en mode édition */}
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
     {/* Boutons de disposition intégrés */}
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-500 mr-2">Disposition:</span>
    <button
      onClick={() => {/* code de disposition verticale */}}
      className="p-1.5 rounded hover:bg-gray-100"
      title="Vertical"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="6" rx="1" />
        <rect x="4" y="14" width="16" height="6" rx="1" />
      </svg>
    </button>
    
    <button
      onClick={() => {/* code de disposition horizontale */}}
      className="p-1.5 rounded hover:bg-gray-100"
      title="Horizontal"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="6" height="16" rx="1" />
        <rect x="14" y="4" width="6" height="16" rx="1" />
      </svg>
    </button>
    
    <button
      onClick={arrangeWindowsEvenly}
      className="p-1.5 rounded hover:bg-gray-100"
      title="Grille"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    </button>
    
    <button
      onClick={resetSizes}
      className="p-1.5 rounded hover:bg-gray-100"
      title="Réinitialiser"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" />
        <path d="M12 3v9l3.5 3.5" />
      </svg>
    </button>
  </div>
</div>

      {/* Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="sections" direction="horizontal" type="section">
    {(provided) => (
      <div 
        {...provided.droppableProps}
        ref={provided.innerRef}
        className="grid grid-cols-1 md:grid-cols-2 auto-rows-min gap-4 max-w-[98%] mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: focusedSection ? "1fr" : "repeat(auto-fit, minmax(500px, 1fr))",
          gridAutoFlow: "dense"
        }}
      >
              {sections
                .filter(section => !section.isMinimized)
                .filter(section => !focusedSection || section.id === focusedSection)
                .sort((a, b) => a.position - b.position)
                .map((section, index) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={index}
                    isDragDisabled={!!focusedSection || !!expandedSection || isReadOnly}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'opacity-70' : ''
                        }`}
                      >
                        <ResizableSection
                          {...section}
                          isExpanded={expandedSection === section.id}
                          isFocused={focusedSection === section.id}
                          onMinimize={handleMinimize}
                          onMaximize={handleMaximize}
                          onToggleFocus={handleToggleFocus}
                          onExpand={handleExpand}
                          onResize={handleResize}
                          onBringToFront={bringToFront}
                        >
                          {renderSectionContent(section.id)}
                        </ResizableSection>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Bouton quitter le mode focus */}
      
    </div>
  );
};