'use client';

import { useState } from 'react';
import { RefreshCw, Plus, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useLeadSources } from '@/hooks/useLeadSources';
import { LeadSource } from '@/lib/api/leadSources';
import SourceCard from './components/SourceCard';
import SourceFormModal from './components/SourceFormModal';
import SourceTestDialog from './components/SourceTestDialog';

export default function SourcesPage() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<LeadSource | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testSource, setTestSource] = useState<LeadSource | null>(null);

  const { toast } = useToast();

  const {
    sources,
    loading: isLoading,
    error,
    fetchSources,
    createSource,
    updateSource,
    deleteSource,
    testSource: testSourceAPI,
    executeSource,
    toggleSource,
  } = useLeadSources();

  const handleRefresh = async () => {
    try {
      await fetchSources();
      toast({
        title: "Actualitzat",
        description: "Les fonts s'han actualitzat correctament",
      });
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleCreate = () => {
    setSelectedSource(null);
    setFormModalOpen(true);
  };

  const handleEdit = (source: LeadSource) => {
    setSelectedSource(source);
    setFormModalOpen(true);
  };

  const handleToggleActive = async (sourceId: string, isActive: boolean) => {
    try {
      await toggleSource(sourceId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleDelete = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);

    if (!confirm(`Estàs segur que vols eliminar "${source?.name}"?\n\nAixò eliminarà totes les dades associades i no es pot desfer.`)) {
      return;
    }

    try {
      await deleteSource(sourceId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleExecuteNow = async (sourceId: string) => {
    try {
      await executeSource(sourceId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleTest = (source: LeadSource) => {
    setTestSource(source);
    setTestDialogOpen(true);
  };

  const handleSaveSource = async () => {
    await fetchSources();
    setFormModalOpen(false);
    setSelectedSource(null);
  };

  // Calculate stats
  const activeSources = sources.filter(s => s.isActive).length;
  const totalLeads = sources.reduce((sum, s) => sum + s.totalLeads, 0);
  const successfulRuns = sources.reduce((sum, s) => sum + s.successfulRuns, 0);
  const totalRuns = sources.reduce((sum, s) => sum + s.successfulRuns + (s.failedRuns ?? 0), 0);
  const overallSuccessRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

  // Get next execution
  const getNextExecution = () => {
    const activeSources = sources.filter(s => s.isActive && s.nextRunAt);
    if (activeSources.length === 0) return { text: 'Manual', source: null };

    const nextSource = activeSources.sort((a, b) =>
      new Date(a.nextRunAt!).getTime() - new Date(b.nextRunAt!).getTime()
    )[0];

    const now = new Date();
    const nextRun = new Date(nextSource.nextRunAt!);
    const diffMs = nextRun.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    return {
      text: diffHours > 0 ? `En ${diffHours}h` : 'Ara',
      source: nextSource.name,
    };
  };

  const nextExecution = getNextExecution();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fonts de Scraping
            </h1>
            <p className="text-gray-600">
              Configura d'on obtenir leads automàticament
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualitzar
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Font
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Sources */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">
                  Fonts Actives
                </p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-green-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">
                    {activeSources}
                  </p>
                )}
                <p className="text-sm text-green-600">
                  de {sources.length} totals
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads This Month */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Leads Aquest Mes
                </p>
                {isLoading ? (
                  <div className="h-8 w-20 bg-blue-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">
                    {totalLeads.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-blue-600">
                  taxa d'èxit: {overallSuccessRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Execution */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Pròxima Execució
                </p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-purple-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-purple-900">
                    {nextExecution.text}
                  </p>
                )}
                <p className="text-sm text-purple-600">
                  {nextExecution.source || 'Cap font programada'}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sources Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {sources.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="py-12">
                <div className="text-center">
                  <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hi ha fonts de scraping
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Comença creant la teva primera font de scraping per generar leads automàticament
                  </p>
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Primera Font
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onExecuteNow={handleExecuteNow}
                  onTest={handleTest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <SourceFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedSource(null);
        }}
        source={selectedSource}
        onSave={handleSaveSource}
      />

      <SourceTestDialog
        open={testDialogOpen}
        onClose={() => {
          setTestDialogOpen(false);
          setTestSource(null);
        }}
        source={testSource}
      />
    </div>
  );
}