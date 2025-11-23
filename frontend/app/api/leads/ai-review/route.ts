import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query params
    const search = searchParams.get('search') || '';
    const reviewStatus = searchParams.get('reviewStatus') || 'pending';
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const sortBy = searchParams.get('sortBy') || 'score';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Simplified where clause - get all leads and filter after
    const where: any = {};

    // We'll filter manually after fetching since complex JSON queries are not straightforward
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    let orderBy: any;
    switch (sortBy) {
      case 'score':
        orderBy = { createdAt: 'desc' }; // Fallback to date since we can't sort by metadata easily
        break;
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch all leads and filter manually
    const allLeads = await prisma.lead.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Filter AI leads based on metadata
    const aiLeads = allLeads.filter(lead => {
      const metadata = lead.metadata as any || {};

      // Must be AI generated
      if (metadata.generationMethod !== 'AI_SCRAPING') return false;

      // Filter by review status
      if (reviewStatus !== 'all' && metadata.reviewStatus !== reviewStatus.toUpperCase()) {
        return false;
      }

      // Filter by AI score
      if (minScore > 0 && (!metadata.aiScore || metadata.aiScore < minScore)) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (metadata.city && metadata.city.toLowerCase().includes(searchLower)) ||
          (metadata.sector && metadata.sector.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });

    // Apply pagination
    const total = aiLeads.length;
    const paginatedLeads = aiLeads.slice(offset, offset + limit);

    // Transform leads to match expected AI lead structure
    const leads = paginatedLeads.map(lead => {
      const metadata = lead.metadata as any || {};
      return {
        id: lead.id,
        companyName: lead.name,
        city: metadata.city || '',
        sector: metadata.sector || '',
        aiScore: metadata.aiScore || 0,
        aiInsights: metadata.aiInsights || { strengths: [], weaknesses: [], opportunities: [] },
        suggestedPitch: metadata.suggestedPitch || lead.message || '',
        targetAudience: metadata.targetAudience || '',
        estimatedSize: metadata.estimatedSize || '',
        phone: lead.phone,
        email: lead.email,
        website: metadata.website,
        reviewStatus: metadata.reviewStatus || 'PENDING',
        createdAt: lead.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching AI leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}