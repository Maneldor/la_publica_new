import { Router } from 'express';
import { generateBlogPost } from '../services/ai.service';
import { searchImages } from '../services/images.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Generar contenido de blog con IA
router.post('/generate-blog', authenticateToken, async (req, res) => {
  try {
    const { topic, tone, length, language } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }

    const result = await generateBlogPost({ topic, tone, length, language });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating blog:', error);
    res.status(500).json({ 
      error: 'Error al generar el contenido',
      details: error.message 
    });
  }
});

// Buscar imágenes
router.post('/search-images', authenticateToken, async (req, res) => {
  try {
    const { keywords, limit } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords son requeridos' });
    }

    const images = await searchImages(keywords, limit);
    
    res.json({
      success: true,
      data: images,
    });
  } catch (error: any) {
    console.error('Error searching images:', error);
    res.status(500).json({ 
      error: 'Error al buscar imágenes',
      details: error.message 
    });
  }
});

export default router;