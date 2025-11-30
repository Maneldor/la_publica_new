'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { translateUserType } from '@/lib/role-translations';

// Tipos de usuario disponibles
const USER_TYPES = [
  { value: 'EMPLOYEE', label: 'Usuari' },
  { value: 'COMPANY_OWNER', label: 'Empresa' },
  { value: 'COMPANY_MEMBER', label: 'Membre Empresa' },
  { value: 'ACCOUNT_MANAGER', label: 'Gestor Empreses' },
  { value: 'ADMIN', label: 'Administrador' },
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
  const [selectedUserType, setSelectedUserType] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

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

  // Cargar planes disponibles al montar el componente
  useEffect(() => {
    loadAvailablePlans();
  }, []);

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();

      if (data.success) {
        setAvailablePlans(data.data || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

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
      const payload: any = {
        userType: selectedUserType,
        email: baseData.email,
        password: baseData.password,
        userData: userData,
        customFields: customFieldValues,
        customFieldsPrivacy: customFieldsPrivacy
      };

      // Para empresas, agregar datos específicos
      if (selectedUserType === 'COMPANY_OWNER') {
        payload.companyName = userData.name;
        payload.selectedPlan = userData.selectedPlan;
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (selectedUserType === 'COMPANY_OWNER') {
            alert(`Empresa creada exitosamente!\n\nCredencials generades:\n📧 Email: ${baseData.email}\n🔑 Contrasenya: ${baseData.password}\n\nPodràs completar les dades addicionals des de la llista d'empreses.`);
            router.push('/admin/empresas/listar');
          } else {
            alert('Usuario creado exitosamente');
            router.push('/admin/usuarios/listar');
          }
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
      case 'EMPLOYEE':
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

      case 'COMPANY_OWNER':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <h3 className="text-lg font-medium text-blue-900">Fase 1: Dades Bàsiques d'Empresa</h3>
              </div>
              <p className="text-sm text-blue-700">
                Primera fase per crear una nova empresa col·laboradora. Omple les dades essencials i genera les credencials inicials.
              </p>
            </div>

            <div className="space-y-6">
              {/* Nom de l'empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={userData.name || ''}
                  onChange={(e) => {
                    const newUserData = { ...userData, name: e.target.value };
                    setUserData(newUserData);

                    // Generar contraseña automáticamente
                    if (newUserData.name && newUserData.selectedPlan) {
                      const password = generatePassword(newUserData.name, newUserData.selectedPlan);
                      setBaseData({ ...baseData, password, confirmPassword: password });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Empresa Col·laboradora SL"
                />
              </div>

              {/* Email de l'empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contacte *
                </label>
                <input
                  type="email"
                  required
                  value={baseData.email || ''}
                  onChange={(e) => setBaseData({ ...baseData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contacte@empresa.cat"
                />
              </div>

              {/* Selección de plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pla de Col·laboració *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        userData.selectedPlan === plan.tier
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const newUserData = { ...userData, selectedPlan: plan.tier };
                        setUserData(newUserData);

                        // Generar contraseña automáticamente
                        if (newUserData.name && newUserData.selectedPlan) {
                          const password = generatePassword(newUserData.name, newUserData.selectedPlan);
                          setBaseData({ ...baseData, password, confirmPassword: password });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        <span className="text-sm font-medium text-blue-600">
                          {plan.basePrice === 0 ? 'Gratis' : `${plan.basePrice}€/any`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Ofertes: {plan.maxActiveOffers === -1 ? 'Il·limitades' : plan.maxActiveOffers}
                      </p>
                      {plan.firstYearDiscount > 0 && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          -{Math.round(plan.firstYearDiscount * 100)}% 1r any
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contraseña generada */}
              {baseData.password && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔑</span>
                    <h4 className="font-medium text-yellow-900">Contrasenya Generada</h4>
                  </div>
                  <div className="font-mono text-lg bg-white px-3 py-2 border rounded mb-2">
                    {baseData.password}
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Format: {userData.name?.slice(0,3).toUpperCase()}DDMMYY{userData.selectedPlan?.slice(-1).toUpperCase()}
                  </p>
                  <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">ℹ️</span>
                      <span className="text-sm font-medium text-blue-900">Següent pas:</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      L'empresa apareixerà en estat "Pendent" fins completar totes les dades addicionals des del wizard complet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'ADMIN':
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

      case 'COMPANY_MEMBER':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos del Membre d'Empresa</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Aquest membre serà associat a una empresa existent. Només cal email i contrasenya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
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
                  Cognoms *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Càrrec
              </label>
              <input
                type="text"
                value={userData.position || ''}
                onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Responsable de Màrqueting"
              />
            </div>
          </div>
        );

      case 'ACCOUNT_MANAGER':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos del Gestor d'Empreses</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
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
                  Cognoms *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departament
              </label>
              <input
                type="text"
                value={userData.department || ''}
                onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Gestió Empresarial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialització
              </label>
              <select
                value={userData.specialization || ''}
                onChange={(e) => setUserData({ ...userData, specialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="pimes">PIMES</option>
                <option value="startups">Startups</option>
                <option value="corporacions">Corporacions</option>
                <option value="sector_public">Sector Públic</option>
              </select>
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

  // Función para generar contraseña automática
  const generatePassword = (companyName: string, planTier: string) => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);

    const companyPrefix = companyName.slice(0, 3).toUpperCase();
    const planSuffix = planTier.slice(-1).toUpperCase();

    return `${companyPrefix}${day}${month}${year}${planSuffix}`;
  };

  const handleUserTypeSelection = (userType: string) => {
    if (userType === 'COMPANY_OWNER') {
      // Redirigir al wizard específico de empresa
      router.push('/admin/usuarios/crear/empresa');
      return;
    }

    setSelectedUserType(userType);
    setUserData({});
    setCustomFieldValues({});
    setCustomFieldsPrivacy({});
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Usuario</h1>

      {/* Selección por botones */}
      {!selectedUserType && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USER_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => handleUserTypeSelection(type.value)}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all p-6 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  {type.value === 'EMPLOYEE' && <span className="text-2xl">👤</span>}
                  {type.value === 'COMPANY_OWNER' && <span className="text-2xl">🏢</span>}
                  {type.value === 'COMPANY_MEMBER' && <span className="text-2xl">👥</span>}
                  {type.value === 'ACCOUNT_MANAGER' && <span className="text-2xl">🤝</span>}
                  {type.value === 'ADMIN' && <span className="text-2xl">⚙️</span>}
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>

              <p className="text-sm text-gray-600">
                {type.value === 'EMPLOYEE' && 'Crear un usuari del sistema'}
                {type.value === 'COMPANY_OWNER' && 'Crear nova empresa col·laboradora'}
                {type.value === 'COMPANY_MEMBER' && 'Afegir membre a empresa existent'}
                {type.value === 'ACCOUNT_MANAGER' && 'Crear gestor d\'empreses'}
                {type.value === 'ADMIN' && 'Crear administrador del sistema'}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Formularios específicos */}
      {selectedUserType && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Crear {USER_TYPES.find(t => t.value === selectedUserType)?.label}
            </h2>
            <button
              onClick={() => setSelectedUserType('')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

      <form onSubmit={handleSubmit} className="space-y-8">

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
            {loading ? (selectedUserType === 'COMPANY_OWNER' ? 'Generant credencials...' : 'Creant usuari...') :
             selectedUserType === 'COMPANY_OWNER' ? 'Generar contrasenya i listar empresa' : 'Crear Usuario'}
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
      )}
    </div>
  );
}