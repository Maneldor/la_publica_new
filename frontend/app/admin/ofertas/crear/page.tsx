'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: number;
  name: string;
}

export default function CrearOfertaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    category: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    discountPercentage: '',
    stock: '',
    validUntil: '',
    terms: '',
    status: 'DRAFT',
    // Modos de adquisición
    acquisitionModes: {
      directContact: false,
      externalLink: false,
      promoCode: false,
      digitalCoupon: false,
      internalForm: false
    },
    // Configuraciones específicas
    directContactConfig: {
      phone: '',
      email: '',
      contactPerson: ''
    },
    externalLinkConfig: {
      url: '',
      description: '',
      buttonText: 'Ir a la oferta'
    },
    promoCodeConfig: {
      code: '',
      instructions: '',
      usageLimit: ''
    },
    digitalCouponConfig: {
      template: 'default',
      qrEnabled: true,
      barcodeEnabled: true,
      terms: '',
      usageLimit: '',
      validationRequired: true
    },
    internalFormConfig: {
      fields: ['name', 'email', 'organization'],
      autoApproval: false,
      notifyCompany: true
    }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setCompanies(data);
        } else if (data.data && Array.isArray(data.data)) {
          setCompanies(data.data);
        } else {
          console.error('Los datos no son un array:', data);
          setCompanies([]);
        }
      } else {
        console.error('Error al cargar empresas');
        setCompanies([]);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setCompanies([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDiscount = (original: string, discount: string) => {
    const orig = parseFloat(original);
    const disc = parseFloat(discount);
    if (orig && disc) {
      const percentage = ((orig - disc) / orig * 100).toFixed(0);
      setFormData(prev => ({ ...prev, discountPercentage: percentage }));
    }
  };

  const handleAcquisitionModeChange = (mode: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acquisitionModes: {
        ...prev.acquisitionModes,
        [mode]: checked
      }
    }));
  };

  const updateModeConfig = (configType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [configType]: {
        ...prev[configType as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que al menos un modo de adquisición esté seleccionado
    const hasAcquisitionMode = Object.values(formData.acquisitionModes).some(mode => mode);
    if (!hasAcquisitionMode) {
      alert('Debes seleccionar al menos un modo de adquisición');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      let imageUrl = '';
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append('image', image);

        const imageResponse = await fetch('http://localhost:5000/api/v1/cloudinary/offers', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: imageFormData
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.data.url;
        }
      }

      const response = await fetch('http://localhost:5000/api/v1/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          companyId: parseInt(formData.companyId),
          originalPrice: parseFloat(formData.originalPrice),
          discountPrice: parseFloat(formData.discountPrice),
          discountPercentage: parseInt(formData.discountPercentage),
          stock: formData.stock ? parseInt(formData.stock) : null,
          imageUrl
        })
      });

      if (response.ok) {
        alert('Oferta creada exitosamente');
        router.push('/admin/ofertas/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear la oferta');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Oferta VIP</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de la Oferta *
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Oferta *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Ej: 20% de descuento en menú degustación"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
            <select
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona una empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Restauración">Restauración</option>
              <option value="Ocio">Ocio y Entretenimiento</option>
              <option value="Salud">Salud y Bienestar</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Viajes">Viajes</option>
              <option value="Formación">Formación</option>
              <option value="Servicios">Servicios</option>
              <option value="Productos">Productos</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Describe los detalles de la oferta..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio Original (€) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.originalPrice}
              onChange={(e) => {
                setFormData({ ...formData, originalPrice: e.target.value });
                calculateDiscount(e.target.value, formData.discountPrice);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="99.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio Oferta (€) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.discountPrice}
              onChange={(e) => {
                setFormData({ ...formData, discountPrice: e.target.value });
                calculateDiscount(formData.originalPrice, e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="79.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
            <input
              type="text"
              disabled
              value={formData.discountPercentage ? `${formData.discountPercentage}%` : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Disponible</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Dejar vacío para ilimitado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Válida Hasta *</label>
            <input
              type="date"
              required
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Sección Modo de Adquisición */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Modo de Adquisición</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona uno o varios métodos que permitirán a los usuarios acceder a esta oferta.
          </p>

          <div className="space-y-4">
            {/* Contacto Directo */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="directContact"
                  checked={formData.acquisitionModes.directContact}
                  onChange={(e) => handleAcquisitionModeChange('directContact', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="directContact" className="text-sm font-medium text-gray-700">
                  📞 Contacto Directo
                </label>
              </div>
              {formData.acquisitionModes.directContact && (
                <div className="pl-7 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Teléfono de contacto"
                      value={formData.directContactConfig.phone}
                      onChange={(e) => updateModeConfig('directContactConfig', 'phone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email de contacto"
                      value={formData.directContactConfig.email}
                      onChange={(e) => updateModeConfig('directContactConfig', 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Persona de contacto (opcional)"
                    value={formData.directContactConfig.contactPerson}
                    onChange={(e) => updateModeConfig('directContactConfig', 'contactPerson', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>

            {/* Enlace Externo */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="externalLink"
                  checked={formData.acquisitionModes.externalLink}
                  onChange={(e) => handleAcquisitionModeChange('externalLink', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="externalLink" className="text-sm font-medium text-gray-700">
                  🔗 Enlace Externo
                </label>
              </div>
              {formData.acquisitionModes.externalLink && (
                <div className="pl-7 space-y-3">
                  <input
                    type="url"
                    placeholder="https://empresa.com/oferta"
                    value={formData.externalLinkConfig.url}
                    onChange={(e) => updateModeConfig('externalLinkConfig', 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Descripción del enlace"
                      value={formData.externalLinkConfig.description}
                      onChange={(e) => updateModeConfig('externalLinkConfig', 'description', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Texto del botón"
                      value={formData.externalLinkConfig.buttonText}
                      onChange={(e) => updateModeConfig('externalLinkConfig', 'buttonText', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Código Promocional */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="promoCode"
                  checked={formData.acquisitionModes.promoCode}
                  onChange={(e) => handleAcquisitionModeChange('promoCode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="promoCode" className="text-sm font-medium text-gray-700">
                  🏷️ Código Promocional
                </label>
              </div>
              {formData.acquisitionModes.promoCode && (
                <div className="pl-7 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CODIGO25"
                      value={formData.promoCodeConfig.code}
                      onChange={(e) => updateModeConfig('promoCodeConfig', 'code', e.target.value.toUpperCase())}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Límite de usos (opcional)"
                      value={formData.promoCodeConfig.usageLimit}
                      onChange={(e) => updateModeConfig('promoCodeConfig', 'usageLimit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <textarea
                    placeholder="Instrucciones de uso del código..."
                    value={formData.promoCodeConfig.instructions}
                    onChange={(e) => updateModeConfig('promoCodeConfig', 'instructions', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>

            {/* Cupón Digital */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="digitalCoupon"
                  checked={formData.acquisitionModes.digitalCoupon}
                  onChange={(e) => handleAcquisitionModeChange('digitalCoupon', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="digitalCoupon" className="text-sm font-medium text-gray-700">
                  🎫 Cupón Digital
                </label>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Recomendado
                </span>
              </div>
              {formData.acquisitionModes.digitalCoupon && (
                <div className="pl-7 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={formData.digitalCouponConfig.template}
                      onChange={(e) => updateModeConfig('digitalCouponConfig', 'template', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="default">Plantilla por defecto</option>
                      <option value="premium">Plantilla premium</option>
                      <option value="minimal">Plantilla minimalista</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Límite de cupones"
                      value={formData.digitalCouponConfig.usageLimit}
                      onChange={(e) => updateModeConfig('digitalCouponConfig', 'usageLimit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={formData.digitalCouponConfig.qrEnabled}
                          onChange={(e) => updateModeConfig('digitalCouponConfig', 'qrEnabled', e.target.checked)}
                          className="h-3 w-3"
                        />
                        QR
                      </label>
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={formData.digitalCouponConfig.barcodeEnabled}
                          onChange={(e) => updateModeConfig('digitalCouponConfig', 'barcodeEnabled', e.target.checked)}
                          className="h-3 w-3"
                        />
                        Barras
                      </label>
                    </div>
                  </div>
                  <textarea
                    placeholder="Términos específicos del cupón..."
                    value={formData.digitalCouponConfig.terms}
                    onChange={(e) => updateModeConfig('digitalCouponConfig', 'terms', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.digitalCouponConfig.validationRequired}
                      onChange={(e) => updateModeConfig('digitalCouponConfig', 'validationRequired', e.target.checked)}
                      className="h-4 w-4"
                    />
                    Requiere validación manual por la empresa
                  </label>
                </div>
              )}
            </div>

            {/* Formulario Interno */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="internalForm"
                  checked={formData.acquisitionModes.internalForm}
                  onChange={(e) => handleAcquisitionModeChange('internalForm', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="internalForm" className="text-sm font-medium text-gray-700">
                  📝 Formulario Interno
                </label>
              </div>
              {formData.acquisitionModes.internalForm && (
                <div className="pl-7 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.internalFormConfig.autoApproval}
                        onChange={(e) => updateModeConfig('internalFormConfig', 'autoApproval', e.target.checked)}
                        className="h-4 w-4"
                      />
                      Aprobación automática
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.internalFormConfig.notifyCompany}
                        onChange={(e) => updateModeConfig('internalFormConfig', 'notifyCompany', e.target.checked)}
                        className="h-4 w-4"
                      />
                      Notificar a la empresa
                    </label>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Campos incluidos:</strong> Nombre, Email, Organización, Teléfono, Comentarios
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validación */}
          {!Object.values(formData.acquisitionModes).some(mode => mode) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <span>⚠️</span>
                <span>Debes seleccionar al menos un modo de adquisición</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Términos y Condiciones</label>
          <textarea
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Condiciones de uso, restricciones, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicar</option>
            <option value="EXPIRED">Caducada</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Oferta'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}