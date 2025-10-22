'use client';

import { useState } from 'react';
import { X, Building2, Video, Phone, Mail, AlertCircle } from 'lucide-react';
// Unused: Calendar, Clock

interface Modalitat {
  tipus: 'presencial' | 'online' | 'telefonica' | 'email';
  activa: boolean;
  config: any;
}

interface BookingModalProps {
  assessorament: {
    titol: string;
    empresa: { nom: string };
    modalitats: Modalitat[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ assessorament, isOpen, onClose }: BookingModalProps) {
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telefon: '',
    organisme: '',
    data: '',
    hora: '',
    consultaText: '',
    adjunts: [] as File[]
  });
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isOpen) return null;

  const modalitatsActives = assessorament.modalitats.filter(m => m.activa);

  const getModalityIcon = (tipus: string) => {
    switch (tipus) {
      case 'presencial': return Building2;
      case 'online': return Video;
      case 'telefonica': return Phone;
      case 'email': return Mail;
      default: return Building2;
    }
  };

  const getModalityLabel = (tipus: string) => {
    switch (tipus) {
      case 'presencial': return 'Presencial';
      case 'online': return 'Online (Videoconferència)';
      case 'telefonica': return 'Telefònica';
      case 'email': return 'Correu electrònic';
      default: return tipus;
    }
  };

  const getModalityDescription = (modalitat: Modalitat) => {
    switch (modalitat.tipus) {
      case 'presencial':
        return `${modalitat.config.adreca} - Durada: ${modalitat.config.duracio_min} min`;
      case 'online':
        return `Rebràs link per email - Durada: ${modalitat.config.duracio_min} min`;
      case 'telefonica':
        return `Et trucarem nosaltres - Durada: ${modalitat.config.duracio_min} min`;
      case 'email':
        return `Resposta en ${modalitat.config.temps_resposta} - No inclou reunió`;
      default:
        return '';
    }
  };

  const needsDateTime = (tipus: string) => {
    return ['presencial', 'online', 'telefonica'].includes(tipus);
  };

  const isEmailModality = (tipus: string) => {
    return tipus === 'email';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí aniria la lògica per enviar la reserva
    console.log('Enviando reserva:', { selectedModality, formData });
    setStep('success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        adjunts: Array.from(e.target.files || [])
      }));
    }
  };

  if (step === 'success') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '500px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '24px'
          }}>
            ✅
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Reserva enviada correctament!
          </h2>

          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            📧 Hem enviat la teva sol·licitud a <strong>{assessorament.empresa.nom}</strong>
          </p>

          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '12px' }}>Què passa ara:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
              <span>1️⃣ Rebràs un email de confirmació en 24h</span>
              <span>2️⃣ L&apos;empresa confirmarà data i hora</span>
              <span>3️⃣ Rebràs les instruccions (adreça o link Zoom)</span>
              <span>4️⃣ El dia de la consulta, l&apos;expert t&apos;atendrà</span>
            </div>
          </div>

          {needsDateTime(selectedModality) && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ fontWeight: '600', color: '#1e40af' }}>
                📅 Data sol·licitada: {formData.data}, {formData.hora}
              </p>
              <p style={{ fontSize: '14px', color: '#1e40af' }}>
                📍 Modalitat: {getModalityLabel(selectedModality)}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Tancar
            </button>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Veure les meves reserves
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            Reservar consulta gratuïta
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Info assessorament */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ fontWeight: '600', color: '#111827' }}>{assessorament.titol}</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{assessorament.empresa.nom}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selecció de modalitat */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              Modalitat preferida: *
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modalitatsActives.map((modalitat) => {
                const Icon = getModalityIcon(modalitat.tipus);
                return (
                  <label
                    key={modalitat.tipus}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      border: selectedModality === modalitat.tipus ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedModality === modalitat.tipus ? '#eff6ff' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="modalitat"
                      value={modalitat.tipus}
                      checked={selectedModality === modalitat.tipus}
                      onChange={(e) => setSelectedModality(e.target.value)}
                      style={{ marginTop: '2px' }}
                    />
                    <Icon style={{ width: '20px', height: '20px', color: '#3b82f6', marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {getModalityLabel(modalitat.tipus)}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {getModalityDescription(modalitat)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dades personals */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Les teves dades:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Nom complet: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Email: *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Telèfon: *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Organisme:
                </label>
                <input
                  type="text"
                  placeholder="Ajuntament de..."
                  value={formData.organisme}
                  onChange={(e) => setFormData(prev => ({ ...prev, organisme: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Secció condicional segons modalitat */}
          {selectedModality && needsDateTime(selectedModality) && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                📅 Programació de la consulta
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Data preferida: *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Hora preferida: *
                  </label>
                  <select
                    required
                    value={formData.hora}
                    onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecciona hora</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    {selectedModality === 'online' && (
                      <>
                        <option value="18:00">18:00</option>
                        <option value="19:00">19:00</option>
                        <option value="20:00">20:00</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Secció per email */}
          {selectedModality && isEmailModality(selectedModality) && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                ✉️ La teva consulta per email
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Explica el teu dubte de forma detallada: *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Explica el teu cas, dubtes o necessitats de forma detallada..."
                  value={formData.consultaText}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultaText: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Adjuntar documents (opcional):
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Màxim 5MB per fitxer. Formats: PDF, DOC, JPG, PNG
                </p>
              </div>
            </div>
          )}

          {/* Consulta general */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Explica breument el teu cas o dubte:
            </label>
            <textarea
              rows={3}
              placeholder="Necessito assessorament sobre..."
              value={formData.consultaText}
              onChange={(e) => setFormData(prev => ({ ...prev, consultaText: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" required style={{ marginTop: '2px' }} />
                <span>He llegit i accepto les condicions del servei</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" required style={{ marginTop: '2px' }} />
                <span>Accepto compartir les meves dades amb l&apos;empresa per a la consulta</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" required style={{ marginTop: '2px' }} />
                <span>Entenc que és una consulta gratuïta sense compromís de contractació</span>
              </label>
            </div>
          </div>

          {/* Botons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={!selectedModality}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedModality ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: selectedModality ? 'pointer' : 'not-allowed'
              }}
            >
              Enviar sol·licitud →
            </button>
          </div>

          {/* Info final */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#eff6ff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#3b82f6', marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
              Rebràs confirmació per email en menys de 24h. L&apos;empresa es posarà en contacte amb tu per confirmar els detalls.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}