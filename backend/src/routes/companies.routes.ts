import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { cache, cacheList, invalidateCache } from '../middleware/cache.middleware';
import {
  createCompany,
  listCompanies,
  getCompany,
  updateCompany,
  createService,
  listServices,
  createProduct,
  listProducts,
  requestAdvice,
  listAdviceRequests,
  updateAdviceStatus,
  createRating,
  getCompanyRatings
} from '../modules/companies/companies.controller';

const router = Router();

// Perfil de empresa
router.post('/', authenticateToken, invalidateCache('companies:*'), createCompany);
router.get('/', cacheList({ baseKey: 'companies', ttl: 900 }), listCompanies);
router.get('/:id', cache({ ttl: 600 }), getCompany);
router.put('/:id', authenticateToken, invalidateCache('companies:*'), updateCompany);

// Servicios
router.get('/:id/services', listServices);
router.post('/:id/services', authenticateToken, createService);

// Productos
router.get('/:id/products', listProducts);
router.post('/:id/products', authenticateToken, createProduct);

// Asesoramiento
router.post('/:id/advice', authenticateToken, requestAdvice);
router.get('/:id/advice', authenticateToken, listAdviceRequests);
router.put('/advice/:adviceId', authenticateToken, updateAdviceStatus);

// Valoraciones
router.post('/:id/ratings', authenticateToken, createRating);
router.get('/:id/ratings', getCompanyRatings);

export default router;