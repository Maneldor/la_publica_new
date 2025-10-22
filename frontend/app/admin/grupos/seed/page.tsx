'use client';

import { useState } from 'react';

export default function SeedGruposPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const sampleGroups = [
    {
      name: 'Desenvolupadors Frontend',
      description: 'Codificant el futur, un component cada cop. Compartim coneixements sobre React, Vue, Angular i les últimes tecnologies frontend.',
      category: 'Tecnologia',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
    },
    {
      name: 'Disseny UX/UI',
      description: 'Creant experiències que importen. Explorarem les millors pràctiques en disseny d\'interfícies i experiència d\'usuari.',
      category: 'Disseny',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
    },
    {
      name: 'Marketing Digital',
      description: 'Connectant marques amb persones. Estratègies innovadores de màrqueting digital i xarxes socials.',
      category: 'Marketing',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      name: 'Emprenedors Catalunya',
      description: 'Transformant idees en realitat. Comunitat d\'emprenedors i startups catalanes.',
      category: 'Negocis',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop'
    },
    {
      name: 'Projecte Alpha',
      description: 'Innovació confidencial en desenvolupament. Equip exclusiu per a projectes d\'alta tecnologia.',
      category: 'R&D',
      visibility: 'PRIVATE',
      imageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop'
    },
    {
      name: 'Consultors Senior',
      description: 'Experiència al servei de l\'excel·lència. Grup de consultors amb més de 5 anys d\'experiència.',
      category: 'Consultoria',
      visibility: 'PRIVATE',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      name: 'Formació Contínua',
      description: 'Creixement professional continu. Compartim recursos de formació i desenvolupament professional.',
      category: 'Educació',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop'
    },
    {
      name: 'Consell Directiu',
      description: 'Liderant el futur de l\'organització. Decisions estratègiques i governança corporativa.',
      category: 'Gestió',
      visibility: 'PRIVATE',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    },
    {
      name: 'Innovació R&D',
      description: 'Explorant fronteres tecnològiques. Recerca i desenvolupament de nous productes i serveis.',
      category: 'Investigació',
      visibility: 'PRIVATE',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
    },
    {
      name: 'Sostenibilitat',
      description: 'Construint un futur més verd. Iniciatives sostenibles i consciència ambiental.',
      category: 'Medi Ambient',
      visibility: 'PUBLIC',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop'
    }
  ];

  const createGroups = async () => {
    setLoading(true);
    setResults([]);

    const newResults: string[] = [];

    for (const group of sampleGroups) {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/v1/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(group)
        });

        if (response.ok) {
          const result = await response.json();
          newResults.push(`✅ Grup creat: ${group.name}`);
        } else {
          const error = await response.json();
          newResults.push(`❌ Error creant ${group.name}: ${error.message}`);
        }
      } catch (err: any) {
        newResults.push(`❌ Error de connexió creant ${group.name}: ${err.message}`);
      }

      setResults([...newResults]);

      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Grups d'Exemple</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Generar Dades de Mostra</h2>
        <p className="text-gray-600 mb-4">
          Aquest procés crearà {sampleGroups.length} grups d'exemple amb imatges i contingut realista.
        </p>

        <button
          onClick={createGroups}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Creant grups...' : `Crear ${sampleGroups.length} Grups`}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resultats</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  result.includes('✅')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Grups que es crearan:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleGroups.map((group, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              <div className="font-medium">{group.name}</div>
              <div className="text-sm text-gray-600">{group.category} • {group.visibility}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {group.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}