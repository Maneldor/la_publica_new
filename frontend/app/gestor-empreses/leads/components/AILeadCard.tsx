'use client';

import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  Target,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import AIScoreBadge from './AIScoreBadge';
import ReviewActions from './ReviewActions';

interface Lead {
  id: string;
  companyName: string;
  city: string;
  sector: string;
  aiScore: number;
  aiInsights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  suggestedPitch: string;
  targetAudience: string;
  estimatedSize: string;
  phone?: string;
  email?: string;
  website?: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface AILeadCardProps {
  lead: Lead;
  onApprove: (leadId: string) => void;
  onReject: (leadId: string, reason: string) => void;
  onEdit: (leadId: string, data: any) => void;
  isLoading?: boolean;
}

export default function AILeadCard({
  lead,
  onApprove,
  onReject,
  onEdit,
  isLoading = false
}: AILeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstimatedSizeLabel = (size: string) => {
    const sizeMap: Record<string, string> = {
      '1': '1 empleat',
      '2-10': '2-10 empleats',
      '11-50': '11-50 empleats',
      '51-250': '51-250 empleats',
      '250+': '250+ empleats'
    };
    return sizeMap[size] || size;
  };

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardHeader className="pb-4">
        {/* Header principal */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-1">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {lead.companyName}
                </h3>
                <AIScoreBadge score={lead.aiScore} size="md" />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.city}</span>
                </div>
                <span>•</span>
                <span className="font-medium text-blue-600">{lead.sector}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{getEstimatedSizeLabel(lead.estimatedSize)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Información de contacto */}
        <div className="flex items-center gap-4 text-sm">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{lead.email}</span>
            </a>
          )}

          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>{lead.phone}</span>
            </a>
          )}

          {lead.website && (
            <a
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{lead.website}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Insights - Siempre visible */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">Insights de la IA</h4>
          </div>

          <div className="space-y-3">
            {/* Puntos fuertes */}
            {lead.aiInsights.strengths.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <span className="text-green-600">✓</span>
                  Punts forts
                </h5>
                <ul className="space-y-1">
                  {lead.aiInsights.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Puntos débiles */}
            {lead.aiInsights.weaknesses.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <span className="text-orange-600">⚠</span>
                  Punts febles
                </h5>
                <ul className="space-y-1">
                  {lead.aiInsights.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Oportunidades */}
            {lead.aiInsights.opportunities.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <span className="text-blue-600">💡</span>
                  Oportunitats
                </h5>
                <ul className="space-y-1">
                  {lead.aiInsights.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Audiencia objetivo */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Audiència objectiu</h4>
              </div>
              <p className="text-sm text-gray-700">
                {lead.targetAudience}
              </p>
            </div>

            {/* Pitch sugerido */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Pitch suggerit per la IA</h4>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lead.suggestedPitch}
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100">
              <span>Generat el {formatDate(lead.createdAt)}</span>
              <span>ID: {lead.id.slice(0, 8)}...</span>
            </div>
          </div>
        )}

        {/* Acciones de revisión */}
        <div className="pt-4 border-t border-gray-200">
          <ReviewActions
            leadId={lead.id}
            companyName={lead.companyName}
            email={lead.email}
            phone={lead.phone}
            website={lead.website}
            onApprove={onApprove}
            onReject={onReject}
            onEdit={onEdit}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}