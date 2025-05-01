// src/components/dashboard/BarChart.tsx
'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface BarChartProps {
  data: Array<any>;
  title: string;
  xAxisKey: string;
  series: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  title,
  xAxisKey,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  stacked = false,
  hideXAxis = false,
  hideYAxis = false,
  valueFormatter = (value) => value.toString()
}: BarChartProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="mt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center gap-2">
                <div style={{ background: entry.color, width: 10, height: 10, borderRadius: 10 }}></div>
                <span className="text-sm text-gray-600">
                  {series.find(s => s.key === entry.dataKey)?.name}: {valueFormatter(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <RechartsBarChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              
              {!hideXAxis && (
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
              )}
              
              {!hideYAxis && (
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={valueFormatter}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              
              {showLegend && (
                <Legend 
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              )}
              
              {series.map((serie) => (
                <Bar
                  key={serie.key}
                  dataKey={serie.key}
                  name={serie.name}
                  fill={serie.color}
                  radius={[4, 4, 0, 0]}
                  stackId={stacked ? 'stack' : undefined}
                  maxBarSize={60}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}