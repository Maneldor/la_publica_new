'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  primaryRole: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    nick?: string;
  };
  company?: {
    name: string;
  };
  publicAdministration?: {
    name: string;
  };
  additionalRoles: Array<{
    role: string;
    groupId?: string;
  }>;
  permissions: Array<{
    permission: string;
    granted: boolean;
  }>;
}

export default function ListarUsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsers(result.data.users);
        } else {
          setError('Error al cargar los usuarios');
        }
      } else {
        setError('Error al cargar los usuarios');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/admin/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsers(users.map(u =>
            u.id === id ? { ...u, isActive: !currentStatus } : u
          ));
        }
      } else {
        alert('Error al cambiar el estado del usuario');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsers(users.filter(u => u.id !== id));
        }
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.employee) {
      return `${user.employee.firstName} ${user.employee.lastName}`;
    }
    if (user.company) {
      return user.company.name;
    }
    if (user.publicAdministration) {
      return user.publicAdministration.name;
    }
    return user.email;
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'ALL' || user.primaryRole === filter;
    const displayName = getUserDisplayName(user);
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={() => router.push('/admin/usuarios/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {[
            'ALL',
            'SUPER_ADMIN',
            'ADMIN',
            'EMPLEADO_PUBLICO',
            'EMPRESA',
            'ADMINISTRACION_PUBLICA',
            'GESTOR_CONTENIDO',
            'GESTOR_EMPRESAS',
            'GESTOR_ADMINISTRACIONES'
          ].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                filter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {role === 'ALL' ? 'Todos' :
               role === 'SUPER_ADMIN' ? 'Super Admin' :
               role === 'ADMIN' ? 'Admin' :
               role === 'EMPLEADO_PUBLICO' ? 'Empleados' :
               role === 'EMPRESA' ? 'Empresas' :
               role === 'ADMINISTRACION_PUBLICA' ? 'Admin. Públicas' :
               role === 'GESTOR_CONTENIDO' ? 'Gest. Contenido' :
               role === 'GESTOR_EMPRESAS' ? 'Gest. Empresas' :
               'Gest. Admin.'}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Usuarios</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Empleados Públicos</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.primaryRole === 'EMPLEADO_PUBLICO').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Administradores</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.primaryRole === 'ADMIN' || u.primaryRole === 'SUPER_ADMIN').length}
          </p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.additionalRoles.length > 0 && (
                          <div className="text-xs text-purple-600 mt-1">
                            +{user.additionalRoles.length} rol{user.additionalRoles.length > 1 ? 'es' : ''} adicional{user.additionalRoles.length > 1 ? 'es' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.primaryRole === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                      user.primaryRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.primaryRole === 'EMPLEADO_PUBLICO' ? 'bg-blue-100 text-blue-800' :
                      user.primaryRole === 'EMPRESA' ? 'bg-green-100 text-green-800' :
                      user.primaryRole === 'ADMINISTRACION_PUBLICA' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.primaryRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/admin/usuarios/editar/${user.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}