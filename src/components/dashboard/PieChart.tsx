// src/components/dashboard/PieChart.tsx
'use client';

import React from 'react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  onClick?: (entry: any) => void;
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  title,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'],
  height = 300,
  showLegend = true,
  showLabels = false,
  showTooltip = true,
  onClick,
  valueFormatter = (value) => value.toString()
}: PieChartProps) {
  // Ensuring we have colors for all data points
  const extendedColors = [...colors];
  while (extendedColors.length < data.length) {
    extendedColors.push(...colors);
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      
      // Calculer le pourcentage
      const total = data.reduce((sum, entry) => sum + entry.value, 0);
      const percentage = ((entry.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{entry.name}</p>
          <p className="text-sm text-gray-600">
            {valueFormatter(entry.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculer les pourcentages pour l'affichage
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithPercentage = data.map(entry => ({
    ...entry,
    percentage: total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0'
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={1}
                dataKey="value"
                onClick={onClick}
                label={showLabels ? ({name, percentage}) => `${name}: ${percentage}%` : undefined}
                labelLine={showLabels}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={extendedColors[index % extendedColors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend 
                  formatter={(value, entry, index) => {
                    const item = dataWithPercentage[index];
                    return `${value} (${item.percentage}%)`;
                  }}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              )}
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}