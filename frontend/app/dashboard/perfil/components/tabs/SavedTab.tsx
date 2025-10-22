'use client';

import { Bookmark, Heart } from 'lucide-react';

export default function SavedTab() {
  return (
    <div>
      {/* Resum estadístiques */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Bookmark style={{ width: '20px', height: '20px' }} />
          📊 Resum de Guardats
        </h2>

        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          Total guardats: **47**
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#0369a1' }}>📝 12</div>
            <div style={{ fontSize: '12px', color: '#0369a1' }}>Blogs</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#166534' }}>🎁 8</div>
            <div style={{ fontSize: '12px', color: '#166534' }}>Ofertes</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#86198f' }}>💬 15</div>
            <div style={{ fontSize: '12px', color: '#86198f' }}>Forums</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#c2410c' }}>📢 6</div>
            <div style={{ fontSize: '12px', color: '#c2410c' }}>Anuncis</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#4338ca' }}>🏢 3</div>
            <div style={{ fontSize: '12px', color: '#4338ca' }}>Empreses</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#be185d' }}>👥 3</div>
            <div style={{ fontSize: '12px', color: '#be185d' }}>Grups</div>
          </div>
        </div>
      </div>

      {/* Ofertes guardades */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            🎁 OFERTES GUARDADES (8)
          </h3>
          <button
            style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
          >
            Veure totes →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              title: 'Descuento 25% en Portàtils Professionals',
              company: 'TechSolutions BCN',
              price: '900€',
              originalPrice: '1200€',
              image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop'
            },
            {
              title: 'Monitors 24" Full HD',
              company: 'DisplayTech',
              price: '150€',
              originalPrice: '200€',
              image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop'
            },
            {
              title: 'Teclats mecànics professionals',
              company: 'KeyboardPro',
              price: '75€',
              originalPrice: '100€',
              image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop'
            },
            {
              title: 'Auriculars Bluetooth Premium',
              company: 'AudioTech',
              price: '120€',
              originalPrice: '160€',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'
            }
          ].map((offer, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img
                src={offer.image}
                alt={offer.title}
                style={{ width: '100%', height: '120px', objectFit: 'cover' }}
              />
              <div style={{ padding: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                  {offer.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  {offer.company}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                    {offer.price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'line-through' }}>
                    {offer.originalPrice}
                  </span>
                </div>
              </div>

              <button
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '4px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#ef4444'
                }}
                title="Eliminar de guardats"
              >
                <Heart style={{ width: '14px', height: '14px', fill: '#ef4444' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Blogs guardats */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            📝 BLOGS GUARDATS (12)
          </h3>
          <button
            style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
          >
            Veure tots →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              title: 'Digitalització de l\'Administració Pública',
              description: 'Estratègies per modernitzar els processos administratius',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
            },
            {
              title: 'Innovació en Serveis Públics',
              description: 'Com implementar noves tecnologies al servei públic',
              image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop'
            },
            {
              title: 'Transformació Digital Local',
              description: 'Casos d\'èxit en l\'administració municipal',
              image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
            },
            {
              title: 'Ciberseguretat en el Sector Públic',
              description: 'Protocols i mesures de protecció essencials',
              image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=300&h=200&fit=crop'
            }
          ].map((blog, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img
                src={blog.image}
                alt={blog.title}
                style={{ width: '100%', height: '120px', objectFit: 'cover' }}
              />
              <div style={{ padding: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                  {blog.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                  {blog.description}
                </p>
              </div>

              <button
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '4px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#3b82f6'
                }}
                title="Eliminar de guardats"
              >
                <Bookmark style={{ width: '14px', height: '14px', fill: '#3b82f6' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Altres categories */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #f0f0f0'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          📂 Altres Categories
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: '600', color: '#86198f' }}>Forums (15)</div>
            <div style={{ fontSize: '12px', color: '#a855f7' }}>Temes guardats</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fff7ed', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
            <div style={{ fontWeight: '600', color: '#c2410c' }}>Anuncis (6)</div>
            <div style={{ fontSize: '12px', color: '#ea580c' }}>Anuncis d'interès</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#eef2ff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
            <div style={{ fontWeight: '600', color: '#4338ca' }}>Empreses (3)</div>
            <div style={{ fontSize: '12px', color: '#6366f1' }}>Empreses seguides</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontWeight: '600', color: '#be185d' }}>Grups (3)</div>
            <div style={{ fontSize: '12px', color: '#ec4899' }}>Grups d'interès</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
          >
            Veure tots els guardats →
          </button>
        </div>
      </div>
    </div>
  );
}