// src/components/ui/modal.tsx
import React, { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Overlay / Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          "bg-white rounded-xl shadow-lg p-6 w-full max-w-md",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        {children}
      </div>
    </Fragment>
  );
}