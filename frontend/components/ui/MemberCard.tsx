'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
  department: string;
  location: string;
  administration: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
  avatar: string;
  coverImage: string;
  isOnline: boolean;
  lastActive: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'expired' | 'rejected';
  connectionRequestDate?: string; // Fecha de la solicitud
  connectionExpiresAt?: string; // Fecha de expiración
  lastConnectionUpdate?: string; // Última actualización del estado
  bio: string;
}

interface MemberCardProps {
  member: Member;
  viewMode: 'grid' | 'list';
}

export function MemberCard({ member, viewMode }: MemberCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [currentMember, setCurrentMember] = useState(member);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Función para obtener iniciales del avatar
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Función para calcular días restantes
  const getDaysRemaining = (expirationDate: string) => {
    const now = new Date();
    const expires = new Date(expirationDate);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Función para verificar si una solicitud ha expirado
  const isRequestExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date() > new Date(expirationDate);
  };

  // Función para crear fecha de expiración (15 días desde ahora)
  const createExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString();
  };

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    // Aquí se podría integrar con un sistema de notificaciones real
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      // Simular llamada API para enviar solicitud
      await new Promise(resolve => setTimeout(resolve, 1500));

      const requestDate = new Date().toISOString();
      const expirationDate = createExpirationDate();

      // Actualizar estado: enviamos solicitud de conexión
      setCurrentMember(prev => ({
        ...prev,
        connectionStatus: 'pending_sent',
        connectionRequestDate: requestDate,
        connectionExpiresAt: expirationDate,
        lastConnectionUpdate: requestDate
      }));

      // Mostrar feedback de solicitud enviada
      showNotification('info', `Sol·licitud enviada a ${currentMember.name}. Expira en 15 dies.`);

      // Simular notificación al usuario destinatario
      showNotification('success', `📧 Notificació enviada a ${currentMember.name}: Sol·licitud de connexió rebuda`);

      // Programar verificación de expiración (simulado)
      setTimeout(() => {
        checkForExpiredRequest();
      }, 5000); // En producción sería 15 días

    } catch (error) {
      showNotification('error', 'Error al enviar sol·licitud de connexió');
      console.error('Error al enviar sol·licitud de connexió:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Función para verificar solicitudes expiradas
  const checkForExpiredRequest = () => {
    if (currentMember.connectionStatus === 'pending_sent' &&
        currentMember.connectionExpiresAt &&
        isRequestExpired(currentMember.connectionExpiresAt)) {

      setCurrentMember(prev => ({
        ...prev,
        connectionStatus: 'expired',
        lastConnectionUpdate: new Date().toISOString()
      }));

      showNotification('warning',
        `La sol·licitud a ${currentMember.name} ha expirat després de 15 dies sense resposta`);

      // Auto-reset después de mostrar el mensaje de expiración
      setTimeout(() => {
        handleExpiredReset();
      }, 3000);
    }
  };

  // Función para resetear después de expiración
  const handleExpiredReset = () => {
    setCurrentMember(prev => ({
      ...prev,
      connectionStatus: 'none',
      connectionRequestDate: undefined,
      connectionExpiresAt: undefined,
      lastConnectionUpdate: new Date().toISOString()
    }));

    showNotification('info', `Estat restablert amb ${currentMember.name}. Pots enviar una nova sol·licitud.`);
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      // Simular llamada API para cancelar solicitud
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Volver al estado inicial
      setCurrentMember(prev => ({
        ...prev,
        connectionStatus: 'none'
      }));

      console.log(`Sol·licitud de connexió cancel·lada a ${currentMember.name}`);

    } catch (error) {
      console.error('Error al cancel·lar sol·licitud:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      // Simular aceptar solicitud
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Establecer conexión
      setCurrentMember(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected',
        mutualConnections: prev.mutualConnections + 1,
        connectionRequestDate: undefined,
        connectionExpiresAt: undefined,
        lastConnectionUpdate: new Date().toISOString()
      }));

      // Notificar al usuario que aceptó
      showNotification('success', `T'has connectat amb ${currentMember.name}`);

      // Notificar al solicitante (simulado)
      showNotification('success', `📧 ${currentMember.name} ha acceptat la teva sol·licitud de connexió! Ara podeu enviar-vos missatges.`);

    } catch (error) {
      showNotification('error', 'Error al acceptar connexió');
      console.error('Error al acceptar connexió:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRejectRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      // Simular rechazar solicitud
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cambiar a estado rechazado temporalmente, luego resetear
      setCurrentMember(prev => ({
        ...prev,
        connectionStatus: 'rejected',
        connectionRequestDate: undefined,
        connectionExpiresAt: undefined,
        lastConnectionUpdate: new Date().toISOString()
      }));

      // Notificar al usuario que rechazó
      showNotification('info', `Has rebutjat la sol·licitud de ${currentMember.name}`);

      // Notificar al solicitante (simulado)
      showNotification('warning', `📧 ${currentMember.name} ha rebutjat la teva sol·licitud de connexió.`);

      // Auto-reset después de 3 segundos
      setTimeout(() => {
        setCurrentMember(prev => ({
          ...prev,
          connectionStatus: 'none'
        }));
      }, 3000);

    } catch (error) {
      showNotification('error', 'Error al rebutjar connexió');
      console.error('Error al rebutjar connexió:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      // Simular desconexión
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Desconectar
      setCurrentMember(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'none',
        mutualConnections: Math.max(0, prev.mutualConnections - 1)
      }));

      console.log(`T'has desconnectat de ${currentMember.name}`);

    } catch (error) {
      console.error('Error al desconnectar:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Solo permitir mensajes entre usuarios conectados
    if (currentMember.connectionStatus === 'connected' && currentMember.isConnected) {
      setShowMessageModal(true);
    } else {
      console.log('No pots enviar missatges a usuaris amb els que no estàs connectat');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSendingMessage(true);

    try {
      // Simular envío de mensaje
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`Missatge enviat a ${currentMember.name}:`, messageText);

      // Cerrar modal y limpiar
      setShowMessageModal(false);
      setMessageText('');

      // Opcional: redirigir a chat
      // router.push(`/dashboard/missatges?user=${currentMember.username}`);

    } catch (error) {
      console.error('Error al enviar missatge:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleViewProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/dashboard/membres/${currentMember.username}`);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewProfile}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease-in-out',
          marginBottom: '12px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Avatar con estado online */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentMember.avatar ? (
                <img
                  src={currentMember.avatar}
                  alt={currentMember.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {getAvatarInitials(currentMember.name)}
                  </span>
                </div>
              )}
            </div>
            {currentMember.isOnline && (
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '16px',
                height: '16px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid #fff'
              }} />
            )}
          </div>

          {/* Información del miembro */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              {member.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '4px'
            }}>
              {member.role} • {member.department}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#8e8e93',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>{currentMember.location}</span>
              {currentMember.mutualConnections > 0 && (
                <span>{currentMember.mutualConnections} connexions mútues</span>
              )}
              <span>{currentMember.isOnline ? 'En línia' : `Actiu ${currentMember.lastActive}`}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Botones basados en connectionStatus */}
            {currentMember.connectionStatus === 'connected' ? (
              <>
                <button
                  onClick={handleMessage}
                  disabled={isSendingMessage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isSendingMessage ? '#e5e7eb' : 'transparent',
                    color: isSendingMessage ? '#9ca3af' : '#3b82f6',
                    border: `2px solid ${isSendingMessage ? '#e5e7eb' : '#3b82f6'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isSendingMessage ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSendingMessage) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSendingMessage) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#3b82f6';
                    }
                  }}
                >
                  {isSendingMessage ? '...' : 'Enviar missatge'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isConnecting ? 'Desconnectant...' : 'Desconnectar'}
                </button>
              </>
            ) : currentMember.connectionStatus === 'pending_sent' ? (
              <>
                <button
                  onClick={handleCancelRequest}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={currentMember.connectionExpiresAt ?
                    `Expira en ${getDaysRemaining(currentMember.connectionExpiresAt)} dies` :
                    'Sol·licitud pendent'}
                >
                  {isConnecting ? 'Cancel·lant...' :
                   currentMember.connectionExpiresAt ?
                   `Pendent (${getDaysRemaining(currentMember.connectionExpiresAt)}d)` :
                   'Connexió demanada'}
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Veure perfil
                </button>
              </>
            ) : currentMember.connectionStatus === 'expired' ? (
              <>
                <button
                  onClick={() => {
                    showNotification('info', 'Sol·licitud expirada. Restablint estat...');
                    handleExpiredReset();
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Sol·licitud expirada
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Veure perfil
                </button>
              </>
            ) : currentMember.connectionStatus === 'rejected' ? (
              <>
                <button
                  disabled
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }}
                >
                  Sol·licitud rebutjada
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Veure perfil
                </button>
              </>
            ) : currentMember.connectionStatus === 'pending_received' ? (
              <>
                <button
                  onClick={handleAcceptRequest}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isConnecting ? 'Acceptant...' : 'Acceptar'}
                </button>
                <button
                  onClick={handleRejectRequest}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isConnecting ? '#e5e7eb' : 'transparent',
                    color: isConnecting ? '#9ca3af' : '#dc3545',
                    border: `2px solid ${isConnecting ? '#e5e7eb' : '#dc3545'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isConnecting ? 'Rebutjant...' : 'Rebutjar'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isConnecting) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isConnecting) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {isConnecting ? 'Enviant sol·licitud...' : 'Connectar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#e9ecef';
                  }}
                >
                  Veure perfil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid (por defecto)
  return (
    <div
      onClick={handleViewProfile}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div style={{
        height: '80px',
        backgroundImage: `url(${member.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay para mejor legibilidad */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)'
        }} />
      </div>

      {/* Avatar superpuesto */}
      <div style={{
        position: 'relative',
        marginTop: '-30px',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            margin: '0 auto',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentMember.avatar ? (
              <img
                src={currentMember.avatar}
                alt={currentMember.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {getAvatarInitials(currentMember.name)}
                </span>
              </div>
            )}
          </div>
          {currentMember.isOnline && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          )}
        </div>
      </div>

      {/* Contenido del perfil */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        {/* Nombre y rol */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0 0 4px 0',
            lineHeight: '1.2'
          }}>
            {currentMember.name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#6c757d',
            margin: '0 0 2px 0'
          }}>
            {currentMember.role}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#8e8e93',
            margin: 0
          }}>
            {currentMember.department}
          </p>
        </div>

        {/* Bio */}
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          lineHeight: '1.4',
          marginBottom: '12px',
          textAlign: 'center',
          height: '32px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {currentMember.bio}
        </div>

        {/* Información adicional */}
        <div style={{
          fontSize: '11px',
          color: '#8e8e93',
          textAlign: 'center',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span>{currentMember.location}</span>
          {currentMember.mutualConnections > 0 && (
            <span>{currentMember.mutualConnections} mútues</span>
          )}
        </div>

        {/* Estado y última actividad */}
        <div style={{
          fontSize: '11px',
          color: currentMember.isOnline ? '#10b981' : '#8e8e93',
          textAlign: 'center',
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          {currentMember.isOnline ? '🟢 En línia ara' : `Actiu ${currentMember.lastActive}`}
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {/* Botones Grid basados en connectionStatus */}
          {currentMember.connectionStatus === 'connected' ? (
            <>
              <button
                onClick={handleMessage}
                disabled={isSendingMessage}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: isSendingMessage ? '#e5e7eb' : 'transparent',
                  color: isSendingMessage ? '#9ca3af' : '#3b82f6',
                  border: `2px solid ${isSendingMessage ? '#e5e7eb' : '#3b82f6'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isSendingMessage ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSendingMessage) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSendingMessage) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#3b82f6';
                  }
                }}
              >
                {isSendingMessage ? '...' : 'Missatge'}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isConnecting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: isConnecting ? '#9ca3af' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isConnecting ? 'Desconnectant...' : 'Desconnectar'}
              </button>
            </>
          ) : currentMember.connectionStatus === 'pending_sent' ? (
            <>
              <button
                onClick={handleCancelRequest}
                disabled={isConnecting}
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: isConnecting ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                title={currentMember.connectionExpiresAt ?
                  `Expira en ${getDaysRemaining(currentMember.connectionExpiresAt)} dies` :
                  'Sol·licitud pendent'}
              >
                {isConnecting ? 'Cancel·lant...' :
                 currentMember.connectionExpiresAt ?
                 `Pendent (${getDaysRemaining(currentMember.connectionExpiresAt)}d)` :
                 'Demanda enviada'}
              </button>
              <button
                onClick={handleViewProfile}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Perfil
              </button>
            </>
          ) : currentMember.connectionStatus === 'pending_received' ? (
            <>
              <button
                onClick={handleAcceptRequest}
                disabled={isConnecting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: isConnecting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isConnecting ? 'Acceptant...' : 'Acceptar'}
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={isConnecting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: isConnecting ? '#e5e7eb' : 'transparent',
                  color: isConnecting ? '#9ca3af' : '#dc3545',
                  border: `2px solid ${isConnecting ? '#e5e7eb' : '#dc3545'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isConnecting ? 'Rebutjant...' : 'Rebutjar'}
              </button>
            </>
          ) : currentMember.connectionStatus === 'expired' ? (
            <>
              <button
                onClick={() => {
                  showNotification('info', 'Sol·licitud expirada. Restablint estat...');
                  handleExpiredReset();
                }}
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Expirada
              </button>
              <button
                onClick={handleViewProfile}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Perfil
              </button>
            </>
          ) : currentMember.connectionStatus === 'rejected' ? (
            <>
              <button
                disabled
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              >
                Rebutjada
              </button>
              <button
                onClick={handleViewProfile}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Perfil
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: isConnecting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {isConnecting ? 'Enviant...' : 'Connectar'}
              </button>
              <button
                onClick={handleViewProfile}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e9ecef';
                }}
              >
                Perfil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Modal de mensaje
  if (showMessageModal) {
    return (
      <>
        {/* Renderizar la tarjeta normal */}
        {viewMode === 'list' ? (
          <div
            onClick={handleViewProfile}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '12px',
              border: '1px solid #f0f0f0'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Contenido de lista simplificado para evitar duplicación */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Vista de lista con modal activo</p>
            </div>
          </div>
        ) : (
          <div
            onClick={handleViewProfile}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              border: '1px solid #f0f0f0'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Contenido de grid simplificado para evitar duplicación */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Vista de grid con modal activo</p>
            </div>
          </div>
        )}

        {/* Modal overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowMessageModal(false)}
        >
          {/* Modal content */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Enviar missatge a {currentMember.name}
            </h3>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escriu el teu missatge..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowMessageModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel·lar
              </button>
              <button
                onClick={sendMessage}
                disabled={isSendingMessage || !messageText.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isSendingMessage || !messageText.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSendingMessage || !messageText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isSendingMessage ? 'Enviant...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}