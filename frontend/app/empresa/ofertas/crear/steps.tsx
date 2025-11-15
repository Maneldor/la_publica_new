import { ReactNode } from 'react';

// Step 1: Información Básica
export function Step1Info({ formData, onChange, categories }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Títol de l'oferta *
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="Ex: 20% de descompte en tots els menús"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria *
        </label>
        <select
          value={formData.categoryId || ''}
          onChange={(e) => onChange({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Selecciona una categoria</option>
          {categories?.data?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripció curta
        </label>
        <input
          type="text"
          value={formData.shortDescription || ''}
          onChange={(e) => onChange({ ...formData, shortDescription: e.target.value })}
          placeholder="Resum breu de l'oferta"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.shortDescription?.length || 0}/100 caràcters
        </p>
      </div>
    </div>
  );
}

// Step 2: Preus
export function Step2Preus({ formData, onChange }: any) {
  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice) || 0;
    const final = parseFloat(formData.price) || 0;
    if (original > 0 && final > 0 && original > final) {
      const discount = ((original - final) / original * 100).toFixed(0);
      onChange({ ...formData, discountPercentage: discount });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preu original (€)
          </label>
          <input
            type="number"
            value={formData.originalPrice || ''}
            onChange={(e) => {
              onChange({ ...formData, originalPrice: e.target.value });
              setTimeout(calculateDiscount, 100);
            }}
            placeholder="50.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preu final (€)
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => {
              onChange({ ...formData, price: e.target.value });
              setTimeout(calculateDiscount, 100);
            }}
            placeholder="40.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {formData.discountPercentage && parseFloat(formData.discountPercentage) > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            Descompte del {formData.discountPercentage}%
          </p>
          <p className="text-xs text-green-600 mt-1">
            Els clients estalviaran {((parseFloat(formData.originalPrice || 0) - parseFloat(formData.price || 0)).toFixed(2))}€
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipus de preu
        </label>
        <select
          value={formData.priceType || 'FIXED'}
          onChange={(e) => onChange({ ...formData, priceType: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="FIXED">Preu fix</option>
          <option value="PER_PERSON">Per persona</option>
          <option value="PER_HOUR">Per hora</option>
          <option value="PER_DAY">Per dia</option>
          <option value="PER_MONTH">Per mes</option>
          <option value="ON_REQUEST">Sota consulta</option>
        </select>
      </div>
    </div>
  );
}

// Step 3: Dates
export function Step3Dates({ formData, onChange }: any) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de publicació
        </label>
        <input
          type="date"
          value={formData.publishedAt || today}
          onChange={(e) => onChange({ ...formData, publishedAt: e.target.value })}
          min={today}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Data en què l'oferta serà visible (si està aprovada)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de caducitat
        </label>
        <input
          type="date"
          value={formData.expiresAt || ''}
          onChange={(e) => onChange({ ...formData, expiresAt: e.target.value })}
          min={today}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Deixa-ho buit si no té data de caducitat
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Durada de l'oferta
        </label>
        <input
          type="text"
          value={formData.duration || ''}
          onChange={(e) => onChange({ ...formData, duration: e.target.value })}
          placeholder="Ex: Vàlid tot el mes de desembre"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

// Step 4: Imatges
export function Step4Imatges({ formData, onChange }: any) {
  const addImage = (url: string) => {
    const currentImages = formData.images || [];
    if (url && !currentImages.includes(url)) {
      onChange({ ...formData, images: [...currentImages, url] });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    onChange({
      ...formData,
      images: currentImages.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de la imatge
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            id="imageUrl"
            placeholder="https://exemple.com/imatge.jpg"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('imageUrl') as HTMLInputElement;
              if (input.value) {
                addImage(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Afegir
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Pots afegir múltiples imatges de l'oferta
        </p>
      </div>

      {formData.images?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Imatges afegides:</p>
          <div className="grid grid-cols-2 gap-4">
            {formData.images.map((url: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Imatge ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 5: Contingut (descripción detallada)
export function Step5Contingut({ formData, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripció detallada *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          rows={8}
          placeholder="Descriu els detalls de l'oferta, què inclou, beneficis per als empleats públics..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/2000 caràcters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Beneficis destacats
        </label>
        <textarea
          value={formData.benefits || ''}
          onChange={(e) => onChange({ ...formData, benefits: e.target.value })}
          rows={4}
          placeholder="• Estalvi del 20% en tots els productes\n• Enviament gratuït\n• Atenció preferent"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

// Step 6: Condicions
export function Step6Condicions({ formData, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requisits per accedir a l'oferta
        </label>
        <textarea
          value={formData.requirements || ''}
          onChange={(e) => onChange({ ...formData, requirements: e.target.value })}
          rows={4}
          placeholder="Ex: Presentar carnet d'empleat públic vàlid..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condicions i restriccions
        </label>
        <textarea
          value={formData.conditions || ''}
          onChange={(e) => onChange({ ...formData, conditions: e.target.value })}
          rows={4}
          placeholder="Ex: No acumulable amb altres ofertes. Vàlid de dilluns a dijous..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes internes (només visible per admins)
        </label>
        <textarea
          value={formData.internalNotes || ''}
          onChange={(e) => onChange({ ...formData, internalNotes: e.target.value })}
          rows={3}
          placeholder="Notes privades sobre l'oferta..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

// Step 7: Contacte i Ubicació
export function Step7Contacte({ formData, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mètode de contacte preferit
        </label>
        <select
          value={formData.contactMethod || 'EMAIL'}
          onChange={(e) => onChange({ ...formData, contactMethod: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="EMAIL">Correu electrònic</option>
          <option value="PHONE">Telèfon</option>
          <option value="FORM">Formulari web</option>
          <option value="WEBSITE">Lloc web</option>
        </select>
      </div>

      {formData.contactMethod === 'EMAIL' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de contacte
          </label>
          <input
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => onChange({ ...formData, contactEmail: e.target.value })}
            placeholder="ofertes@empresa.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {formData.contactMethod === 'PHONE' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telèfon de contacte
          </label>
          <input
            type="tel"
            value={formData.contactPhone || ''}
            onChange={(e) => onChange({ ...formData, contactPhone: e.target.value })}
            placeholder="+34 900 000 000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enllaç extern (opcional)
        </label>
        <input
          type="url"
          value={formData.externalUrl || ''}
          onChange={(e) => onChange({ ...formData, externalUrl: e.target.value })}
          placeholder="https://www.empresa.com/ofertes"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicació
        </label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => onChange({ ...formData, location: e.target.value })}
          placeholder="Barcelona, Catalunya"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="remote"
          checked={formData.remote || false}
          onChange={(e) => onChange({ ...formData, remote: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="remote" className="text-sm font-medium text-gray-700">
          Oferta disponible online / remot
        </label>
      </div>
    </div>
  );
}

// Step 8: Revisió i Publicació
export function Step8Publicacio({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Estat de l'oferta</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Guardar Esborrany:</strong> Desar per continuar més tard</p>
          <p>• <strong>Enviar a Revisió:</strong> L'administrador revisarà i aprovarà</p>
          <p>• <strong>Publicar:</strong> Fer visible immediatament (si tens permisos)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured || false}
            onChange={(e) => onChange({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <label htmlFor="featured" className="text-sm font-medium text-gray-900">
              Destacar aquesta oferta
            </label>
            <p className="text-xs text-gray-500">Apareixerà en posicions prioritàries</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioritat (0-100)
          </label>
          <input
            type="number"
            value={formData.priority || 0}
            onChange={(e) => onChange({ ...formData, priority: parseInt(e.target.value) || 0 })}
            min="0"
            max="100"
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ofertes amb major prioritat apareixen primer
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetes (separades per comes)
          </label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => onChange({
              ...formData,
              tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean)
            })}
            placeholder="restaurants, descompte, barcelona"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Resum de l'oferta</h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Títol:</dt>
            <dd className="font-medium text-gray-900">{formData.title || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Categoria:</dt>
            <dd className="font-medium text-gray-900">{formData.categoryId || '-'}</dd>
          </div>
          {formData.discountPercentage && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Descompte:</dt>
              <dd className="font-medium text-green-600">{formData.discountPercentage}%</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">Preu final:</dt>
            <dd className="font-medium text-gray-900">
              {formData.price ? `€${formData.price}` : '-'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Caduca:</dt>
            <dd className="font-medium text-gray-900">
              {formData.expiresAt || 'Sense caducitat'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Imatges:</dt>
            <dd className="font-medium text-gray-900">
              {formData.images?.length || 0}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}