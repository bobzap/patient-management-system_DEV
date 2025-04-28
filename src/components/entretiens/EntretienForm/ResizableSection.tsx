// src/components/entretiens/EntretienForm/ResizableSection.tsx
import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import { Minus, Maximize2, Focus, Expand, ZoomIn, ZoomOut } from 'lucide-react';

interface ResizableSectionProps {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isFocused: boolean;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onBringToFront: (id: string) => void;
  children: React.ReactNode;
  isExpanded: boolean;
  onExpand: (id: string) => void;
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
  isExpanded,
  onMinimize,
  onMaximize,
  onToggleFocus,
  onExpand,
  onResize,
  onBringToFront,
  children
}: ResizableSectionProps) => {
  const SIDEBAR_WIDTH = 5;
  // État pour suivre le niveau de zoom
  const [zoomLevel, setZoomLevel] = useState(100);

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

  // Définition de la fonction handleResize
  const handleResize = (e: any, { size }: { size: { width: number; height: number } }) => {
    e.stopPropagation();
    onResize(id, size);
  };

  if (isMinimized) {
    return (
      <div className={`${color} rounded-lg shadow-sm hover:shadow transition-all duration-200`}>
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:brightness-95"
          onClick={() => onMaximize(id)}
        >
          <h3 className="font-medium">{title}</h3>
          <Maximize2 className="w-4 h-4 opacity-60" />
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
          // Réduire les paddings pour maximiser l'espace
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
        >
          <div 
            // Augmenter la taille à 95% au lieu de 90%
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
              // Réduire le padding pour maximiser le contenu visible
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

  // Section en mode étendu
  if (isExpanded) {
    return (
      <div className={`${color} fixed top-24 left-[${SIDEBAR_WIDTH + 16}px] right-4 bottom-4 rounded-xl shadow-xl z-40 overflow-hidden transition-all duration-300`}>
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-black/5 rounded-t-xl bg-inherit flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand(id);
              }}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
              title="Réduire"
            >
              <Expand className="w-4 h-4 rotate-180" />
            </button>
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
        <div className="p-6 overflow-auto h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    );
  }

  // Section en mode normal
  return (
    <ResizableBox
  width={width}
  height={height}
  minConstraints={[350, 250]}
  maxConstraints={[1200, 800]}
  onResizeStop={handleResize}
  resizeHandles={['se']}
  className={`${color} rounded-xl shadow-lg transition-all duration-100 ease-in-out hover:shadow-xl`}
  
      style={{ 
        zIndex: zIndex,
        cursor: 'default'
      }}
      onClick={() => onBringToFront(id)}
    >
      {/* En-tête avec boutons */}
      <div 
        className={`sticky top-0 bg-inherit px-6 py-4 border-b border-black/5 rounded-t-xl 
                  flex justify-between items-center drag-handle-${id}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(id);
            }}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
            title="Agrandir"
          >
            <Expand className="w-4 h-4" />
          </button>
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
      <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
        {children}
      </div>
      
<div 
  className="react-resizable-handle"
  onMouseDown={(e) => {
    e.stopPropagation();
    // Désactiver temporairement le drag pendant le redimensionnement
    const draggables = document.querySelectorAll('[data-rbd-draggable-id]');
    draggables.forEach(el => el.setAttribute('data-temp-no-drag', 'true'));
  }}
  onMouseUp={() => {
    // Réactiver le drag après le redimensionnement
    const draggables = document.querySelectorAll('[data-temp-no-drag]');
    draggables.forEach(el => el.removeAttribute('data-temp-no-drag'));
  }}
/>

      {/* Styles pour la poignée de redimensionnement */}
      <style jsx>{`
  :global(.react-resizable-handle) {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 24px;
    height: 24px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 0 0 8px 0;
    cursor: se-resize;
    transition: background-color 0.2s;
    z-index: 10;
  }

  :global(.react-resizable-handle:hover) {
    background-color: rgba(0, 0, 0, 0.1);
  }

  :global(.react-resizable-handle::after) {
    content: '';
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(0, 0, 0, 0.3);
    border-bottom: 2px solid rgba(0, 0, 0, 0.3);
  }
`}</style>
    </ResizableBox>
  );
};