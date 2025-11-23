'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, RefreshCw, Info, MapPin, Globe, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type LeadSourceType =
  | 'GOOGLE_MAPS'
  | 'WEB_SCRAPING'
  | 'API_INTEGRATION'
  | 'LINKEDIN'
  | 'CSV_IMPORT'
  | 'CUSTOM';

interface LeadSource {
  id: string;
  name: string;
  type: LeadSourceType;
  config: any;
}

interface TestResult {
  success: boolean;
  duration?: number;
  resultsFound?: number;
  sampleResults?: Array<{
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    category?: string;
    rating?: number;
  }>;
  error?: string;
  warnings?: string[];
}

interface SourceTestDialogProps {
  open: boolean;
  onClose: () => void;
  source: LeadSource | null;
}

export default function SourceTestDialog({
  open,
  onClose,
  source,
}: SourceTestDialogProps) {
  const [isIdle, setIsIdle] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const getTypeConfig = (type: LeadSourceType) => {
    const configs = {
      'GOOGLE_MAPS': {
        icon: MapPin,
        color: 'text-blue-600 bg-blue-100',
        label: 'Google Maps',
      },
      'WEB_SCRAPING': {
        icon: Globe,
        color: 'text-purple-600 bg-purple-100',
        label: 'Web Scraping',
      },
      'API_INTEGRATION': {
        icon: Globe,
        color: 'text-green-600 bg-green-100',
        label: 'Integració API',
      },
      'LINKEDIN': {
        icon: Globe,
        color: 'text-blue-600 bg-blue-100',
        label: 'LinkedIn',
      },
      'CSV_IMPORT': {
        icon: Globe,
        color: 'text-orange-600 bg-orange-100',
        label: 'Importació CSV',
      },
      'CUSTOM': {
        icon: Globe,
        color: 'text-gray-600 bg-gray-100',
        label: 'Personalitzat',
      },
    };
    return configs[type] || configs.CUSTOM;
  };

  const testSource = async () => {
    if (!source) return;

    setIsIdle(false);
    setIsTesting(true);
    setTestResult(null);

    const steps = getTestSteps(source.type);

    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      }

      // Simulate final result processing
      setCurrentStep('Processant resultats...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock random success/failure (75% success rate)
      const success = Math.random() > 0.25;

      if (success) {
        const result = generateSuccessResult(source);
        setTestResult(result);

        toast({
          title: 'Test exitós',
          description: `S'han trobat ${result.resultsFound} resultats de mostra`,
        });
      } else {
        const result = generateErrorResult(source);
        setTestResult(result);

        toast({
          title: 'Error en el test',
          description: 'No s\'ha pogut completar la prova',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Error de connexió inesperada',
      });

      toast({
        title: 'Error de connexió',
        description: 'No s\'ha pogut completar el test',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
      setCurrentStep('');
    }
  };

  const getTestSteps = (type: LeadSourceType): string[] => {
    switch (type) {
      case 'GOOGLE_MAPS':
        return [
          'Validant configuració de Google Maps...',
          'Establint connexió amb l\'API...',
          'Executant cerca de prova...',
          'Descarregant dades de mostra...',
        ];
      case 'WEB_SCRAPING':
        return [
          'Verificant URL objectiu...',
          'Analitzant estructura HTML...',
          'Provant selectors CSS...',
          'Extraient dades de mostra...',
        ];
      case 'API_INTEGRATION':
        return [
          'Validant credencials API...',
          'Testejant endpoint...',
          'Verificant format de resposta...',
          'Descarregant dades de mostra...',
        ];
      default:
        return [
          'Validant configuració...',
          'Establint connexió...',
          'Executant test de prova...',
          'Processant resultats...',
        ];
    }
  };

  const generateSuccessResult = (source: LeadSource): TestResult => {
    const sampleData = {
      'GOOGLE_MAPS': [
        {
          name: 'Restaurant El Molí',
          address: 'Carrer Major 15, 08002 Barcelona',
          phone: '+34 93 123 4567',
          website: 'www.elmoli.cat',
          category: 'Restaurant',
          rating: 4.3,
        },
        {
          name: 'Botiga de Moda Luna',
          address: 'Passeig de Gràcia 85, 08008 Barcelona',
          phone: '+34 93 987 6543',
          website: 'www.modaluna.com',
          category: 'Moda',
          rating: 4.7,
        },
        {
          name: 'Consultoria TechSol',
          address: 'Avinguda Diagonal 123, 08009 Barcelona',
          phone: '+34 93 456 7890',
          website: 'www.techsol.es',
          category: 'Serveis',
          rating: 4.1,
        },
      ],
      'WEB_SCRAPING': [
        {
          name: 'Empresa ABC S.L.',
          address: 'Carrer de la Pau 45, 28001 Madrid',
          phone: '+34 91 234 5678',
          website: 'www.abc-sl.com',
          category: 'Tecnologia',
        },
        {
          name: 'Constructora Nord',
          address: 'Avinguda del Mar 67, 17001 Girona',
          phone: '+34 972 123 456',
          website: 'www.constructora-nord.cat',
          category: 'Construcció',
        },
      ],
    };

    const results = sampleData[source.type as keyof typeof sampleData] || sampleData.WEB_SCRAPING;
    const warnings = [];

    // Add realistic warnings
    if (source.type === 'GOOGLE_MAPS' && Math.random() > 0.6) {
      warnings.push('Alguns resultats poden estar duplicats');
    }
    if (source.type === 'WEB_SCRAPING' && Math.random() > 0.7) {
      warnings.push('La pàgina web pot tenir mesures anti-bot');
    }

    return {
      success: true,
      duration: Math.floor(2000 + Math.random() * 4000),
      resultsFound: Math.floor(15 + Math.random() * 85),
      sampleResults: results,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  };

  const generateErrorResult = (source: LeadSource): TestResult => {
    const errorMessages = {
      'GOOGLE_MAPS': [
        'API key de Google Maps incorrecta o sense permisos',
        'Quota diària de l\'API excedida',
        'La ubicació especificada no es vàlida',
        'El tipus de cerca no és compatible',
      ],
      'WEB_SCRAPING': [
        'No s\'ha pogut accedir a la URL especificada',
        'Els selectors CSS no han trobat elements',
        'La pàgina web bloqueja requests automàtics',
        'Estructura HTML canviada, cal revisar selectors',
      ],
      'API_INTEGRATION': [
        'Credencials d\'API incorrectes',
        'Endpoint no accessible o deprecated',
        'Rate limit excedit',
        'Format de resposta no reconegut',
      ],
    };

    const errors = errorMessages[source.type as keyof typeof errorMessages] || errorMessages.WEB_SCRAPING;

    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  };

  const handleRepeatTest = () => {
    setTestResult(null);
    setIsIdle(true);
  };

  const handleClose = () => {
    setIsIdle(true);
    setIsTesting(false);
    setTestResult(null);
    setCurrentStep('');
    onClose();
  };

  if (!open || !source) return null;

  const typeConfig = getTypeConfig(source.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Test de Font - {source.name}
              </h2>
              <p className="text-sm text-gray-500">{typeConfig.label}</p>
            </div>
          </div>
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
                  Fes clic a "Iniciar Test" per provar la configuració de <strong>{source.name}</strong>
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Aquest test farà:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {getTestSteps(source.type).map((step, index) => (
                      <li key={index}>• {step.replace('...', '')}</li>
                    ))}
                    <li>• Retornarà una mostra de resultats</li>
                  </ul>
                </div>

                {/* Show current config */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Configuració actual:</h4>
                  <div className="space-y-1 text-sm">
                    {source.type === 'GOOGLE_MAPS' && (
                      <>
                        <div><span className="text-blue-700">Query:</span> <code className="bg-blue-100 px-1 rounded">{source.config?.query || 'N/A'}</code></div>
                        <div><span className="text-blue-700">Ubicació:</span> <code className="bg-blue-100 px-1 rounded">{source.config?.location || 'N/A'}</code></div>
                        <div><span className="text-blue-700">Radi:</span> <code className="bg-blue-100 px-1 rounded">{source.config?.radius || 'N/A'}km</code></div>
                      </>
                    )}
                    {source.type === 'WEB_SCRAPING' && (
                      <>
                        <div><span className="text-blue-700">URL:</span> <code className="bg-blue-100 px-1 rounded text-xs">{source.config?.url || 'N/A'}</code></div>
                        <div><span className="text-blue-700">Container:</span> <code className="bg-blue-100 px-1 rounded">{source.config?.selectors?.container || 'N/A'}</code></div>
                      </>
                    )}
                  </div>
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
                  Executant test...
                </p>
                <p className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {currentStep || 'Preparant test...'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700">
                  ⏱️ Aquest procés pot trigar entre 5-15 segons
                </div>
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
                  ✅ Test completat exitosament!
                </h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                  📊 Resultats del test:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-700">Durada:</span>
                      <span className="font-medium text-green-900">{testResult.duration}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Resultats trobats:</span>
                      <span className="font-medium text-green-900">{testResult.resultsFound}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {testResult.warnings && testResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    ⚠️ Advertències:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {testResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Results */}
              {testResult.sampleResults && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">
                    📄 Mostra de resultats ({testResult.sampleResults.length} de {testResult.resultsFound}):
                  </h4>
                  <div className="space-y-3">
                    {testResult.sampleResults.map((result, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900 mb-1">{result.name}</div>
                        {result.address && (
                          <div className="text-sm text-gray-600 mb-1">{result.address}</div>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {result.phone && <span>📞 {result.phone}</span>}
                          {result.website && <span>🌐 {result.website}</span>}
                          {result.category && <span>🏷️ {result.category}</span>}
                          {result.rating && <span>⭐ {result.rating}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  ❌ Error en el test
                </h3>
                <p className="text-gray-600">
                  No s'ha pogut completar la prova de {source.name}
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
                  Possibles solucions:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Revisa la configuració de la font</li>
                  <li>• Comprova les credencials d'accés</li>
                  <li>• Verifica la connectivitat de xarxa</li>
                  <li>• Consulta els logs per més detalls</li>
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
                onClick={testSource}
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