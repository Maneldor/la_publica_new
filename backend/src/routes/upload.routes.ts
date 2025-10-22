import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.middleware';
import { randomUUID } from 'crypto';

const router = Router();
router.use(authenticateToken);

// Configuración para almacenamiento local (avatares en VPS)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo imágenes permitidas'));
  }
};

const uploadAvatar = multer({
  storage: localStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Configuración para materiales de curso (local storage con soporte amplio de tipos)
const courseMaterialsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/course-materials');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueId = randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `material-${uniqueId}${ext}`);
  }
});

const courseMaterialsFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = {
    // Documents
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,

    // Videos
    'video/mp4': true,
    'video/avi': true,
    'video/quicktime': true,
    'video/x-msvideo': true,

    // Audio
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/mp4': true,

    // Images
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,

    // Archives
    'application/zip': true,
    'application/x-rar-compressed': true,
    'application/x-7z-compressed': true,

    // Text
    'text/plain': true,
  };

  if (allowedTypes[file.mimetype as keyof typeof allowedTypes]) {
    return cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

const uploadCourseMaterials = multer({
  storage: courseMaterialsStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max per file
  fileFilter: courseMaterialsFilter
});

// Ruta para subir avatares (VPS)
router.post('/avatar', uploadAvatar.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió archivo' });
    }

    res.json({
      success: true,
      url: `/uploads/avatars/${req.file.filename}`,
      cloudinary: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para subir materiales de cursos
router.post('/course-material', uploadCourseMaterials.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió archivo' });
    }

    const fileInfo = {
      id: randomUUID(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: `/uploads/course-materials/${req.file.filename}`,
      uploadDate: new Date().toISOString()
    };

    res.json(fileInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar material de curso
router.delete('/course-material/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/course-materials', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Archivo eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Archivo no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para servir archivos de materiales de curso
router.get('/course-materials/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/course-materials', filename);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Archivo no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;