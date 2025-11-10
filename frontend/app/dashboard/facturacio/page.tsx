'use client';

import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface FacturaBasica {
  id: string;
  numeroFactura: string;
  companyName: string;
  total: number;
  estat: string;
  fechaCreacion: string;
}

interface EstadisticasFacturacion {
  facturasMes: number;
  ingresosMes: number;
  pendientesCobro: number;
  totalAnual: number;
}

export default function FacturacionDashboard() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasFacturacion>({
    facturasMes: 0,
    ingresosMes: 0,
    pendientesCobro: 0,
    totalAnual: 0
  });

  const [ultimasFacturas, setUltimasFacturas] = useState<FacturaBasica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar estadísticas
        const statsResponse = await fetch('/api/admin/facturacion/estadisticas');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setEstadisticas(stats);
        }

        // Cargar últimas facturas
        const facturasResponse = await fetch('/api/admin/facturacion/ultimas');
        if (facturasResponse.ok) {
          const facturas = await facturasResponse.json();
          setUltimasFacturas(facturas);
        }
      } catch (error) {
        console.error('Error cargando datos de facturación:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsData = [
    {
      label: 'Factures aquest mes',
      value: estadisticas.facturasMes.toString(),
      trend: '+12%'
    },
    {
      label: 'Ingressos mensuals',
      value: `€${estadisticas.ingresosMes.toLocaleString()}`,
      trend: '+8%'
    },
    {
      label: 'Pendents de cobrament',
      value: `€${estadisticas.pendientesCobro.toLocaleString()}`,
      trend: '-3%'
    },
    {
      label: 'Total anual',
      value: `€${estadisticas.totalAnual.toLocaleString()}`,
      trend: '+24%'
    }
  ];

  return (
    <PageTemplate
      title="Dashboard de Facturació"
      subtitle="Gestió completa del sistema de facturació professional"
      statsData={statsData}
    >
      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          }}
          middleZone={{
            title: 'Nova Factura',
            description: 'Crear una nova factura per a un client'
          }}
          bottomZone={{
            primaryAction: {
              text: 'Crear Factura',
              onClick: () => {
                window.location.href = '/dashboard/facturacio/facturas/crear';
              }
            }
          }}
        />

        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
          }}
          middleZone={{
            title: 'Gestió de Clients',
            description: 'Administrar informació fiscal dels clients'
          }}
          bottomZone={{
            primaryAction: {
              text: 'Veure Totes',
              onClick: () => {
                window.location.href = '/dashboard/facturacio/facturas';
              }
            }
          }}
        />

        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          }}
          middleZone={{
            title: 'Configuració',
            description: 'Configurar paràmetres de facturació'
          }}
          bottomZone={{
            primaryAction: {
              text: 'Configurar',
              onClick: () => {
                window.location.href = '/admin/facturacio/config';
              }
            }
          }}
        />
      </div>

      {/* Últimas facturas */}
      <UniversalCard
        variant="default"
        topZone={{
          type: 'gradient',
          value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }}
        middleZone={{
          title: 'Últimes Factures',
          description: 'Resum de les factures més recents'
        }}
        bottomZone={{
          customContent: (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregant factures...</p>
                </div>
              ) : ultimasFacturas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">No hi ha factures encara</p>
                  <button
                    onClick={() => window.location.href = '/dashboard/facturacio/facturas/crear'}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Crear la primera factura →
                  </button>
                </div>
              ) : (
                ultimasFacturas.map((factura) => (
                  <div key={factura.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{factura.numeroFactura}</p>
                      <p className="text-sm text-gray-600">{factura.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">€{factura.total.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        factura.estat === 'PAGADA' ? 'bg-green-100 text-green-800' :
                        factura.estat === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {factura.estat}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {ultimasFacturas.length > 0 && (
                <div className="pt-3">
                  <button
                    onClick={() => window.location.href = '/dashboard/facturacio/facturas'}
                    className="w-full text-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Veure totes les factures →
                  </button>
                </div>
              )}
            </div>
          )
        }}
      />
    </PageTemplate>
  );
}