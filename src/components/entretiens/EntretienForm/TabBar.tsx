// src/components/entretiens/EntretienForm/TabBar.tsx
import React from 'react';
import { Maximize2 } from 'lucide-react';

interface TabBarProps {
  sections: Array<{
    id: string;
    title: string;
    color: string;
    isMinimized: boolean;
  }>;
  onMaximize: (id: string) => void;
}

export const TabBar = ({ sections, onMaximize }: TabBarProps) => {
  const minimizedSections = sections.filter(s => s.isMinimized);

  if (minimizedSections.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white border-b border-gray-200">
      {minimizedSections.map(section => (
        <button
          key={section.id}
          onClick={() => onMaximize(section.id)}
          className={`
            ${section.color} 
            px-4 
            py-2 
            rounded-lg 
            flex 
            items-center 
            gap-2
            hover:brightness-95 
            transition-all 
            shadow-sm
            hover:shadow
          `}
        >
          <span className="font-medium">{section.title}</span>
        </button>
      ))}
    </div>
  );
};