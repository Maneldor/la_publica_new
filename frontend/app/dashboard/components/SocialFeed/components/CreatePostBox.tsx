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
    <div style={{
      backgroundColor: 'var(--CreatePostBox-background, #ffffff)',
      borderRadius: 'var(--CreatePostBox-border-radius, 12px)',
      padding: '20px',
      border: '1px solid var(--CreatePostBox-border-color, #e5e7eb)',
      boxShadow: 'var(--CreatePostBox-shadow, 0 1px 3px rgba(0,0,0,0.1))',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Avatar */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--CreatePostBox-avatar-bg, #4f46e5)',
          color: 'var(--CreatePostBox-avatar-color, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {userImage ? (
            <img src={userImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            userInitial.toUpperCase()
          )}
        </div>

        {/* Contingut */}
        <div style={{ flex: 1 }}>
          {/* Header amb visibilitat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600', color: 'var(--CreatePostBox-user-name, #111827)' }}>
              {session?.user?.name || 'Usuari'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <VisibilityIcon style={{ width: '14px', height: '14px', color: 'var(--CreatePostBox-icon-color, #6b7280)' }} />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                style={{
                  fontSize: '14px',
                  color: 'var(--CreatePostBox-select-color, #4b5563)',
                  border: '1px solid var(--CreatePostBox-select-border, #e5e7eb)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--CreatePostBox-select-bg, #ffffff)',
                  outline: 'none'
                }}
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
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '16px',
              border: '1px solid var(--CreatePostBox-textarea-border, #e5e7eb)',
              borderRadius: '12px',
              fontSize: '14px',
              color: 'var(--CreatePostBox-textarea-color, #111827)',
              backgroundColor: 'var(--CreatePostBox-textarea-bg, #ffffff)',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />

          {/* Preview d'adjunts */}
          {attachments.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {attachments.map((att, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  {att.type === 'IMAGE' ? (
                    <div style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--CreatePostBox-attachment-border, #e5e7eb)'
                    }}>
                      <img src={att.preview || att.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--CreatePostBox-document-bg, #f3f4f6)',
                      borderRadius: '8px',
                      border: '1px solid var(--CreatePostBox-attachment-border, #e5e7eb)'
                    }}>
                      <FileText style={{ width: '16px', height: '16px', color: 'var(--CreatePostBox-document-icon, #6b7280)' }} />
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--CreatePostBox-document-text, #374151)',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{att.filename}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'var(--CreatePostBox-remove-bg, #ef4444)',
                      color: 'var(--CreatePostBox-remove-color, #ffffff)',
                      borderRadius: '50%',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulari d'enquesta */}
          {showPollForm && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: 'var(--CreatePostBox-poll-bg, #f9fafb)',
              borderRadius: '12px',
              border: '1px solid var(--CreatePostBox-poll-border, #e5e7eb)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--CreatePostBox-poll-title, #374151)' }}>
                  Opcions de l'enquesta
                </span>
                <button
                  onClick={() => setShowPollForm(false)}
                  style={{
                    padding: '4px',
                    color: 'var(--CreatePostBox-poll-close, #9ca3af)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pollOptions.map((option, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Opcio ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid var(--CreatePostBox-poll-input-border, #e5e7eb)',
                        borderRadius: '8px',
                        color: 'var(--CreatePostBox-poll-input-color, #111827)',
                        backgroundColor: 'var(--CreatePostBox-poll-input-bg, #ffffff)',
                        outline: 'none'
                      }}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(index)}
                        style={{
                          padding: '6px',
                          color: 'var(--CreatePostBox-remove-bg, #ef4444)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 4 && (
                <button
                  onClick={addPollOption}
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    color: 'var(--CreatePostBox-primary-color, #4f46e5)',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Afegir opcio
                </button>
              )}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--CreatePostBox-divider, #f3f4f6)'
          }}>
            {/* Botons d'adjunts */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {/* Input ocult per imatges */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  color: 'var(--CreatePostBox-action-color, #4b5563)',
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
              >
                {isUploading ? (
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <ImageIcon style={{ width: '16px', height: '16px' }} />
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
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  color: 'var(--CreatePostBox-action-color, #4b5563)',
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.5 : 1
                }}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
                Document
              </button>

              {/* Boto enquesta */}
              <button
                type="button"
                onClick={() => setShowPollForm(!showPollForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: showPollForm ? 'var(--CreatePostBox-poll-active-bg, #e0e7ff)' : 'transparent',
                  color: showPollForm ? 'var(--CreatePostBox-primary-color, #4f46e5)' : 'var(--CreatePostBox-action-color, #4b5563)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <BarChart3 style={{ width: '16px', height: '16px' }} />
                Enquesta
              </button>
            </div>

            {/* Boto Publicar */}
            <button
              onClick={handlePost}
              disabled={!canPost || isUploading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: canPost && !isUploading ? 'var(--CreatePostBox-submit-bg, #4f46e5)' : 'var(--CreatePostBox-submit-disabled-bg, #e5e7eb)',
                color: canPost && !isUploading ? 'var(--CreatePostBox-submit-color, #ffffff)' : 'var(--CreatePostBox-submit-disabled-color, #9ca3af)',
                border: 'none',
                cursor: canPost && !isUploading ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              {isUploading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
