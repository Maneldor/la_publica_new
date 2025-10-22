import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Sube una imagen a Cloudinary con optimizaciones automáticas
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `la-publica/${folder}`,
        resource_type: 'auto',
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        eager: [
          { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
          { width: 800, height: 800, crop: 'limit' },
        ],
        eager_async: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Elimina una imagen de Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Obtiene la URL optimizada de una imagen
 */
export const getOptimizedUrl = (
  publicId: string,
  width?: number,
  height?: number
): string => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
  });
};

export default cloudinary;