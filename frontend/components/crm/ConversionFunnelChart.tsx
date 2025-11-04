'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface FunnelData {
  stage: string;
  leads: number;
  conversion?: number;
  color?: string;
}

interface ConversionFunnelChartProps {
  data?: FunnelData[];
}

const defaultData: FunnelData[] = [
  { stage: 'Nuevos', leads: 100, color: '#3B82F6' },
  { stage: 'Contactados', leads: 75, conversion: 75, color: '#10B981' },
  { stage: 'En Negociación', leads: 40, conversion: 53, color: '#F59E0B' },
  { stage: 'Propuesta', leads: 25, conversion: 62, color: '#8B5CF6' },
  { stage: 'Convertidos', leads: 12, conversion: 48, color: '#EC4899' },
];

export function ConversionFunnelChart({ data = defaultData }: ConversionFunnelChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.stage}</p>
          <p className="text-sm text-gray-600">Leads: {data.leads}</p>
          {data.conversion && (
            <p className="text-sm text-green-600">
              Conversión: {data.conversion}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Embudo de Conversión
        </h3>
        <p className="text-sm text-gray-500">
          Progreso de leads a través del pipeline
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="leads" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.leads}</span>
            </div>
            {item.conversion && (
              <span className="text-gray-400">
                {item.conversion}% →
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}