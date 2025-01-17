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
  onMinimize,
  onMaximize,
  onToggleFocus,
  onResize,
  onBringToFront,
  children,
  isExpanded,
  onExpand
}: ResizableSectionProps) => {
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
      width={isExpanded ? Math.min(window.innerWidth * 0.98, 1400) : width} // 98% de la largeur de l'écran, max 1400px
      height={isExpanded ? window.innerHeight - 120 : height} // Plus de hauteur
      minConstraints={[500, 300]}
      maxConstraints={[Math.min(window.innerWidth * 0.98, 1400), window.innerHeight - 120]}
      onResizeStop={(e, { size }) => onResize(id, size)}
      resizeHandles={['se']}
      className={`relative ${color} rounded-xl shadow-lg transition-all duration-300
        ${isExpanded ? 'fixed top-24 left-1/2 -translate-x-1/2' : ''}
        hover:shadow-xl react-resizable`}
      style={{ 
        zIndex: isExpanded ? 9999 : zIndex,
        cursor: 'default',
        margin: isExpanded ? '0 auto' : undefined
      }}
      onClick={() => onBringToFront(id)}
    >
      {/* En-tête avec boutons */}
      <div className="sticky top-0 bg-inherit px-6 py-4 border-b border-black/5 rounded-t-xl 
                flex justify-between items-center drag-handle-${id}">
  <h3 className="font-medium">{title}</h3>
  <div className="flex items-center gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        // TODO: Ajouter handler pour l'expansion
        onExpand(id);
      }}
      className="p-1.5 hover:bg-black/5 rounded-lg"
      title="Agrandir"
    >
      <Expand className="w-4 h-4" />
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