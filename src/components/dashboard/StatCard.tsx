// src/components/dashboard/StatCard.tsx
'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number; // Valeur positive pour croissance, négative pour décroissance
  colorScheme?: 'blue' | 'green' | 'amber' | 'purple' | 'pink' | 'gray';
  onClick?: () => void;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  colorScheme = 'blue',
  onClick,
  isLoading = false
}: StatCardProps) {
  // Définition des styles selon le schéma de couleur
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      text: 'text-blue-900',
      border: 'border-blue-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      text: 'text-green-900',
      border: 'border-green-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      text: 'text-amber-900',
      border: 'border-amber-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-amber-100'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      text: 'text-purple-900',
      border: 'border-purple-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-purple-100'
    },
    pink: {
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-600',
      text: 'text-pink-900',
      border: 'border-pink-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-pink-100'
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      text: 'text-gray-900',
      border: 'border-gray-200',
      trendUp: 'text-green-600 bg-green-50',
      trendDown: 'text-red-600 bg-red-50',
      trendNeutral: 'text-gray-600 bg-gray-50',
      hover: 'hover:bg-gray-100'
    }
  };

  // Style pour le composant de tendance
  const getTrendElement = () => {
    if (trend === undefined) return null;
    
    let trendClass = '';
    let TrendIcon;
    
    if (trend > 0) {
      trendClass = colorStyles[colorScheme].trendUp;
      TrendIcon = TrendingUp;
    } else if (trend < 0) {
      trendClass = colorStyles[colorScheme].trendDown;
      TrendIcon = TrendingDown;
    } else {
      trendClass = colorStyles[colorScheme].trendNeutral;
      TrendIcon = Minus;
    }
    
    return (
      <div className={twMerge('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', trendClass)}>
        <TrendIcon size={14} />
        <span>{trend > 0 ? '+' : ''}{trend}%</span>
      </div>
    );
  };

  return (
    <div 
      className={twMerge(
        `rounded-xl shadow-sm p-6 transition-all duration-200 border
         ${colorStyles[colorScheme].bg} ${colorStyles[colorScheme].border}`,
        onClick ? `cursor-pointer ${colorStyles[colorScheme].hover}` : ''
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold ${colorStyles[colorScheme].text} mt-1`}>
              {value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[colorScheme].iconBg}`}>
          <div className={colorStyles[colorScheme].iconText}>
            {icon}
          </div>
        </div>
      </div>
      
      {(description || trend !== undefined) && (
        <div className="mt-4 flex items-center justify-between">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {getTrendElement()}
        </div>
      )}
    </div>
  );
}