'use client';

import { useEffect, useState } from 'react';

interface LimitDetail {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  status: string;
  label: string;
}

interface Limits {
  activeOffers: LimitDetail;
  teamMembers: LimitDetail;
  featuredOffers: LimitDetail;
  storage: LimitDetail;
}

export default function PlanLimitsSection() {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/empresa/limits');
      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data.limits) {
          setLimits(data.data.limits);
        }
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'ok': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ús de recursos</h3>
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-2.5 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Ús de recursos</h3>

      {limits && (
        <div className="space-y-6">
          {Object.entries(limits).map(([key, limit]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {limit.label}
                </span>
                <span className="text-sm text-gray-600">
                  {limit.limit === -1 ? (
                    <span className="text-green-600 font-medium">Il·limitat</span>
                  ) : (
                    <span className={`font-medium ${
                      limit.status === 'exceeded' ? 'text-red-600' :
                      limit.status === 'warning' ? 'text-yellow-600' :
                      'text-gray-900'
                    }`}>
                      {limit.current} / {limit.limit}
                    </span>
                  )}
                </span>
              </div>
              {limit.limit !== -1 && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getStatusColor(limit.status)}`}
                      style={{ width: `${Math.min(limit.percentage, 100)}%` }}
                    />
                  </div>
                  {limit.status === 'exceeded' && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Has superat el límit del teu pla
                    </p>
                  )}
                  {limit.status === 'warning' && (
                    <p className="text-xs text-yellow-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Estàs a prop del límit ({limit.remaining} restants)
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}