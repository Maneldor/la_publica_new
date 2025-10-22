'use client';

import { useState } from 'react';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

// Solicitudes de ejemplo
const sampleRequests = [
  {
    id: 1,
    name: 'Innovació Digital Barcelona',
    description: 'Grup dedicat a compartir experiències i bones pràctiques en transformació digital al sector públic barceloní.',
    purpose: 'Facilitar l\'intercanvi de coneixement entre departaments sobre noves tecnologies i processos digitals. Volem crear un espai per compartir casos d\'èxit, reptes i solucions innovadores que puguin ser replicades en altres àrees de l\'administració.',
    category: 'Innovació',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
    tags: ['Digitalització', 'Innovació', 'Barcelona'],
    requestedBy: 'Maria Fernández',
    requestedByDepartment: 'Departament de Tecnologia',
    requestDate: '2025-10-12T10:30:00Z',
    status: 'pending' as const,
    adminNotes: ''
  },
  {
    id: 2,
    name: 'Sostenibilitat Urbana',
    description: 'Espai de col·laboració per a professionals dedicats a projectes de sostenibilitat i medi ambient.',
    purpose: 'Coordinar iniciatives de sostenibilitat entre diferents departaments i municipis. L\'objectiu és compartir recursos, metodologies i resultats de projectes mediambientals per accelerar la transició ecològica del sector públic.',
    category: 'Sostenibilitat',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop',
    tags: ['Medi Ambient', 'Sostenibilitat', 'Projectes Verds'],
    requestedBy: 'Joan Martí',
    requestedByDepartment: 'Departament de Medi Ambient',
    requestDate: '2025-10-11T14:15:00Z',
    status: 'pending' as const,
    adminNotes: ''
  },
  {
    id: 3,
    name: 'Formació Contínua Empleats',
    description: 'Grup per coordinar programes de formació i desenvolupament professional dels empleats públics.',
    purpose: 'Crear una xarxa de formadors i responsables de RRHH per optimitzar l\'oferta formativa, evitar duplicitats i compartir metodologies d\'aprenentatge efectives. Volem millorar la qualificació dels empleats públics de manera coordinada.',
    category: 'Formació',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    tags: ['Formació', 'RRHH', 'Desenvolupament'],
    requestedBy: 'Anna García',
    requestedByDepartment: 'Recursos Humans',
    requestDate: '2025-10-10T09:45:00Z',
    status: 'approved' as const,
    adminNotes: 'Sol·licitud aprovada. Grup molt necessari per millorar la coordinació formativa.'
  },
  {
    id: 4,
    name: 'Gaming Empleats Públics',
    description: 'Grup informal per empleats interessats en videojocs i activitats lúdiques.',
    purpose: 'Crear un espai de lleure i desconnexió per als empleats. Organitzar tornejos i activitats de gaming per fomentar les relacions interpersonals fora de l\'àmbit laboral.',
    category: 'Lleure',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop',
    tags: ['Gaming', 'Lleure', 'Tornejos'],
    requestedBy: 'David López',
    requestedByDepartment: 'Departament d\'Informàtica',
    requestDate: '2025-10-09T16:20:00Z',
    status: 'rejected' as const,
    adminNotes: 'No s\'ajusta als objectius professionals de la plataforma. Recomanem utilitzar canals informals externs.'
  }
];

