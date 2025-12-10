const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function unassignLeads() {
  try {
    console.log('🔄 Unassigning some leads for testing...');

    // Get a few assigned leads
    const assignedLeads = await prisma.companyLead.findMany({
      where: {
        assignedToId: {
          not: null
        }
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Found ${assignedLeads.length} assigned leads to unassign`);

    // Unassign them
    for (const lead of assignedLeads) {
      await prisma.companyLead.update({
        where: { id: lead.id },
        data: { assignedToId: null }
      });
      console.log(`✅ Unassigned lead: ${lead.companyName}`);
    }

    console.log('✅ Successfully created unassigned leads for testing');

    // Check the new state
    const unassignedCount = await prisma.companyLead.count({
      where: { assignedToId: null }
    });
    console.log(`📊 Total unassigned leads now: ${unassignedCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

unassignLeads();