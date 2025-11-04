'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileText, BarChart3, Pin, Users, Clock, Send, X, Plus } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
}

export default function CrearPostSocialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');

  const [formData, setFormData] = useState({
    content: '',
    images: [] as File[],
    imagePreviews: [] as string[],
    pollQuestion: '',
    pollOptions: [
      { id: '1', text: '' },
      { id: '2', text: '' }
    ] as PollOption[],
    pollDuration: '7', // días
    allowMultipleVotes: false,
    isPinned: false,
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
    audienceType: 'public', // public, members, groups
    selectedGroups: [] as string[],
    tags: '',
    enableComments: true,
    enableShares: true,
  });

  const groups = [
    { id: '1', name: 'Funcionaris IT' },
    { id: '2', name: 'Recursos Humans' },
    { id: '3', name: 'Alcaldies Catalans' },
    { id: '4', name: 'Educació Pública' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);

          const imageResponse = await fetch('http://localhost:5000/api/v1/cloudinary/posts', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: imageFormData
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageUrls.push(imageData.data.url);
          }
        }
      }

      const postData = {
        type: postType,
        content: formData.content,
        images: imageUrls,
        poll: postType === 'poll' ? {
          question: formData.pollQuestion,
          options: formData.pollOptions.filter(opt => opt.text.trim()),
          duration: parseInt(formData.pollDuration),
          allowMultipleVotes: formData.allowMultipleVotes
        } : null,
        isPinned: formData.isPinned,
        isScheduled: formData.isScheduled,
        scheduledDate: formData.isScheduled ? `${formData.scheduledDate}T${formData.scheduledTime}` : null,
        audienceType: formData.audienceType,
        selectedGroups: formData.selectedGroups,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        enableComments: formData.enableComments,
        enableShares: formData.enableShares,
        status: formData.isScheduled ? 'SCHEDULED' : 'PUBLISHED'
      };

      const response = await fetch('http://localhost:5000/api/v1/social-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        alert('Publicació social creada correctament!');
        router.push('/admin/posts/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear la publicació');
      }
    } catch {
      alert('Error de connexió');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          newImages.push(file);

          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === newImages.length) {
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
                imagePreviews: [...prev.imagePreviews, ...newPreviews]
              }));
            }
          };
          reader.readAsDataURL(file);
        }
      });
      setPostType('image');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
    if (formData.images.length === 1) {
      setPostType('text');
    }
  };

  const addPollOption = () => {
    if (formData.pollOptions.length < 6) {
      setFormData(prev => ({
        ...prev,
        pollOptions: [...prev.pollOptions, { id: Date.now().toString(), text: '' }]
      }));
    }
  };

  const removePollOption = (id: string) => {
    if (formData.pollOptions.length > 2) {
      setFormData(prev => ({
        ...prev,
        pollOptions: prev.pollOptions.filter(opt => opt.id !== id)
      }));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.map(opt =>
        opt.id === id ? { ...opt, text } : opt
      )
    }));
  };

  const togglePollType = () => {
    if (postType === 'poll') {
      setPostType('text');
    } else {
      setPostType('poll');
      setFormData(prev => ({ ...prev, images: [], imagePreviews: [] }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Publicació Social</h1>
        <p className="text-gray-600 mt-1">Crea contingut per al feed social de La Pública</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Box */}
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div>
                <div className="font-semibold text-gray-900">Administrador</div>
                <div className="text-sm text-gray-600">
                  {formData.audienceType === 'public' && '🌍 Públic'}
                  {formData.audienceType === 'members' && '👥 Només membres'}
                  {formData.audienceType === 'groups' && `👥 Grups seleccionats (${formData.selectedGroups.length})`}
                </div>
              </div>
              {formData.isPinned && (
                <div className="ml-auto">
                  <Pin className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Què vols compartir amb la comunitat?"
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              maxLength={2000}
            />

            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.content.length}/2000
            </div>

            {/* Image Previews */}
            {formData.imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Poll Creation */}
            {postType === 'poll' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pregunta de l'enquesta *
                  </label>
                  <input
                    type="text"
                    value={formData.pollQuestion}
                    onChange={(e) => setFormData({ ...formData, pollQuestion: e.target.value })}
                    placeholder="Escriu la teva pregunta..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={postType === 'poll'}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Opcions de resposta
                  </label>
                  {formData.pollOptions.map((option, index) => (
                    <div key={option.id} className="flex gap-3 items-center">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updatePollOption(option.id, e.target.value)}
                        placeholder={`Opció ${index + 1}`}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={postType === 'poll'}
                      />
                      {formData.pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(option.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {formData.pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Afegir opció
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durada (dies)
                    </label>
                    <select
                      value={formData.pollDuration}
                      onChange={(e) => setFormData({ ...formData, pollDuration: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="1">1 dia</option>
                      <option value="3">3 dies</option>
                      <option value="7">7 dies</option>
                      <option value="14">14 dies</option>
                      <option value="30">30 dies</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.allowMultipleVotes}
                        onChange={(e) => setFormData({ ...formData, allowMultipleVotes: e.target.checked })}
                        className="rounded"
                      />
                      Permetre múltiples respostes
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={postType === 'poll'}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  Foto
                </button>

                <button
                  type="button"
                  onClick={togglePollType}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  {postType === 'poll' ? 'Eliminar enquesta' : 'Enquesta'}
                </button>
              </div>

              <div className="text-sm text-gray-500">
                {formData.isScheduled ? '🕒 Programada' : '✨ Publicació immediata'}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audience & Visibility */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Audiència i Visibilitat
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qui pot veure aquesta publicació?
                </label>
                <select
                  value={formData.audienceType}
                  onChange={(e) => setFormData({ ...formData, audienceType: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">🌍 Tothom (Públic)</option>
                  <option value="members">👥 Només membres verificats</option>
                  <option value="groups">👥 Grups específics</option>
                </select>
              </div>

              {formData.audienceType === 'groups' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona grups
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {groups.map((group) => (
                      <label key={group.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedGroups.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                selectedGroups: [...prev.selectedGroups, group.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                selectedGroups: prev.selectedGroups.filter(id => id !== group.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{group.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  <Pin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Ancorar publicació</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-8">
                  Les publicacions ancorades apareixen a la part superior del feed
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling & Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Programació i Configuració
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.isScheduled}
                    onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Programar publicació</span>
                </label>

                {formData.isScheduled && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Data</label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        required={formData.isScheduled}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hora</label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        required={formData.isScheduled}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tecnologia, innovació, formació"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separar amb comes</p>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enableComments}
                    onChange={(e) => setFormData({ ...formData, enableComments: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Permetre comentaris</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enableShares}
                    onChange={(e) => setFormData({ ...formData, enableShares: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Permetre compartir</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.content.trim() || (postType === 'poll' && (!formData.pollQuestion.trim() || formData.pollOptions.some(opt => !opt.text.trim())))}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {formData.isScheduled ? 'Programant...' : 'Publicant...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {formData.isScheduled ? 'Programar Publicació' : 'Publicar Ara'}
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </form>
    </div>
  );
}