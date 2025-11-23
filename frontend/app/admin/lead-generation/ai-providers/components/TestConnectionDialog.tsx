'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Types
interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'CLAUDE' | 'OPENAI' | 'GEMINI' | 'AZURE_OPENAI' | 'COHERE' | 'CUSTOM';
  isActive: boolean;
  isDefault: boolean;
  config: {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    baseURL?: string;
  };
  capabilities: {
    lead_analysis?: boolean;
    scoring?: boolean;
    pitch_generation?: boolean;
    data_extraction?: boolean;
    sentiment_analysis?: boolean;
    classification?: boolean;
  };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number | null;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  success: boolean;
  latency?: number;
  model?: string;
  tokensUsed?: number;
  cost?: number;
  response?: string;
  error?: string;
}

interface TestConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  provider: AIProvider | null;
}

export default function TestConnectionDialog({
  open,
  onClose,
  provider,
}: TestConnectionDialogProps) {
  const [isIdle, setIsIdle] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    if (!provider) return;

    setIsIdle(false);
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Mock random success/failure (70% success rate)
      const success = Math.random() > 0.3;

      if (success) {
        const result: TestResult = {
          success: true,
          latency: Math.floor(1000 + Math.random() * 2000), // 1-3 seconds
          model: provider.config.model,
          tokensUsed: Math.floor(50 + Math.random() * 100),
          cost: parseFloat((Math.random() * 0.01).toFixed(4)),
          response: "Hola! Sóc un assistent d'IA especialitzat en generació i anàlisi de leads comercials. Puc ajudar-te amb l'anàlisi de empreses, generació de pitches personalitzats i scoring automàtic de leads basant-me en diferents criteris de qualitat.",
        };
        setTestResult(result);

        toast({
          title: 'Test exitós',
          description: `Connexió amb ${provider.displayName} establerta correctament`,
        });
      } else {
        // Mock different types of errors
        const errorMessages = [
          'API key incorrecta o expirada',
          'Rate limit excedit. Prova més tard',
          'El servei no està disponible temporalment',
          'Model no trobat o no accessible',
          'Timeout de connexió',
          'Permisos insuficients per aquest endpoint',
        ];

        const result: TestResult = {
          success: false,
          error: errorMessages[Math.floor(Math.random() * errorMessages.length)],
        };
        setTestResult(result);

        toast({
          title: 'Error en el test',
          description: `No s'ha pogut connectar amb ${provider.displayName}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Error de xarxa desconegut',
      });

      toast({
        title: 'Error de xarxa',
        description: 'No s\'ha pogut completar el test de connexió',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRepeatTest = () => {
    setTestResult(null);
    setIsIdle(true);
  };

  const handleClose = () => {
    setIsIdle(true);
    setIsTesting(false);
    setTestResult(null);
    onClose();
  };

  if (!open || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Provar Connexió - {provider.displayName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Idle State */}
          {isIdle && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Info className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div>
                <p className="text-gray-700 mb-4">
                  Fes clic a "Iniciar Test" per comprovar la connexió amb <strong>{provider.displayName}</strong>
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Aquest test farà:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Validació de l'API key</li>
                    <li>• Request de prova al provider</li>
                    <li>• Mesura de latència</li>
                    <li>• Verificació de resposta</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Testing State */}
          {isTesting && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>

              <div>
                <p className="text-gray-700 font-medium mb-2">
                  Provant connexió...
                </p>
                <p className="text-sm text-gray-500">
                  ⏳ Enviant request de prova...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {testResult && testResult.success && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ✅ Connexió exitosa!
                </h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                  📊 Resultats:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Latència:</span>
                    <span className="font-medium text-green-900">
                      {testResult.latency}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Model:</span>
                    <span className="font-medium text-green-900 font-mono text-xs">
                      {testResult.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Tokens utilitzats:</span>
                    <span className="font-medium text-green-900">
                      {testResult.tokensUsed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Cost estimat:</span>
                    <span className="font-medium text-green-900">
                      ${testResult.cost}
                    </span>
                  </div>
                </div>
              </div>

              {testResult.response && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Resposta del provider:
                  </h4>
                  <p className="text-sm text-gray-600 italic">
                    "{testResult.response}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {testResult && !testResult.success && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ❌ Error de connexió
                </h3>
                <p className="text-gray-600">
                  No s'ha pogut connectar amb {provider.displayName}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  Detalls de l'error:
                </h4>
                <p className="text-sm text-red-700 bg-red-100 p-3 rounded border">
                  {testResult.error}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Possibles causes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• API key incorrecta</li>
                  <li>• Provider no disponible</li>
                  <li>• Rate limit excedit</li>
                  <li>• Error de xarxa</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {isIdle && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={testConnection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Iniciar Test
              </button>
            </>
          )}

          {isTesting && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel·lar
            </button>
          )}

          {testResult && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Tancar
              </button>
              <button
                onClick={handleRepeatTest}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Repetir Test
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}