'use client';

import { FileText } from 'lucide-react';

export default function PostsTab() {
  return (
    <div style={{
      backgroundColor: 'var(--PostsTab-background, #ffffff)',
      borderRadius: 'var(--PostsTab-border-radius, 12px)',
      padding: 'var(--PostsTab-padding, 20px)',
      boxShadow: 'var(--PostsTab-shadow, 0 2px 8px rgba(0,0,0,0.1))',
      marginBottom: '20px',
      border: '1px solid var(--PostsTab-border-color, #f0f0f0)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--PostsTab-title-color, #1f2937)',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FileText style={{ width: '20px', height: '20px' }} />
        Publicacions (23 posts)
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--PostsTab-stat-bg, #f8f9fa)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--PostsTab-stat-posts-color, #3b82f6)',
            margin: '0 0 4px 0'
          }}>
            23
          </h4>
          <p style={{
            fontSize: '12px',
            color: 'var(--PostsTab-stat-label-color, #6b7280)',
            margin: 0
          }}>
            Total Posts
          </p>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--PostsTab-stat-bg, #f8f9fa)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--PostsTab-stat-likes-color, #ef4444)',
            margin: '0 0 4px 0'
          }}>
            367
          </h4>
          <p style={{
            fontSize: '12px',
            color: 'var(--PostsTab-stat-label-color, #6b7280)',
            margin: 0
          }}>
            Likes Rebuts
          </p>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--PostsTab-stat-bg, #f8f9fa)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--PostsTab-stat-comments-color, #10b981)',
            margin: '0 0 4px 0'
          }}>
            89
          </h4>
          <p style={{
            fontSize: '12px',
            color: 'var(--PostsTab-stat-label-color, #6b7280)',
            margin: 0
          }}>
            Comentaris
          </p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--PostsTab-empty-color, #6b7280)'
      }}>
        <FileText style={{
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
          Les publicacions es mostraran aquí
        </p>
        <p style={{
          fontSize: '14px',
          margin: 0
        }}>
          Implementació completa disponible en la següent fase
        </p>
      </div>
    </div>
  );
}
