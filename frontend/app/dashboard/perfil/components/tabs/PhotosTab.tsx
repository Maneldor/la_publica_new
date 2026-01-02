'use client';

import { Image } from 'lucide-react';

export default function PhotosTab() {
  return (
    <div style={{
      backgroundColor: 'var(--PhotosTab-background, #ffffff)',
      borderRadius: 'var(--PhotosTab-border-radius, 12px)',
      padding: 'var(--PhotosTab-padding, 20px)',
      boxShadow: 'var(--PhotosTab-shadow, 0 2px 8px rgba(0,0,0,0.1))',
      marginBottom: '20px',
      border: '1px solid var(--PhotosTab-border-color, #f0f0f0)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--PhotosTab-title-color, #1f2937)',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Image style={{ width: '20px', height: '20px' }} />
        Galeria de Fotos
      </h3>

      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--PhotosTab-empty-color, #6b7280)'
      }}>
        <Image style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 16px',
          opacity: 0.5
        }} />
        <p style={{
          fontSize: '16px',
          fontWeight: '500',
          margin: '0 0 8px 0'
        }}>
          La galeria de fotos es mostrarà aquí
        </p>
        <p style={{
          fontSize: '14px',
          margin: 0
        }}>
          Implementació amb grid responsive i lightbox
        </p>
      </div>
    </div>
  );
}
