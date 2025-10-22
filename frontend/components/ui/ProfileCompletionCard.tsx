'use client';

import { useRouter } from 'next/navigation';

interface ProfileItem {
  label: string;
  completed: boolean;
  count: string;
}

export function ProfileCompletionCard() {
  const router = useRouter();

  const profileItems: ProfileItem[] = [
    { label: 'Informació general', completed: false, count: '4/6' },
    { label: 'Experiència laboral', completed: false, count: '0/3' },
    { label: 'Foto de perfil', completed: true, count: '1/1' },
    { label: 'Foto de portada', completed: true, count: '1/1' },
    { label: 'Xarxes socials', completed: false, count: '0/1' },
  ];

  const completedItems = profileItems.filter(item => item.completed).length;
  const totalItems = profileItems.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  const handleCompleteProfile = () => {
    router.push('/dashboard/perfil');
  };

  // SVG Circle Progress
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#2c3e50',
        textAlign: 'center'
      }}>
        Completa el teu Perfil
      </h3>

      {/* Progress Circle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
          <svg
            width="90"
            height="90"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#e9ecef"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#10b981"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out',
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {completionPercentage}%
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '13px',
          color: '#6c757d',
          marginTop: '8px'
        }}>
          Completat
        </div>
      </div>

      {/* Profile Items List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {profileItems.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: item.completed ? 'none' : '2px solid #dee2e6',
              backgroundColor: item.completed ? '#10b981' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {item.completed && (
                <span style={{ color: 'white', fontSize: '11px' }}>✓</span>
              )}
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                color: item.completed ? '#6c757d' : '#2c3e50',
                textDecoration: item.completed ? 'line-through' : 'none'
              }}>
                {item.label}
              </span>
              <span style={{
                color: item.completed ? '#10b981' : '#6c757d',
                fontWeight: '500',
                fontSize: '12px'
              }}>
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Profile Button */}
      <button
        onClick={handleCompleteProfile}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#fff',
          color: '#2c3e50',
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.borderColor = '#dee2e6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#e9ecef';
        }}
      >
        Completar Perfil
      </button>
    </div>
  );
}