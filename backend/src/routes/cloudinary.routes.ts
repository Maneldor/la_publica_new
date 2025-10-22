import { Router } from 'express';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes.'));
    }
  },
});

// Subir imagen de grupo
router.post('/groups', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const result = await uploadToCloudinary(req.file, 'groups');

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen de grupo:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Subir imagen de empresa
router.post('/companies', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const result = await uploadToCloudinary(req.file, 'companies');

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen de empresa:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Subir imagen de oferta
router.post('/offers', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const result = await uploadToCloudinary(req.file, 'offers');

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen de oferta:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Subir imagen de blog
router.post('/blog', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const result = await uploadToCloudinary(req.file, 'blog');

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen de blog:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Eliminar imagen
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Decodificar el publicId (viene como URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    await deleteFromCloudinary(decodedPublicId);

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
});

export default router;