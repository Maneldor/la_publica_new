'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">
          Pas {currentStep} de {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% completat
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`
                text-center p-2 rounded-lg transition-all
                ${isCompleted
                  ? 'bg-green-100 text-green-800'
                  : isCurrent
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                    : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              <div className={`
                w-6 h-6 mx-auto mb-1 rounded-full flex items-center justify-center text-xs font-bold
                ${isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }
              `}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div className="font-medium leading-tight">
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};