'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  const getStepStyles = (isCompleted: boolean, isCurrent: boolean): React.CSSProperties => {
    if (isCompleted) {
      return {
        backgroundColor: 'var(--ProgressIndicator-completed-bg, #dcfce7)',
        color: 'var(--ProgressIndicator-completed-color, #166534)',
      };
    }
    if (isCurrent) {
      return {
        backgroundColor: 'var(--ProgressIndicator-current-bg, #dbeafe)',
        color: 'var(--ProgressIndicator-current-color, #1e40af)',
        boxShadow: '0 0 0 2px var(--ProgressIndicator-current-ring-color, #3b82f6)',
      };
    }
    return {
      backgroundColor: 'var(--ProgressIndicator-pending-bg, #f3f4f6)',
      color: 'var(--ProgressIndicator-pending-color, #6b7280)',
    };
  };

  const getStepNumberStyles = (isCompleted: boolean, isCurrent: boolean): React.CSSProperties => {
    if (isCompleted) {
      return {
        backgroundColor: 'var(--ProgressIndicator-completed-number-bg, #16a34a)',
        color: 'var(--ProgressIndicator-completed-number-color, #ffffff)',
      };
    }
    if (isCurrent) {
      return {
        backgroundColor: 'var(--ProgressIndicator-current-number-bg, #2563eb)',
        color: 'var(--ProgressIndicator-current-number-color, #ffffff)',
      };
    }
    return {
      backgroundColor: 'var(--ProgressIndicator-pending-number-bg, #d1d5db)',
      color: 'var(--ProgressIndicator-pending-number-color, #4b5563)',
    };
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--ProgressIndicator-title-color, #111827)'
        }}>
          Pas {currentStep} de {totalSteps}
        </span>
        <span style={{
          fontSize: '14px',
          color: 'var(--ProgressIndicator-subtitle-color, #6b7280)'
        }}>
          {Math.round((currentStep / totalSteps) * 100)}% completat
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        backgroundColor: 'var(--ProgressIndicator-track-color, #e5e7eb)',
        borderRadius: '9999px',
        height: '8px',
        marginBottom: '24px'
      }}>
        <div
          style={{
            backgroundColor: 'var(--ProgressIndicator-bar-color, #2563eb)',
            height: '8px',
            borderRadius: '9999px',
            transition: 'all 0.3s',
            width: `${(currentStep / totalSteps) * 100}%`
          }}
        />
      </div>

      {/* Steps List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        fontSize: '12px'
      }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              style={{
                textAlign: 'center',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                ...getStepStyles(isCompleted, isCurrent)
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                margin: '0 auto 4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                ...getStepNumberStyles(isCompleted, isCurrent)
              }}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div style={{ fontWeight: '500', lineHeight: '1.2' }}>
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
