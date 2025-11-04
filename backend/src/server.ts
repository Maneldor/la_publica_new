import app from './app';
import { checkRedisConnection, closeRedisConnection } from './config/redis';

const PORT = process.env.PORT || 5000;

// Inicializar Redis y servidor
async function startServer() {
  try {
    // Verificar conexión a Redis
    const redisConnected = await checkRedisConnection();
    if (redisConnected) {
      console.log('✅ Redis: Conectado correctamente');
    } else {
      console.warn('⚠️ Redis: No disponible - la aplicación funcionará sin caché');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
      console.log(`📝 Content: http://localhost:${PORT}/api/v1/content`);
      console.log(`👥 Admin Panel: http://localhost:${PORT}/api/v1/admin`);
      console.log(`🛡️ Roles: http://localhost:${PORT}/api/v1/roles`);
      console.log(`📈 CRM: http://localhost:${PORT}/api/v1/crm`);
      if (redisConnected) {
        console.log(`🔴 Redis Cache: Habilitado`);
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await closeRedisConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await closeRedisConnection();
  process.exit(0);
});

// Iniciar servidor
startServer();