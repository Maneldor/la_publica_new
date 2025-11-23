import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all leads and filter manually for AI leads
    const allLeads = await prisma.lead.findMany({
      select: {
        metadata: true,
      },
    });

    // Filter AI leads
    const aiLeads = allLeads.filter(lead => {
      const metadata = lead.metadata as any || {};
      return metadata.generationMethod === 'AI_SCRAPING';
    });

    // Calculate statistics from metadata
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let highQuality = 0;

    aiLeads.forEach(lead => {
      const metadata = lead.metadata as any || {};
      const reviewStatus = metadata.reviewStatus || 'PENDING';
      const aiScore = metadata.aiScore || 0;

      // Count by status
      switch (reviewStatus) {
        case 'PENDING':
          pending++;
          break;
        case 'APPROVED':
          approved++;
          break;
        case 'REJECTED':
          rejected++;
          break;
      }

      // Calculate average score
      if (aiScore > 0) {
        totalScore += aiScore;
        scoreCount++;
      }

      // High quality count (score >= 80)
      if (aiScore >= 80) {
        highQuality++;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const total = aiLeads.length;

    return NextResponse.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        avgScore,
        highQuality,
        totalGenerated: total,
      },
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}