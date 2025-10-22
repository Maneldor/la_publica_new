import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinaryStorage } from '../config/cloudinary';

// Upload para contenido público (Cloudinary)
export const uploadPublic = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload para avatares de usuario (VPS)
const  localDiskStorage = multer.diskStorage({
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

export const uploadAvatar = multer({
  storage: localDiskStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB para avatares
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const valid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, valid);
  }
});