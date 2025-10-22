'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessoramentsMock } from '@/data/assessoraments-mock';

export default function ListarAssessoraments() {
  const router = useRouter();
  const [assessoraments, setAssessoraments] = useState(assessoramentsMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const categories = ['legal', 'fiscal', 'salut', 'tecnologia', 'immobiliari'];
  const statuses = ['publicat', 'esborrany', 'inactiu'];

  // Filtrar assessoraments
  const filteredAssessoraments = assessoraments.filter(item => {
    const matchesSearch = item.titol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.empresa.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.categoria === filterCategory;
    const matchesStatus = !filterStatus || (item as any).status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Estàs segur que vols eliminar aquest assessorament?')) {
      setAssessoraments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setAssessoraments(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: (a as any).status === 'publicat' ? 'inactiu' : 'publicat'
        };
      }
      return a;
    }));
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestió d'Assessoraments</h1>
        <Link
          href="/admin/assessoraments/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nou Assessorament
        </Link>
      </div>


      {/* Taula d'assessoraments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessorament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssessoraments.map((assessorament) => {
              const modalitatsActives = assessorament.modalitats
                .filter(m => m.activa)
                .map(m => {
                  switch(m.tipus) {
                    case 'presencial': return '🏢';
                    case 'online': return '💻';
                    case 'telefonica': return '📞';
                    case 'email': return '✉️';
                    default: return '';
                  }
                }).join(' ');

              return (
                <tr key={assessorament.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assessorament.titol}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assessorament.empresa.nom}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assessorament.categoria === 'legal' ? 'bg-blue-100 text-blue-800' :
                      assessorament.categoria === 'fiscal' ? 'bg-green-100 text-green-800' :
                      assessorament.categoria === 'salut' ? 'bg-red-100 text-red-800' :
                      assessorament.categoria === 'tecnologia' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assessorament.categoria}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (assessorament as any).status === 'publicat'
                        ? 'bg-green-100 text-green-800'
                        : (assessorament as any).status === 'esborrany'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(assessorament as any).status === 'publicat' ? 'Publicat' : (assessorament as any).status === 'esborrany' ? 'Esborrany' : 'Inactiu'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/assessoraments/editar/${assessorament.slug}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(assessorament.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>

        {filteredAssessoraments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No s'han trobat assessoraments
          </div>
        )}
      </div>
    </div>
  );
}