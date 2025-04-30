// src/components/ui/confirm-dialog.tsx
import React from 'react';
import { Modal } from './modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}: ConfirmDialogProps) {
  
  const variantStyles = {
    danger: {
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    info: {
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-50">
          {variantStyles[variant].icon}
        </div>
        
        <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
        
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
        
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                     rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-gray-500 transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       transition-colors ${variantStyles[variant].button}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}