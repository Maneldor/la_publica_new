/*
 * ⚠️  CORE ARCHITECTURE - DO NOT MODIFY ⚠️
 *
 * Page Template Component - Standardized layout for all dashboard pages.
 *
 * CRITICAL STRUCTURE:
 * - Page Header: Title and subtitle section
 * - Statistics Grid: 4-column grid of compact UniversalCards
 * - Content Area: Children content with consistent background
 *
 * PROTECTED ELEMENTS:
 * - Standard page structure and layout
 * - Statistics grid configuration (4 columns, 20px gap)
 * - Page background color (#f8f9fa)
 * - Typography and spacing system
 * - Integration with UniversalCard component
 *
 * ⚠️  MODIFICATION GUIDELINES:
 * - DO NOT change the grid structure (4 columns)
 * - DO NOT modify spacing or padding values
 * - DO NOT alter the page background color
 * - Only modify props interface if all pages need new functionality
 * - Ensure changes work across all 14 dashboard pages
 * - Test statistics display and content area after changes
 *
 * CURRENT USAGE:
 * - Used by all 14 dashboard pages for consistent layout
 * - Displays statistics using compact UniversalCards
 * - Provides standardized header and content structure
 *
 * IMPLEMENTED PAGES:
 * Tauler, Perfil, Membres, Grups, Missatges, Forums, Blogs, Anuncis,
 * Empreses, Ofertes, Assessorament, Enllaços, Formació, Recursos
 *
 * Last modified: 2025-10-07 | Version: 1.0 | Status: PROTECTED
 */

'use client';

import { ReactNode } from 'react';
import { UniversalCard } from './UniversalCard';

interface StatData {
  label: string;
  value: string;
  trend?: string;
}

interface PageTemplateProps {
  title: string;
  subtitle: string;
  statsData: StatData[];
  children: ReactNode;
  className?: string;
}

export function PageTemplate({
  title,
  subtitle,
  statsData,
  children,
  className = ''
}: PageTemplateProps) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }} className={className}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px', padding: '24px 24px 0 24px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#2c3e50',
          marginBottom: '8px'
        }}>
          {title}
        </h1>
        <p style={{ fontSize: '16px', color: '#6c757d' }}>
          {subtitle}
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px',
        padding: '0 24px'
      }}>
        {(statsData || []).map((stat, index) => (
          <UniversalCard
            key={index}
            variant="compact"
            padding="md"
            middleZone={{
              stats: [{
                label: stat.label,
                value: stat.value,
                trend: stat.trend
              }]
            }}
          />
        ))}
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}