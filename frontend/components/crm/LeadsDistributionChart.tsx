'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector
} from 'recharts';

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

interface LeadsDistributionChartProps {
  data?: DistributionData[];
  title?: string;
  type?: 'source' | 'priority' | 'status' | 'sector';
}

const sourceData: DistributionData[] = [
  { name: 'Web', value: 35, color: '#3B82F6' },
  { name: 'LinkedIn', value: 25, color: '#10B981' },
  { name: 'Referido', value: 20, color: '#F59E0B' },
  { name: 'Evento', value: 15, color: '#8B5CF6' },
  { name: 'Otros', value: 5, color: '#EC4899' },
];

const priorityData: DistributionData[] = [
  { name: 'Alta', value: 30, color: '#EF4444' },
  { name: 'Media', value: 45, color: '#F59E0B' },
  { name: 'Baja', value: 25, color: '#6B7280' },
];

const statusData: DistributionData[] = [
  { name: 'Nuevo', value: 40, color: '#3B82F6' },
  { name: 'Contactado', value: 30, color: '#10B981' },
  { name: 'Negociando', value: 20, color: '#F59E0B' },
  { name: 'Convertido', value: 10, color: '#8B5CF6' },
];

const sectorData: DistributionData[] = [
  { name: 'Tecnología', value: 30, color: '#3B82F6' },
  { name: 'Servicios', value: 25, color: '#10B981' },
  { name: 'Marketing', value: 20, color: '#F59E0B' },
  { name: 'Construcción', value: 15, color: '#8B5CF6' },
  { name: 'Otros', value: 10, color: '#EC4899' },
];

const dataMap = {
  source: sourceData,
  priority: priorityData,
  status: statusData,
  sector: sectorData
};

const titleMap = {
  source: 'Distribución por Fuente',
  priority: 'Distribución por Prioridad',
  status: 'Distribución por Estado',
  sector: 'Distribución por Sector'
};

export function LeadsDistributionChart({
  type = 'source',
  title,
  data
}: LeadsDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = data || dataMap[type];
  const chartTitle = title || titleMap[type];

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1F2937" className="text-lg font-semibold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm">
          {`${value} leads`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Leads: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-500">
            {((data.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        <p className="text-sm text-gray-500">
          Análisis de leads por categoría
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}