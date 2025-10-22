'use client';

import { useState } from 'react';

interface CreatePostBoxProps {
  onCreatePost: (content: string) => void;
}

export function CreatePostBox({ onCreatePost }: CreatePostBoxProps) {
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (newPost.trim()) {
      onCreatePost(newPost);
      setNewPost('');
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #3b82f6',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          flexShrink: 0
        }}>
          U
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Què vols compartir amb la comunitat?"
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                📷 Foto
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                📄 Document
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                📊 Enquesta
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              style={{
                padding: '8px 20px',
                backgroundColor: newPost.trim() ? '#3b82f6' : '#e0e0e0',
                color: newPost.trim() ? 'white' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}