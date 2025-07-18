// src/components/consent/ConsentStatusBadge.tsx
import React from 'react';
import { Check, X, Clock, AlertCircle, Calendar } from 'lucide-react';
import { ConsentStatus } from './ConsentManagement';

interface ConsentStatusBadgeProps {
  status: ConsentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const ConsentStatusBadge: React.FC<ConsentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status: ConsentStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          icon: <Check className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Accepté',
          pulse: false
        };
      case 'REFUSED':
        return {
          icon: <X className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Refusé',
          pulse: false
        };
      case 'PENDING':
        return {
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          label: 'En attente',
          pulse: true
        };
      case 'REVOKED':
        return {
          icon: <X className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Révoqué',
          pulse: false
        };
      case 'EXPIRED':
        return {
          icon: <Calendar className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Expiré',
          pulse: true
        };
      default:
        return {
          icon: <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />,
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Non défini',
          pulse: false
        };
    }
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full border font-medium
      ${config.bgColor} ${config.borderColor} ${config.color}
      ${sizeClasses[size]}
      ${config.pulse ? 'animate-pulse' : ''}
      ${className}
    `}>
      {showIcon && (
        <span className={config.color}>
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </div>
  );
};