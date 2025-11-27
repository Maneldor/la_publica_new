import express from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from './services/admin/DashboardService';

const app = express();
const prisma = new PrismaClient();
const dashboardService = new DashboardService();

app.use(express.json());

// Endpoint de prueba para dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    console.log('📊 Obteniendo stats del dashboard...');

    const stats = await dashboardService.getDashboardStats();

    console.log('✅ Stats obtenidos:', {
      totalLeads: stats.overview.totalLeads,
      leadsToday: stats.overview.leadsToday
    });

    res.json({
      success: true,
      metrics: stats,
      queryTime: '< 1s'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en puerto ${PORT}`);
  console.log(`📊 Endpoint dashboard: http://localhost:${PORT}/api/admin/dashboard`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});