export default function GroupRequestsPage() {
  const [requests, setRequests] = useState(sampleRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<typeof sampleRequests[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fff3cd', border: '#f59e0b', text: '#d97706' };
      case 'approved': return { bg: '#d1f2eb', border: '#10b981', text: '#047857' };
      case 'rejected': return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' };
      default: return { bg: '#f8f9fa', border: '#6c757d', text: '#495057' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendent';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rebutjada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'approved' as const, adminNotes: adminNote }
          : req
      ));

      showNotification('success', `Sol·licitud "${selectedRequest.name}" aprovada correctament`);
      showNotification('success', `📧 Notificació enviada a ${selectedRequest.requestedBy}: La teva sol·licitud ha estat aprovada`);

      setSelectedRequest(null);
      setAdminNote('');

    } catch (error) {
      showNotification('error', 'Error al aprovar la sol·licitud');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'rejected' as const, adminNotes: adminNote }
          : req
      ));

      showNotification('warning', `Sol·licitud "${selectedRequest.name}" rebutjada`);
      showNotification('info', `📧 Notificació enviada a ${selectedRequest.requestedBy}: La teva sol·licitud ha estat rebutjada`);

      setSelectedRequest(null);
      setAdminNote('');

    } catch (error) {
      showNotification('error', 'Error al rebutjar la sol·licitud');
    } finally {
      setIsProcessing(false);
    }
  };

  const statsData = [
    { label: 'Sol·licituds Pendents', value: requests.filter(r => r.status === 'pending').length.toString(), trend: '+2' },
    { label: 'Aprovades Aquest Mes', value: requests.filter(r => r.status === 'approved').length.toString(), trend: '+5' },
    { label: 'Temps Mitjà Revisió', value: '1.8 dies', trend: '-0.3d' },
    { label: 'Taxa d\'Aprovació', value: '78%', trend: '+5%' }
  ];

  return (
    <PageTemplate
      title="Gestió de Sol·licituds de Grups"
      subtitle="Revisar i gestionar les sol·licituds de creació de nous grups"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Filtros */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Filtrar per estat:
            </span>
            {([
              { key: 'all', label: 'Totes' },
              { key: 'pending', label: 'Pendents' },
              { key: 'approved', label: 'Aprovades' },
              { key: 'rejected', label: 'Rebutjades' }
            ] as const).map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: filter === filterOption.key ? '#3b82f6' : 'transparent',
                  color: filter === filterOption.key ? 'white' : '#6c757d',
                  border: `2px solid ${filter === filterOption.key ? '#3b82f6' : '#e9ecef'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {filterOption.label} ({requests.filter(r => filterOption.key === 'all' || r.status === filterOption.key).length})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de solicitudes */}
        {filteredRequests.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedRequest ? '1fr 400px' : '1fr',
            gap: '24px'
          }}>
            {/* Columna principal - Lista de solicitudes */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {filteredRequests.map((request) => {
                const statusInfo = getStatusColor(request.status);

                return (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: selectedRequest?.id === request.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                      border: selectedRequest?.id === request.id ? '2px solid #3b82f6' : '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          margin: '0 0 4px 0'
                        }}>
                          {request.name}
                        </h3>
                        <div style={{
                          fontSize: '13px',
                          color: '#6c757d'
                        }}>
                          Sol·licitada per <strong>{request.requestedBy}</strong> • {request.requestedByDepartment}
                        </div>
                      </div>

                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: statusInfo.bg,
                        border: `1px solid ${statusInfo.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: statusInfo.text
                      }}>
                        {getStatusText(request.status)}
                      </div>
                    </div>

                    {/* Descripción */}
                    <p style={{
                      fontSize: '14px',
                      color: '#2c3e50',
                      lineHeight: '1.4',
                      margin: '0 0 12px 0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {request.description}
                    </p>

                    {/* Metadatos */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#8e8e93'
                    }}>
                      <span>📅 {formatDate(request.requestDate)}</span>
                      <span>🏷️ {request.category}</span>
                      <span>🏷️ {request.tags.join(', ')}</span>
                    </div>

                    {/* Notas del admin (solo si hay) */}
                    {request.adminNotes && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        borderLeft: '3px solid #6c757d'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6c757d',
                          marginBottom: '2px'
                        }}>
                          Notes de l'administrador:
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#2c3e50'
                        }}>
                          {request.adminNotes}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Panel lateral - Detalles de la solicitud seleccionada */}
            {selectedRequest && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                height: 'fit-content',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    margin: 0
                  }}>
                    Detalls de la sol·licitud
                  </h4>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: '#6c757d'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Imagen de portada */}
                {selectedRequest.coverImage && (
                  <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={selectedRequest.coverImage}
                      alt="Cover"
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                {/* Información detallada */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6c757d',
                    marginBottom: '4px'
                  }}>
                    Descripció
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    lineHeight: '1.4',
                    marginBottom: '12px'
                  }}>
                    {selectedRequest.description}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6c757d',
                    marginBottom: '4px'
                  }}>
                    Finalitat
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    lineHeight: '1.4',
                    marginBottom: '12px'
                  }}>
                    {selectedRequest.purpose}
                  </div>
                </div>

                {/* Tags */}
                {selectedRequest.tags.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6c757d',
                      marginBottom: '8px'
                    }}>
                      Etiquetes
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {selectedRequest.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f0f7ff',
                            color: '#3b82f6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solo mostrar controles si está pendiente */}
                {selectedRequest.status === 'pending' && (
                  <>
                    {/* Nota del administrador */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6c757d',
                        marginBottom: '6px'
                      }}>
                        Notes de l'administrador (opcional)
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Afegeix notes sobre la decisió..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Botones de acción */}
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isProcessing ? 'Processant...' : '✅ Aprovar'}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          backgroundColor: isProcessing ? '#9ca3af' : 'transparent',
                          color: isProcessing ? 'white' : '#ef4444',
                          border: `2px solid ${isProcessing ? '#9ca3af' : '#ef4444'}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isProcessing ? 'Processant...' : '❌ Rebutjar'}
                      </button>
                    </div>
                  </>
                )}

                {/* Mostrar estado si no está pendiente */}
                {selectedRequest.status !== 'pending' && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: getStatusColor(selectedRequest.status).bg,
                    border: `1px solid ${getStatusColor(selectedRequest.status).border}`,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: getStatusColor(selectedRequest.status).text
                    }}>
                      Sol·licitud {getStatusText(selectedRequest.status).toLowerCase()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px dashed #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              No hi ha sol·licituds {filter !== 'all' ? getStatusText(filter).toLowerCase() + 's' : ''}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#8e8e93',
              margin: 0
            }}>
              {filter === 'pending'
                ? 'No hi ha sol·licituds pendents de revisió'
                : filter === 'all'
                ? 'No s\'han rebut sol·licituds encara'
                : `No hi ha sol·licituds ${getStatusText(filter).toLowerCase()}s`
              }
            </p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}