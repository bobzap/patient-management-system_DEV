// src/components/entretiens/EntretienForm/ResizableSection.tsx
import React from 'react';
import { ResizableBox } from 'react-resizable';
import { Minus, Maximize2, Focus, Expand } from 'lucide-react';


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
  const isLargeMode = isFocused || isExpanded;

  // Définition de la fonction handleResize
  const handleResize = (e: any, { size }: { size: { width: number; height: number } }) => {
    e.stopPropagation();
    onResize(id, size);
  };


  if (isMinimized) {
    return (
      <div 
        className={`${color} rounded-lg shadow-sm hover:shadow transition-all duration-200`}
      >
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

  return (
    <ResizableBox
      width={isLargeMode ? Math.min(window.innerWidth - SIDEBAR_WIDTH - 32, 1400) : width}
      height={isLargeMode ? window.innerHeight - 120 : height}
      minConstraints={[500, 300]}
      maxConstraints={[
        Math.min(window.innerWidth - SIDEBAR_WIDTH - 32, 1400),
        window.innerHeight - 120
      ]}
      onResizeStop={(e, { size }) => {
        e.stopPropagation();
        onResize(id, size);
      }}
      resizeHandles={['se']}
      className={`relative ${color} rounded-xl shadow-lg transition-all duration-300
        ${isLargeMode ? 'fixed top-24' : ''}
        hover:shadow-xl react-resizable`}
      style={{ 
        zIndex: isFocused ? 50 : isExpanded ? 40 : zIndex,
        cursor: 'default',
        left: isLargeMode ? `${SIDEBAR_WIDTH + 16}px` : 'auto', // Position fixe depuis la sidebar
        transform: isLargeMode ? 'none' : undefined, // Supprimer la translation
        width: isLargeMode ? `calc(100vw - ${SIDEBAR_WIDTH + 32}px)` : undefined // Largeur calculée depuis la sidebar
      }}
      onClick={() => onBringToFront(id)}
    >
      {/* En-tête avec boutons */}
    <div 
      className={`sticky top-0 bg-inherit px-6 py-4 border-b border-black/5 rounded-t-xl 
                flex justify-between items-center drag-handle-${id}`}
      onMouseDown={(e) => {
        if (!isExpanded) {
          // Permettre le drag & drop seulement quand la section n'est pas en mode étendu
          e.stopPropagation();
        }
      }}
    >
      <h3 className="font-medium">{title}</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(id);
          }}
          className="p-1.5 hover:bg-black/5 rounded-lg"
          title={isExpanded ? "Réduire" : "Agrandir"}
        >
          <Expand className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFocus(id);
          }}
          className="p-1.5 hover:bg-black/5 rounded-lg"
          title="Mode focus"
        >
          <Focus className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize(id);
          }}
          className="p-1.5 hover:bg-black/5 rounded-lg"
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

      {/* Ajout des styles CSS pour la poignée de redimensionnement */}
      <style jsx>{`
        :global(.react-resizable-handle) {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
          padding: 0 3px 3px 0;
        }

        :global(.react-resizable-handle::after) {
          content: '';
          position: absolute;
          right: 3px;
          bottom: 3px;
          width: 8px;
          height: 8px;
          border-right: 2px solid rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </ResizableBox>
  );
};

