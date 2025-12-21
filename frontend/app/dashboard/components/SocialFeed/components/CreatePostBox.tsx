'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ImageIcon, FileText, BarChart3, X, Loader2, Globe, Users, Lock, Plus } from 'lucide-react';

interface Attachment {
  type: 'IMAGE' | 'DOCUMENT';
  url: string;
  filename?: string;
  preview?: string;
}

type Visibility = 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE';

interface CreatePostBoxProps {
  onCreatePost: (content: string, attachments?: Attachment[], visibility?: Visibility) => void;
}

export function CreatePostBox({ onCreatePost }: CreatePostBoxProps) {
  const { data: session } = useSession();
  const [newPost, setNewPost] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (newPost.trim() || attachments.length > 0) {
      onCreatePost(newPost, attachments.length > 0 ? attachments : undefined, visibility);
      setNewPost('');
      setAttachments([]);
      setVisibility('PUBLIC');
      setShowPollForm(false);
      setPollOptions(['', '']);
    }
  };

  // Pujar fitxer a l'API
  const uploadFile = async (file: File, type: 'IMAGE' | 'DOCUMENT'): Promise<Attachment | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type === 'IMAGE' ? 'image' : 'document');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error pujant fitxer');
      }

      const data = await response.json();
      return {
        type,
        url: data.url,
        filename: file.name,
        preview: type === 'IMAGE' ? data.url : undefined,
      };
    } catch (error) {
      console.error('Error pujant fitxer:', error);
      return null;
    }
  };

  // Gestionar seleccio d'imatge
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        alert('Nomes es permeten imatges');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imatge no pot superar els 5MB');
        continue;
      }

      const attachment = await uploadFile(file, 'IMAGE');
      if (attachment) {
        setAttachments(prev => [...prev, attachment]);
      }
    }

    setIsUploading(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Gestionar seleccio de document
  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Tipus de fitxer no permes. Acceptem: PDF, Word, Excel, TXT');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('El document no pot superar els 10MB');
        continue;
      }

      const attachment = await uploadFile(file, 'DOCUMENT');
      if (attachment) {
        setAttachments(prev => [...prev, attachment]);
      }
    }

    setIsUploading(false);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  // Eliminar adjunt
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Afegir opcio d'enquesta
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Eliminar opcio d'enquesta
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Obtenir inicial de l'usuari
  const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0] || 'U';
  const userImage = session?.user?.image;

  const canPost = newPost.trim() || attachments.length > 0 || (showPollForm && pollOptions.filter(o => o.trim()).length >= 2);

  const VisibilityIcon = visibility === 'PUBLIC' ? Globe : visibility === 'CONNECTIONS' ? Users : Lock;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-5">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            userInitial.toUpperCase()
          )}
        </div>

        {/* Contingut */}
        <div className="flex-1">
          {/* Header amb visibilitat */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-gray-900">{session?.user?.name || 'Usuari'}</span>
            <div className="flex items-center gap-1.5">
              <VisibilityIcon className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="CONNECTIONS">Nomes connexions</option>
                <option value="PRIVATE">Privat</option>
              </select>
            </div>
          </div>

          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Que vols compartir amb la comunitat?"
            className="w-full min-h-[100px] p-4 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white resize-y font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          {/* Preview d'adjunts */}
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((att, index) => (
                <div key={index} className="relative group">
                  {att.type === 'IMAGE' ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={att.preview || att.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-700 max-w-[100px] truncate">{att.filename}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulari d'enquesta */}
          {showPollForm && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Opcions de l'enquesta</span>
                <button
                  onClick={() => setShowPollForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Opcio ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 4 && (
                <button
                  onClick={addPollOption}
                  className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Afegir opcio
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            {/* Botons d'adjunts */}
            <div className="flex gap-1">
              {/* Input ocult per imatges */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                Foto
              </button>

              {/* Input ocult per documents */}
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                onChange={handleDocumentSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Document
              </button>

              {/* Boto enquesta */}
              <button
                type="button"
                onClick={() => setShowPollForm(!showPollForm)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  showPollForm
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Enquesta
              </button>
            </div>

            {/* Boto Publicar */}
            <button
              onClick={handlePost}
              disabled={!canPost || isUploading}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                canPost && !isUploading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
