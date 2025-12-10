const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLeads() {
  try {
    const allLeads = await prisma.companyLead.findMany({
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        status: true,
        assignedToId: true,
        assignedTo: {
          select: {
            name: true,
            email: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 Total leads en la BD:', allLeads.length);

    const unassigned = allLeads.filter(lead => !lead.assignedToId);
    const assigned = allLeads.filter(lead => lead.assignedToId);

    console.log('🔴 Leads sin asignar:', unassigned.length);
    console.log('🟢 Leads asignados:', assigned.length);

    if (unassigned.length > 0) {
      console.log('\n📋 Leads sin asignar:');
      unassigned.forEach((lead, index) => {
        console.log(`${index + 1}. ${lead.companyName} - ${lead.contactName} (${lead.status})`);
      });
    }

    if (assigned.length > 0) {
      console.log('\n📋 Leads asignados:');
      assigned.forEach((lead, index) => {
        console.log(`${index + 1}. ${lead.companyName} - asignado a: ${lead.assignedTo?.name || lead.assignedTo?.email}`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkLeads();