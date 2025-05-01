// src/components/dashboard/GaugeMetrics.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface GaugeMetricProps {
  value: number; // Valeur entre 0 et 100
  title: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  description?: string;
  icon?: React.ReactNode;
}

export function GaugeMetric({
  value,
  title,
  color,
  size = 120,
  strokeWidth = 10,
  description,
  icon
}: GaugeMetricProps) {
  // Assurer que la valeur est entre 0 et 100
  const safeValue = Math.min(100, Math.max(0, value));
  
  // Les données pour le Pie Chart
  const data = [
    { name: 'value', value: safeValue },
    { name: 'empty', value: 100 - safeValue }
  ];
  
  // Couleurs personnalisées pour les tranches
  const colors = [color, '#E5E7EB'];
  
  // Formater la valeur pour l'affichage
  const formatValue = () => {
    return `${Math.round(safeValue)}%`;
  };
  
  // Personnaliser les labels pour n'afficher que la valeur au centre
  const renderCustomizedLabel = () => null;
  
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size/2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={size/2 - strokeWidth}
              outerRadius={size/2}
              paddingAngle={0}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip content={() => null} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Valeur centrée sous la jauge */}
        <div 
          className="absolute bottom-0 left-0 right-0 mx-auto text-center"
          style={{ 
            transform: 'translateY(calc(100% + 5px))', 
            width: 'max-content',
            margin: '0 auto'
          }}
        >
          <div className="flex items-center justify-center">
            {icon && <span className="mr-1">{icon}</span>}
            <span className="text-lg font-bold" style={{ color }}>{formatValue()}</span>
          </div>
        </div>
      </div>
      
      <h4 className="mt-6 text-sm font-medium text-gray-800">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      )}
    </div>
  );
}

interface GaugeMetricsProps {
  metrics: Array<{
    id: string;
    value: number;
    title: string;
    color: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  title?: string;
  isLoading?: boolean;
}

export function GaugeMetrics({
  metrics,
  title = "Indicateurs de performance",
  isLoading = false
}: GaugeMetricsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
      
      {isLoading ? (
        <div className="flex justify-around animate-pulse">
          {[...Array(metrics.length || 3)].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-8 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          Aucune métrique disponible
        </div>
      ) : (
        <div className="flex justify-around flex-wrap">
          {metrics.map((metric) => (
            <div key={metric.id} className="px-2 py-4">
              <GaugeMetric
                value={metric.value}
                title={metric.title}
                color={metric.color}
                description={metric.description}
                icon={metric.icon}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}