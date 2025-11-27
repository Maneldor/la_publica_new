'use client';

import { useRouter } from 'next/navigation';
import { Group } from '../../data/groupsData';

interface GroupItemProps {
  group: Group;
}

export function GroupItem({ group }: GroupItemProps) {
  const router = useRouter();

  return (
    <div
      key={group.id}
      style={{
        position: 'relative',
        minHeight: '120px',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '8px',
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => router.push(`/dashboard/grups/${group.id}`)}
    >
      {/* Imagen de fondo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${group.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />

      {/* Overlay sutil para legibilidad del texto */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)`,
      }} />

      {/* Contenido */}
      <div style={{
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 12px'
      }}>
        {/* Parte superior - Nombre del grupo */}
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '4px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {group.name}
        </div>

        {/* Parte central - Slogan y miembros */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.3',
            marginBottom: '4px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {group.slogan}
          </div>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '500'
          }}>
            {group.members} membres
          </div>
        </div>

        {/* Parte inferior - Botón completo */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Lógica de connexión
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.6)',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
            marginTop: '2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
          }}
        >
          Entrar al grup
        </button>
      </div>
    </div>
  );
}