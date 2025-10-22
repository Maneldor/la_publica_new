import axios from 'axios';
import { config } from '../config';

interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
  source: 'pexels' | 'unsplash';
}

export const searchImages = async (keywords: string[], limit: number = 6): Promise<ImageResult[]> => {
  const results: ImageResult[] = [];
  
  // Buscar en Pexels si hay API key
  if (config.images.pexelsApiKey) {
    try {
      for (const keyword of keywords.slice(0, 2)) { // Buscar solo las primeras 2 keywords
        const response = await axios.get('https://api.pexels.com/v1/search', {
          params: {
            query: keyword,
            per_page: 3,
            orientation: 'landscape',
          },
          headers: {
            Authorization: config.images.pexelsApiKey,
          },
        });

        const images = response.data.photos.map((photo: any) => ({
          id: `pexels-${photo.id}`,
          url: photo.src.large,
          thumbnailUrl: photo.src.medium,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          source: 'pexels' as const,
        }));

        results.push(...images);
      }
    } catch (error) {
      console.error('Error searching Pexels:', error);
    }
  }

  // Limitar resultados
  return results.slice(0, limit);
};