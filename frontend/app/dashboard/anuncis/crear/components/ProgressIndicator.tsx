'use client';

import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      {/* Barra de progreso */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <p className={`mt-2 text-sm text-center ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                  {step}
                </p>
              </div>

              {/* Línea conectora */}
              {stepNumber < totalSteps && (
                <div
                  className={`
                    flex-1 h-1 mx-2 transition-all
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progreso porcentual */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Pas {currentStep} de {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% completat</span>
      </div>
    </div>
  );
};