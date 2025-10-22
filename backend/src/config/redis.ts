import Redis from 'ioredis';
import { config } from './index';

// Crear instancia de Redis
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4 // IPv4
});

// Event listeners para Redis
redis.on('connect', () => {
  console.log('🔴 Redis: Conectando...');
});

redis.on('ready', () => {
  console.log('✅ Redis: Listo y funcionando');
});

redis.on('error', (error) => {
  console.error('❌ Redis Error:', error.message);
});

redis.on('close', () => {
  console.log('🔴 Redis: Conexión cerrada');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconectando...');
});

// Función para verificar conexión
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis connection check failed:', error);
    return false;
  }
};

// Función para cerrar conexión Redis
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log('✅ Redis: Conexión cerrada correctamente');
  } catch (error) {
    console.error('❌ Error cerrando conexión Redis:', error);
  }
};

// Exportar la instancia de Redis
export default redis;