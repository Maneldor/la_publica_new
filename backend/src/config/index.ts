import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Validar variables críticas en producción
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

if (isProduction && !jwtSecret) {
  throw new Error('JWT_SECRET is required in production environment');
}

if (isProduction && jwtSecret === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET must be changed from default value in production');
}

if (!isProduction) {
  console.log('📄 Configuración cargada desde:', envPath);
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  jwt: {
    secret: jwtSecret || (isProduction ? '' : 'your-secret-key-change-in-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'la_publica',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hora por defecto
    prefix: 'lapublica:',
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@lapublica.com',
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
  },
  
  images: {
    pexelsApiKey: process.env.PEXELS_API_KEY || '',
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
    credentials: true,
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de requests por ventana
  },
};

if (!isProduction) {
  console.log('✅ Configuración cargada para entorno:', config.env);
}