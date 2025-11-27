'use client';

import { useState } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { UniversalCard } from '../../../components/ui/UniversalCard';

interface PeriodStats {
  period: string;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  totalValue: number;
  averageConversionTime: number;
}

interface SectorStats {
  sector: string;
  leads: number;
  converted: number;
  conversionRate: number;
  totalValue: number;
}

interface SourceStats {
  source: string;
  leads: number;
  converted: number;
  conversionRate: number;
}

const mockPeriodStats: PeriodStats[] = [
  {
    period: 'Octubre 2024',
    newLeads: 12,
    contactedLeads: 8,
    convertedLeads: 3,
    totalValue: 152000,
    averageConversionTime: 14
  },
  {
    period: 'Setembre 2024',
    newLeads: 15,
    contactedLeads: 12,
    convertedLeads: 4,
    totalValue: 180000,
    averageConversionTime: 18
  },
  {
    period: 'Agost 2024',
    newLeads: 9,
    contactedLeads: 7,
    convertedLeads: 2,
    totalValue: 95000,
    averageConversionTime: 21
  }
];

const mockSectorStats: SectorStats[] = [
  {
    sector: 'Tecnologia',
    leads: 18,
    converted: 6,
    conversionRate: 33.3,
    totalValue: 285000
  },
  {
    sector: 'Consultoria',
    leads: 12,
    converted: 2,
    conversionRate: 16.7,
    totalValue: 95000
  },
  {
    sector: 'Serveis Digitals',
    leads: 8,
    converted: 1,
    conversionRate: 12.5,
    totalValue: 47000
  },
  {
    sector: 'Construcció',
    leads: 6,
    converted: 0,
    conversionRate: 0,
    totalValue: 0
  }
];

const mockSourceStats: SourceStats[] = [
  {
    source: 'Web',
    leads: 18,
    converted: 5,
    conversionRate: 27.8
  },
  {
    source: 'LinkedIn',
    leads: 12,
    converted: 3,
    conversionRate: 25.0
  },
  {
    source: 'Referit',
    leads: 8,
    converted: 1,
    conversionRate: 12.5
  },
  {
    source: 'Trucada directa',
    leads: 6,
    converted: 0,
    conversionRate: 0
  }
];

export default function EstadistiquesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last_3_months');

  const totalLeads = mockSectorStats.reduce((sum, s) => sum + s.leads, 0);
  const totalConverted = mockSectorStats.reduce((sum, s) => sum + s.converted, 0);
  const totalValue = mockSectorStats.reduce((sum, s) => sum + s.totalValue, 0);
  const averageConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

  const statsData = [
    {
      label: 'Total Leads',
      value: totalLeads.toString(),
      trend: '+8% vs trimestre anterior'
    },
    {
      label: 'Taxa de Conversió',
      value: `${averageConversionRate.toFixed(1)}%`,
      trend: '+2.1% vs trimestre anterior'
    },
    {
      label: 'Valor Total',
      value: `€${totalValue.toLocaleString()}`,
      trend: '+15% vs trimestre anterior'
    },
    {
      label: 'Temps Mitjà Conversió',
      value: '17 dies',
      trend: '-3 dies vs trimestre anterior'
    }
  ];

  return (
    <PageTemplate
      title="Estadístiques Avançades"
      subtitle="Anàlisi detallada del rendiment del CRM i tendències de conversió"
      statsData={statsData}
    >
      <div className="space-y-6">
        {/* Selector de període */}
        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          middleZone={{
            title: 'Període d\'Anàlisi',
            description: 'Selecciona el període per a l\'anàlisi de dades',
            content: (
              <div className="flex gap-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="last_month">Últim mes</option>
                  <option value="last_3_months">Últims 3 mesos</option>
                  <option value="last_6_months">Últims 6 mesos</option>
                  <option value="last_year">Últim any</option>
                </select>
              </div>
            )
          }}
        />

        {/* Evolució per períodes */}
        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          }}
          middleZone={{
            title: 'Evolució Mensual',
            description: 'Seguiment de la performance mes a mes',
            content: (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Període</th>
                      <th className="text-right py-2 font-medium text-gray-900">Nous Leads</th>
                      <th className="text-right py-2 font-medium text-gray-900">Contactats</th>
                      <th className="text-right py-2 font-medium text-gray-900">Convertits</th>
                      <th className="text-right py-2 font-medium text-gray-900">Taxa</th>
                      <th className="text-right py-2 font-medium text-gray-900">Valor</th>
                      <th className="text-right py-2 font-medium text-gray-900">Temps Mitjà</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPeriodStats.map((stat, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-900">{stat.period}</td>
                        <td className="text-right py-3 text-gray-600">{stat.newLeads}</td>
                        <td className="text-right py-3 text-gray-600">{stat.contactedLeads}</td>
                        <td className="text-right py-3 text-gray-600">{stat.convertedLeads}</td>
                        <td className="text-right py-3 text-gray-600">
                          {((stat.convertedLeads / stat.newLeads) * 100).toFixed(1)}%
                        </td>
                        <td className="text-right py-3 text-gray-600">
                          €{stat.totalValue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 text-gray-600">{stat.averageConversionTime} dies</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estadístiques per sector */}
          <UniversalCard
            variant="default"
            topZone={{
              type: 'gradient',
              value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            }}
            middleZone={{
              title: 'Rendiment per Sector',
              description: 'Anàlisi de conversió per sectors',
              content: (
                <div className="space-y-4">
                  {mockSectorStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{stat.sector}</div>
                        <div className="text-sm text-gray-600">
                          {stat.converted}/{stat.leads} leads · €{stat.totalValue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          stat.conversionRate > 25 ? 'text-green-600' :
                          stat.conversionRate > 15 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stat.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">conversió</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }}
          />

          {/* Estadístiques per font */}
          <UniversalCard
            variant="default"
            topZone={{
              type: 'gradient',
              value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }}
            middleZone={{
              title: 'Rendiment per Font',
              description: 'Efectivitat de les fonts de leads',
              content: (
                <div className="space-y-4">
                  {mockSourceStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{stat.source}</div>
                        <div className="text-sm text-gray-600">
                          {stat.converted}/{stat.leads} leads convertits
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          stat.conversionRate > 25 ? 'text-green-600' :
                          stat.conversionRate > 15 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stat.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">conversió</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }}
          />
        </div>

        {/* Anàlisi de tendències */}
        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          middleZone={{
            title: 'Insights i Recomanacions',
            description: 'Anàlisi automàtica basada en les dades',
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 text-lg">✅</span>
                      <h4 className="font-medium text-green-900">Punt Fort</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      El sector tecnologia mostra la millor taxa de conversió (33.3%)
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                      <h4 className="font-medium text-yellow-900">Atenció</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Les trucades directes no han generat conversions aquest període
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 text-lg">💡</span>
                      <h4 className="font-medium text-blue-900">Recomanació</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Incrementar esforços en leads web i LinkedIn per millorar conversions
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resum Executiu</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• La taxa de conversió general (20.5%) està per sobre de la mitjana del sector (15%)</li>
                    <li>• El temps mitjà de conversió s'ha reduït en 3 dies respecte al trimestre anterior</li>
                    <li>• El valor total dels leads convertits ha augmentat un 15% aquest trimestre</li>
                    <li>• LinkedIn i Web són les fonts més efectives per a la generació de leads</li>
                  </ul>
                </div>
              </div>
            )
          }}
        />
      </div>
    </PageTemplate>
  );
}