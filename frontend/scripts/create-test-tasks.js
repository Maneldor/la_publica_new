const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTasks() {
  try {
    console.log('🧪 Creando tareas de prueba...');

    // Buscar un usuario existente
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('❌ No se encontró ningún usuario en la BD');
      return;
    }

    console.log('👤 Usuario encontrado:', user.email);

    const testTasks = [
      {
        title: 'Tarea de Prueba - Alta Prioridad',
        description: 'Esta es una tarea de prueba con prioridad alta para testing de filtros',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        userId: user.id
      },
      {
        title: 'Tarea de Prueba - Media Prioridad',
        description: 'Esta es una tarea de prueba con prioridad media',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Pasado mañana
        userId: user.id
      },
      {
        title: 'Tarea de Prueba - Baja Prioridad',
        description: 'Esta es una tarea de prueba con prioridad baja',
        priority: 'LOW',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // En 3 días
        userId: user.id
      },
      {
        title: 'Tarea Completada de Prueba',
        description: 'Esta tarea ya está completada para testing de filtros',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
        completedAt: new Date(),
        userId: user.id
      },
      {
        title: 'Tarea Urgente de Prueba',
        description: 'Tarea con prioridad urgente para testing',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // En 6 horas
        userId: user.id
      }
    ];

    for (const task of testTasks) {
      const createdTask = await prisma.leadTask.create({
        data: task
      });
      console.log(`✅ Tarea creada: ${createdTask.title} (${createdTask.priority})`);
    }

    console.log(`🎉 Se crearon ${testTasks.length} tareas de prueba exitosamente`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTasks();