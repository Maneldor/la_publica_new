'use client';

import { useState } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { UniversalCard } from '../../../components/ui/UniversalCard';

interface Company {
  id: string;
  name: string;
  cif: string;
  sector: string;
  website?: string;
  employees?: number;
  convertedDate: string;
  originalLeadId: string;
  totalValue: number;
  status: 'active' | 'inactive' | 'pending';
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Innovació Tech SL',
    cif: 'B12345678',
    sector: 'Tecnologia',
    website: 'https://innovaciotech.cat',
    employees: 45,
    convertedDate: '2024-10-15',
    originalLeadId: 'lead-001',
    totalValue: 75000,
    status: 'active',
    primaryContact: {
      name: 'Maria García',
      email: 'maria@innovaciotech.cat',
      phone: '+34 932 456 789',
      position: 'Directora Comercial'
    }
  },
  {
    id: '2',
    name: 'Consultoria Barcelona',
    cif: 'B87654321',
    sector: 'Consultoria',
    website: 'https://consultoria-bcn.com',
    employees: 23,
    convertedDate: '2024-10-12',
    originalLeadId: 'lead-002',
    totalValue: 45000,
    status: 'active',
    primaryContact: {
      name: 'Joan Martínez',
      email: 'joan@consultoria-bcn.com',
      phone: '+34 933 567 890',
      position: 'CEO'
    }
  },
  {
    id: '3',
    name: 'Serveis Digitals Pro',
    cif: 'B11223344',
    sector: 'Serveis Digitals',
    employees: 12,
    convertedDate: '2024-10-08',
    originalLeadId: 'lead-003',
    totalValue: 32000,
    status: 'pending',
    primaryContact: {
      name: 'Anna López',
      email: 'anna@serveidigital.cat',
      phone: '+34 934 678 901',
      position: 'Project Manager'
    }
  }
];

export default function EmpresasPage() {
  const [companies] = useState<Company[]>(mockCompanies);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredCompanies = companies.filter(company => {
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cif.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const pendingCompanies = companies.filter(c => c.status === 'pending').length;
  const totalValue = companies.reduce((sum, c) => sum + c.totalValue, 0);

  const statsData = [
    {
      label: 'Total Empreses',
      value: totalCompanies.toString(),
      trend: '+2 aquest mes'
    },
    {
      label: 'Empreses Actives',
      value: activeCompanies.toString(),
      trend: `${Math.round((activeCompanies / totalCompanies) * 100)}% del total`
    },
    {
      label: 'Pendents d\'Activació',
      value: pendingCompanies.toString(),
      trend: pendingCompanies > 0 ? 'Requereix atenció' : 'Tot al dia'
    },
    {
      label: 'Valor Total',
      value: `€${totalValue.toLocaleString()}`,
      trend: '+12% aquest trimestre'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'inactive':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'pending':
        return 'Pendent';
      case 'inactive':
        return 'Inactiva';
      default:
        return 'Desconegut';
    }
  };

  return (
    <PageTemplate
      title="Empreses Convertides"
      subtitle="Gestió d'empreses que han esdevingut clients després del procés comercial"
      statsData={statsData}
    >
      <div className="space-y-6">
        {/* Filtres */}
        <UniversalCard
          variant="default"
          topZone={{
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          middleZone={{
            title: 'Filtres i Cerca',
            description: 'Filtra i cerca empreses convertides',
            content: (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cerca per nom d'empresa o CIF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tots els estats</option>
                    <option value="active">Actives</option>
                    <option value="pending">Pendents</option>
                    <option value="inactive">Inactives</option>
                  </select>
                </div>
              </div>
            )
          }}
        />

        {/* Llista d'empreses */}
        <div className="grid gap-6">
          {filteredCompanies.map((company) => (
            <UniversalCard
              key={company.id}
              variant="default"
              topZone={{
                type: 'gradient',
                value: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              }}
              middleZone={{
                title: company.name,
                subtitle: `CIF: ${company.cif}`,
                content: (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                          {getStatusText(company.status)}
                        </span>
                      </div>
                    </div>
                    {/* Informació de l'empresa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Informació de l'Empresa</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Sector:</span> {company.sector}</p>
                          <p><span className="font-medium">Empleats:</span> {company.employees || 'No especificat'}</p>
                          {company.website && (
                            <p>
                              <span className="font-medium">Web:</span>{' '}
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {company.website}
                              </a>
                            </p>
                          )}
                          <p><span className="font-medium">Convertida:</span> {new Date(company.convertedDate).toLocaleDateString('ca-ES')}</p>
                          <p><span className="font-medium">Valor Total:</span> €{company.totalValue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contacte Principal</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Nom:</span> {company.primaryContact.name}</p>
                          <p><span className="font-medium">Càrrec:</span> {company.primaryContact.position}</p>
                          <p>
                            <span className="font-medium">Email:</span>{' '}
                            <a href={`mailto:${company.primaryContact.email}`} className="text-blue-600 hover:underline">
                              {company.primaryContact.email}
                            </a>
                          </p>
                          <p>
                            <span className="font-medium">Telèfon:</span>{' '}
                            <a href={`tel:${company.primaryContact.phone}`} className="text-blue-600 hover:underline">
                              {company.primaryContact.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }}
              bottomZone={{
                primaryAction: {
                  text: 'Veure Detalls',
                  onClick: () => {
                    // TODO: Navegar a pàgina de detall de l'empresa
                    console.log('Veure detalls empresa:', company.id);
                  }
                },
                secondaryAction: {
                  text: 'Veure Lead Original',
                  onClick: () => {
                    // TODO: Navegar al lead original
                    console.log('Veure lead original:', company.originalLeadId);
                  }
                }
              }}
            />
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <UniversalCard
            variant="default"
            topZone={{
              type: 'gradient',
              value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
            middleZone={{
              title: 'Cap empresa trobada',
              description: 'No s\'han trobat empreses que coincideixin amb els filtres seleccionats.'
            }}
            bottomZone={{
              primaryAction: {
                text: 'Netejar Filtres',
                onClick: () => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }
              }
            }}
          />
        )}
      </div>
    </PageTemplate>
  );
}