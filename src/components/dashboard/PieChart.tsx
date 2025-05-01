// src/components/dashboard/PieChart.tsx
'use client';

import React, { useState } from 'react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';

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
  emptyText?: string;
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
  valueFormatter = (value) => value.toString(),
  emptyText = "Aucune donnée disponible"
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Ensuring we have colors for all data points
  const extendedColors = [...colors];
  while (extendedColors.length < data.length) {
    extendedColors.push(...colors);
  }

  // Calculer les pourcentages pour l'affichage
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithPercentage = data.map(entry => ({
    ...entry,
    percentage: total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0'
  }));

  // Slice data to show top entries directly, then group the rest as "Autres"
  const MAX_DIRECT_ENTRIES = 5;
  let chartData = [...dataWithPercentage];
  
  if (dataWithPercentage.length > MAX_DIRECT_ENTRIES) {
    const topEntries = dataWithPercentage
      .sort((a, b) => b.value - a.value)
      .slice(0, MAX_DIRECT_ENTRIES);
    
    const otherEntries = dataWithPercentage
      .sort((a, b) => b.value - a.value)
      .slice(MAX_DIRECT_ENTRIES);
    
    const otherValue = otherEntries.reduce((sum, entry) => sum + entry.value, 0);
    const otherPercentage = ((otherValue / total) * 100).toFixed(1);
    
    chartData = [
      ...topEntries,
      { 
        name: `Autres (${otherEntries.length})`, 
        value: otherValue,
        percentage: otherPercentage,
        isOthers: true,
        details: otherEntries
      }
    ];
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{entry.name}</p>
          <p className="text-sm text-gray-600">
            {valueFormatter(entry.value)} ({entry.percentage}%)
          </p>
          
          {/* Si c'est la catégorie "Autres", afficher les détails */}
          {entry.isOthers && entry.details && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Détails:</p>
              <div className="max-h-40 overflow-y-auto">
                {entry.details.map((detail: any, i: number) => (
                  <div key={i} className="text-xs flex justify-between py-0.5">
                    <span className="text-gray-700 truncate mr-2" title={detail.name}>
                      {detail.name.length > 20 ? `${detail.name.substring(0, 18)}...` : detail.name}
                    </span>
                    <span className="text-gray-900">{detail.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Animation active sector
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
      </g>
    );
  };

  // Custom legend that shows percentage
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="text-sm mt-2">
        {payload.map((entry: any, index: number) => {
          const item = chartData[index];
          return (
            <li 
              key={`legend-${index}`} 
              className="flex items-center mb-1 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div 
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex justify-between w-full">
                <span className="flex-grow truncate" title={item.name}>
                  {item.name.length > 20 ? `${item.name.substring(0, 18)}...` : item.name}
                </span>
                <span className="font-medium ml-2 text-gray-900">
                  {item.percentage}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          {emptyText}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
              <RechartsPie>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  onClick={(_, index) => {
                    setActiveIndex(activeIndex === index ? null : index);
                    if (onClick) onClick(chartData[index]);
                  }}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  labelLine={false}
                  label={showLabels ? ({name}) => name : false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={extendedColors[index % extendedColors.length]} 
                    />
                  ))}
                </Pie>
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          
          {showLegend && chartData.length > 0 && (
            <div className="mt-auto">
              <CustomLegend 
                payload={chartData.map((entry, index) => ({
                  value: entry.name,
                  color: extendedColors[index % extendedColors.length]
                }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}