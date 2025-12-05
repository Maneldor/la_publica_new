'use client';

import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function TestCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const result = await response.json();
        setCompanies(result.data || []);
      } else {
        setError('Error al cargar empresas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const createAdidasCompany = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: "EMPRESA",
          email: "adidas@test.com",
          password: "AdidasTest123!",
          companyName: "ADIDAS",
          selectedPlan: "PIONERES",
          cif: "A12345678",
          phone: "600123456",
          address: "Carrer Example, 123, Barcelona",
          userData: {
            name: "ADIDAS",
            description: "Empresa de deportes y calzado",
            website: "https://adidas.com"
          }
        })
      });

      const result = await response.json();
      console.log('Resultado creación ADIDAS:', result);

      if (result.success) {
        alert('Empresa ADIDAS creada exitosamente');
        fetchCompanies(); // Recargar lista
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error('Error creando ADIDAS:', err);
      alert('Error creando empresa');
    }
  };

  if (loading) return <div className="p-8">Cargando empresas...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test - Listado de Empresas</h1>

      <button
        onClick={createAdidasCompany}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Crear Empresa ADIDAS de Prueba
      </button>

      <div className="space-y-2">
        {companies.length === 0 ? (
          <p>No hay empresas registradas</p>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="p-4 border rounded">
              <h3 className="font-bold">{company.name}</h3>
              <p>Email: {company.email}</p>
              <p>Status: {company.status}</p>
              <p>Creada: {new Date(company.createdAt).toLocaleDateString()}</p>
              <div className="mt-2 space-x-2">
                <a
                  href={`/admin/empresas/${company.name.toLowerCase()}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver detalles
                </a>
                <a
                  href={`/admin/empresas/editar/${company.name.toLowerCase()}`}
                  className="text-green-600 hover:underline"
                >
                  Editar
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}