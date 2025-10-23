'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Tipos de usuario disponibles
const USER_TYPES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EMPLEADO_PUBLICO', label: 'Empleado Público' },
  { value: 'EMPRESA', label: 'Empresa' },
  { value: 'ADMINISTRACION_PUBLICA', label: 'Administración Pública' },
  { value: 'GESTOR_CONTENIDO', label: 'Gestor de Contenido' },
  { value: 'GESTOR_EMPRESAS', label: 'Gestor de Empresas' },
  { value: 'GESTOR_ADMINISTRACIONES', label: 'Gestor de Administraciones Públicas' },
];

// Tipos de administración
const ADMINISTRATION_TYPES = [
  { value: 'LOCAL', label: 'Local' },
  { value: 'AUTONOMICA', label: 'Autonómica' },
  { value: 'CENTRAL', label: 'Central' },
];

interface CustomField {
  id: string;
  name: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
}

export default function CrearUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('EMPLEADO_PUBLICO');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Datos base del usuario
  const [baseData, setBaseData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Datos específicos según el tipo de usuario
  const [userData, setUserData] = useState<any>({});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [customFieldsPrivacy, setCustomFieldsPrivacy] = useState<Record<string, 'public' | 'private'>>({});

  // Cargar campos personalizados cuando cambie el tipo de usuario
  useEffect(() => {
    fetchCustomFields();
  }, [selectedUserType]);

  const fetchCustomFields = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/admin/custom-fields/user-type/${selectedUserType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCustomFields(result.data);
        }
      }
    } catch (err) {
      console.error('Error loading custom fields:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas
    if (baseData.password !== baseData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (baseData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userType: selectedUserType,
          email: baseData.email,
          password: baseData.password,
          userData: userData,
          customFields: customFieldValues,
          customFieldsPrivacy: customFieldsPrivacy
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Usuario creado exitosamente');
          router.push('/admin/usuarios/listar');
        } else {
          alert(result.message || 'Error al crear el usuario');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear el usuario');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeFields = () => {
    switch (selectedUserType) {
      case 'EMPLEADO_PUBLICO':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos del Empleado Público</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={userData.firstName || ''}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={userData.lastName || ''}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comunidad Autónoma *
                </label>
                <input
                  type="text"
                  required
                  value={userData.community || ''}
                  onChange={(e) => setUserData({ ...userData, community: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Administración *
                </label>
                <select
                  required
                  value={userData.administrationType || ''}
                  onChange={(e) => setUserData({ ...userData, administrationType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {ADMINISTRATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacidades de roles adicionales */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Capacidades Adicionales</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.canBeGroupAdmin || false}
                    onChange={(e) => setUserData({ ...userData, canBeGroupAdmin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Puede ser Administrador de Grupos
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.canBeGroupModerator || false}
                    onChange={(e) => setUserData({ ...userData, canBeGroupModerator: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Puede ser Moderador de Grupos
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.canBeContentManager || false}
                    onChange={(e) => setUserData({ ...userData, canBeContentManager: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Puede ser Gestor de Contenido
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'EMPRESA':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos de la Empresa</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={userData.name || ''}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIF/NIF
                </label>
                <input
                  type="text"
                  value={userData.cif || ''}
                  onChange={(e) => setUserData({ ...userData, cif: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <input
                  type="text"
                  required
                  value={userData.sector || ''}
                  onChange={(e) => setUserData({ ...userData, sector: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de la Empresa
                </label>
                <select
                  value={userData.size || 'pequeña'}
                  onChange={(e) => setUserData({ ...userData, size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pequeña">Pequeña</option>
                  <option value="mediana">Mediana</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={userData.description || ''}
                onChange={(e) => setUserData({ ...userData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'ADMINISTRACION_PUBLICA':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos de la Administración Pública</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Administración *
                </label>
                <input
                  type="text"
                  required
                  value={userData.name || ''}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Administración *
                </label>
                <select
                  required
                  value={userData.administrationType || ''}
                  onChange={(e) => setUserData({ ...userData, administrationType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {ADMINISTRATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comunidad Autónoma
                </label>
                <input
                  type="text"
                  value={userData.community || ''}
                  onChange={(e) => setUserData({ ...userData, community: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={userData.city || ''}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Este tipo de usuario solo requiere email y contraseña.
            </p>
          </div>
        );
    }
  };

  const renderCustomFields = () => {
    if (customFields.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Campos Personalizados</h3>

        {customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name} {field.required && '*'}
            </label>

            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}

            {field.fieldType === 'TEXT' && (
              <input
                type="text"
                required={field.required}
                placeholder={field.placeholder}
                value={customFieldValues[field.id] || ''}
                onChange={(e) => setCustomFieldValues({
                  ...customFieldValues,
                  [field.id]: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {field.fieldType === 'SELECT' && field.options && (
              <select
                required={field.required}
                value={customFieldValues[field.id] || ''}
                onChange={(e) => setCustomFieldValues({
                  ...customFieldValues,
                  [field.id]: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* Configuración de privacidad para el campo */}
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`privacy-${field.id}`}
                  checked={customFieldsPrivacy[field.id] === 'public'}
                  onChange={() => setCustomFieldsPrivacy({
                    ...customFieldsPrivacy,
                    [field.id]: 'public'
                  })}
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-1 text-gray-700">Público</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name={`privacy-${field.id}`}
                  checked={customFieldsPrivacy[field.id] === 'private'}
                  onChange={() => setCustomFieldsPrivacy({
                    ...customFieldsPrivacy,
                    [field.id]: 'private'
                  })}
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-1 text-gray-700">Privado</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Usuario</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">

        {/* Selección del tipo de usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Usuario *
          </label>
          <select
            required
            value={selectedUserType}
            onChange={(e) => {
              setSelectedUserType(e.target.value);
              setUserData({}); // Reset user data when changing type
              setCustomFieldValues({});
              setCustomFieldsPrivacy({});
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {USER_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Datos básicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Datos de Acceso</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={baseData.email}
              onChange={(e) => setBaseData({ ...baseData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="usuario@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                required
                value={baseData.password}
                onChange={(e) => setBaseData({ ...baseData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                required
                value={baseData.confirmPassword}
                onChange={(e) => setBaseData({ ...baseData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>
        </div>

        {/* Campos específicos del tipo de usuario */}
        {renderUserTypeFields()}

        {/* Campos personalizados */}
        {renderCustomFields()}

        {/* Botones */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}