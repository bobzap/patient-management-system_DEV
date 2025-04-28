// src/components/entretiens/EntretienForm/ResizableSection.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import { Minus, Focus, ZoomIn, ZoomOut } from 'lucide-react';

interface ResizableSectionProps {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isFocused: boolean;
  position: number; // Numéro de position pour les dispositions
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onBringToFront: (id: string) => void;
  children: React.ReactNode;
}

export const ResizableSection = ({
  id,
  title,
  color,
  width,
  height,
  zIndex,
  isMinimized,
  isFocused,
  position,
  onMinimize,
  onMaximize,
  onToggleFocus,
  onResize,
  onBringToFront,
  children
}: ResizableSectionProps) => {
  // État pour suivre le niveau de zoom
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [elementPos, setElementPos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Obtenir les dimensions du conteneur
  const [containerDimensions, setContainerDimensions] = useState({
    width: window.innerWidth - 100, // Estimation initiale
    height: window.innerHeight - 200 // Estimation initiale
  });

  // Effect pour mesurer le conteneur
  useEffect(() => {
    const updateContainerSize = () => {
      const container = document.querySelector('.max-w-\\[98\\%\\]');
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: window.innerHeight - rect.top - 20
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Fonction pour augmenter le zoom
  const increaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 10, 150)); // Maximum 150%
  };

  // Fonction pour diminuer le zoom
  const decreaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 10, 70)); // Minimum 70%
  };

  // Gestion du début du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      const isHandle = e.target.classList.contains('react-resizable-handle') || 
                      (e.target.parentElement && e.target.parentElement.classList.contains('react-resizable-handle'));
      
      // Si on clique sur la poignée de redimensionnement, ne pas démarrer le drag
      if (isHandle) return;
      
      // Si on clique sur un bouton, ne pas démarrer le drag
      if (e.target.tagName === 'BUTTON' || e.target.parentElement?.tagName === 'BUTTON') return;
    }
    
    // Avertir le parent de mettre cette section au premier plan
    onBringToFront(id);
    
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setElementPos({ x: rect.left, y: rect.top });
      
      // Ajout des écouteurs pour le déplacement
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Gestion du déplacement pendant le drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calcul du déplacement
    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;
    
    // Nouvelle position
    let newX = elementPos.x + deltaX;
    let newY = elementPos.y + deltaY;
    
    // Limiter la position pour que la section reste visible
    newX = Math.max(0, Math.min(newX, containerDimensions.width - width));
    newY = Math.max(0, Math.min(newY, containerDimensions.height - height));
    
    // Appliquer la nouvelle position au parent (élément absolument positionné) plutôt qu'à cette section
    const parentElement = sectionRef.current?.parentElement;
    if (parentElement) {
      parentElement.style.left = `${newX}px`;
      parentElement.style.top = `${newY}px`;
    }
  };

  // Gestion de la fin du drag
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Suppression des écouteurs
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Si la section est minimisée, afficher juste l'en-tête
  if (isMinimized) {
    return (
      <div className={`${color} rounded-lg shadow-sm hover:shadow transition-all duration-200`}>
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:brightness-95"
          onClick={() => onMaximize(id)}
        >
          <h3 className="font-medium">{title}</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        </div>
      </div>
    );
  }

  // Section en mode focus
  if (isFocused) {
    return (
      <>
        {/* Overlay flou derrière pour effet de focus */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFocus(id);
          }}
        />
        
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
        >
          <div 
            className={`${color} w-[95%] h-[95%] rounded-xl shadow-2xl overflow-hidden max-w-[1800px] max-h-[950px]`}
          >
            {/* En-tête plus compact */}
            <div className="sticky top-0 px-4 py-3 border-b border-black/5 bg-inherit z-10 flex justify-between items-center">
              <h3 className="font-medium text-lg">{title}</h3>
              <div className="flex items-center gap-3">
                {/* Contrôles de zoom */}
                <div className="flex items-center gap-2 border-r pr-3 mr-1">
                  <button
                    onClick={decreaseZoom}
                    className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                    title="Voir plus de contenu"
                    disabled={zoomLevel <= 70}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium">{zoomLevel}%</span>
                  <button
                    onClick={increaseZoom}
                    className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                    title="Voir moins de contenu"
                    disabled={zoomLevel >= 150}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFocus(id);
                  }}
                  className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  title="Quitter le mode focus"
                >
                  <Focus className="w-5 h-5" />
                  <span className="ml-1 text-sm font-medium">Quitter le focus</span>
                </button>
              </div>
            </div>
            
            {/* Contenu avec zoom appliqué et maximisation de l'espace vertical */}
            <div 
              className="px-4 py-3 overflow-auto h-[calc(100%-3.5rem)] transition-all duration-200"
              style={{ 
                transformOrigin: 'top center',
                maxHeight: `${zoomLevel >= 100 ? '100%' : `${100 / (zoomLevel/100)}%`}`,
                fontSize: `${zoomLevel}%`,
                lineHeight: `${zoomLevel >= 100 ? 'normal' : 'normal'}`
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Section en mode normal (avec ResizableBox)
  return (
    <div
      ref={sectionRef}
      className={`${color} rounded-xl shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden'
      }}
      onClick={() => onBringToFront(id)}
    >
      <ResizableBox
        width={width}
        height={height}
        minConstraints={[500, 300]}
        maxConstraints={[Math.min(1200, containerDimensions.width), Math.min(800, containerDimensions.height)]}
        onResizeStart={(e) => {
          e.stopPropagation();
          onBringToFront(id);
        }}
        onResizeStop={(e, { size }) => {
          onResize(id, size);
        }}
        resizeHandles={['se']}
        handle={<div className="absolute bottom-0 right-0 w-6 h-6 bg-black/5 hover:bg-black/10 rounded-tl-lg cursor-se-resize z-10">
          <div className="absolute right-1.5 bottom-1.5 w-2 h-2 border-r-2 border-b-2 border-black/25" />
        </div>}
      >
        {/* En-tête avec boutons */}
        <div 
          className="sticky top-0 bg-inherit px-6 py-4 border-b border-black/5 rounded-t-xl 
                    flex justify-between items-center"
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFocus(id);
              }}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
              title="Mode focus"
            >
              <Focus className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize(id);
              }}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
              title="Minimiser"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)] overflow-x-hidden">
          {children}
        </div>
      </ResizableBox>
    </div>
  );
};