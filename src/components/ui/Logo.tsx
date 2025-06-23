// src/components/ui/Logo.tsx - Version corrigée
import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo = ({ 
  className = '',  // ← AJOUTEZ CETTE LIGNE
  width = 120, 
  height = 40 
}: LogoProps) => {
  return (
    <div className={className}>  {/* ← AJOUTEZ className ici */}
      <Image
        src="/vital-sync-logo.png"
        alt="Vital Sync Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
};