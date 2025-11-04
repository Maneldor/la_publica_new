'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface TrendData {
  month: string;
  nuevos: number;
  convertidos: number;
  perdidos: number;
}

interface LeadsTrendChartProps {
  data?: TrendData[];
  type?: 'line' | 'area';
}

const defaultData: TrendData[] = [
  { month: 'Ene', nuevos: 12, convertidos: 4, perdidos: 2 },
  { month: 'Feb', nuevos: 18, convertidos: 7, perdidos: 3 },
  { month: 'Mar', nuevos: 25, convertidos: 10, perdidos: 4 },
  { month: 'Abr', nuevos: 22, convertidos: 12, perdidos: 2 },
  { month: 'May', nuevos: 30, convertidos: 15, perdidos: 5 },
  { month: 'Jun', nuevos: 35, convertidos: 18, perdidos: 3 },
];

export function LeadsTrendChart({ data = defaultData, type = 'area' }: LeadsTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tendencia de Leads
        </h3>
        <p className="text-sm text-gray-500">
          Evolución mensual de leads
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'area' ? (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorConvertidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPerdidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="nuevos"
              name="Nuevos"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorNuevos)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="convertidos"
              name="Convertidos"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorConvertidos)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="perdidos"
              name="Perdidos"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorPerdidos)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="nuevos"
              name="Nuevos"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="convertidos"
              name="Convertidos"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="perdidos"
              name="Perdidos"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Resumen estadísticas */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Total Nuevos</p>
          <p className="text-lg font-semibold text-blue-600">
            {data.reduce((acc, curr) => acc + curr.nuevos, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Convertidos</p>
          <p className="text-lg font-semibold text-green-600">
            {data.reduce((acc, curr) => acc + curr.convertidos, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Perdidos</p>
          <p className="text-lg font-semibold text-red-600">
            {data.reduce((acc, curr) => acc + curr.perdidos, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}