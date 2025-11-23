'use client';

import { Package, Bot, TrendingUp } from 'lucide-react';

interface QueueStatsProps {
  scrapingQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  aiProcessingQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}

export default function QueueStats({
  scrapingQueue,
  aiProcessingQueue,
}: QueueStatsProps) {
  const calculateProgress = (queue: { waiting: number; active: number; completed: number; failed: number }) => {
    const total = queue.waiting + queue.active + queue.completed + queue.failed;
    if (total === 0) return 0;
    return ((queue.completed + queue.failed) / total) * 100;
  };

  const calculateSuccessRate = (queue: { completed: number; failed: number }) => {
    const total = queue.completed + queue.failed;
    if (total === 0) return 100;
    return (queue.completed / total) * 100;
  };

  const scrapingProgress = calculateProgress(scrapingQueue);
  const aiProgress = calculateProgress(aiProcessingQueue);
  const scrapingSuccessRate = calculateSuccessRate(scrapingQueue);
  const aiSuccessRate = calculateSuccessRate(aiProcessingQueue);

  const totalCompleted = scrapingQueue.completed + aiProcessingQueue.completed;
  const totalFailed = scrapingQueue.failed + aiProcessingQueue.failed;
  const totalJobs = totalCompleted + totalFailed;
  const overallSuccessRate = totalJobs > 0 ? (totalCompleted / totalJobs) * 100 : 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Estat de les Cues</h2>
      </div>

      <div className="space-y-6">
        {/* Scraping Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">📦 Cua de Scraping:</span>
            </div>
            <div className="text-sm text-gray-600">
              {scrapingSuccessRate.toFixed(0)}% èxit
            </div>
          </div>

          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.max(5, scrapingProgress)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Stats Text */}
            <div className="flex items-center justify-between text-sm">
              <div className="space-x-2">
                <span className="text-orange-600 font-medium">
                  {scrapingQueue.waiting} en espera
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600 font-medium">
                  {scrapingQueue.active} actius
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-green-600 font-medium">
                  {scrapingQueue.completed} completats
                </span>
                {scrapingQueue.failed > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-red-600 font-medium">
                      ⚠️ {scrapingQueue.failed} errors
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Processing Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-900">🤖 Cua d'IA:</span>
            </div>
            <div className="text-sm text-gray-600">
              {aiSuccessRate.toFixed(0)}% èxit
            </div>
          </div>

          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.max(5, aiProgress)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Stats Text */}
            <div className="flex items-center justify-between text-sm">
              <div className="space-x-2">
                <span className="text-orange-600 font-medium">
                  {aiProcessingQueue.waiting} en espera
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-purple-600 font-medium">
                  {aiProcessingQueue.active} actius
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-green-600 font-medium">
                  {aiProcessingQueue.completed} completats
                </span>
                {aiProcessingQueue.failed > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-red-600 font-medium">
                      ⚠️ {aiProcessingQueue.failed} errors
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="font-medium text-gray-900">
                Total jobs avui: {totalJobs}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              overallSuccessRate >= 90
                ? 'bg-green-100 text-green-700'
                : overallSuccessRate >= 75
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {overallSuccessRate.toFixed(0)}% èxit general
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Scraping completats:</span>
                <span className="font-medium">{scrapingQueue.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processats per IA:</span>
                <span className="font-medium">{aiProcessingQueue.completed}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Total actius:</span>
                <span className="font-medium text-blue-600">
                  {scrapingQueue.active + aiProcessingQueue.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total en espera:</span>
                <span className="font-medium text-orange-600">
                  {scrapingQueue.waiting + aiProcessingQueue.waiting}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Health Indicators */}
        {(scrapingQueue.waiting > 10 || aiProcessingQueue.waiting > 10) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Cua saturada</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Hi ha molts jobs en espera. Considera augmentar la capacitat de processament.
                </p>
              </div>
            </div>
          </div>
        )}

        {(scrapingQueue.failed > 5 || aiProcessingQueue.failed > 5) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-red-600 mt-0.5">🚨</div>
              <div>
                <h4 className="font-medium text-red-800">Alta taxa d'errors</h4>
                <p className="text-sm text-red-700 mt-1">
                  S'han detectat molts errors. Revisa la configuració i logs dels jobs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}