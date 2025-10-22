import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const anthropic = new Anthropic({
  apiKey: config.ai.anthropicApiKey,
});

interface GenerateBlogPostParams {
  topic: string;
  tone?: 'professional' | 'casual' | 'informative';
  length?: 'short' | 'medium' | 'long';
  language?: 'es' | 'ca' | 'en';
}

interface BlogPostResult {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  imageKeywords: string[];
  metaDescription: string;
}

export const generateBlogPost = async (params: GenerateBlogPostParams): Promise<BlogPostResult> => {
  console.log('🤖 Iniciando generación de post con IA...');
  console.log('📝 Params:', params);
  console.log('🔑 API Key existe:', !!config.ai.anthropicApiKey);
  console.log('🔑 API Key length:', config.ai.anthropicApiKey?.length);
  console.log('🔧 Model:', config.ai.model);

  const { topic, tone = 'professional', length = 'medium', language = 'es' } = params;

  const lengthGuide = {
    short: '300-500 palabras',
    medium: '800-1200 palabras',
    long: '1500-2000 palabras',
  };

  const prompt = `Eres un experto redactor de contenido para "La Pública", una red social para empleados públicos en España.

Genera un post de blog completo sobre: "${topic}"

Requisitos:
- Idioma: ${language === 'es' ? 'Español' : language === 'ca' ? 'Catalán' : 'Inglés'}
- Tono: ${tone}
- Longitud: ${lengthGuide[length]}
- Dirigido a empleados públicos españoles
- Debe ser informativo, útil y profesional

Estructura tu respuesta en el siguiente formato JSON:
{
  "title": "Título atractivo y SEO-friendly",
  "excerpt": "Resumen breve de 2-3 líneas que enganche al lector",
  "content": "Contenido completo en HTML (usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imageKeywords": ["keyword1", "keyword2", "keyword3"],
  "metaDescription": "Meta descripción SEO de máximo 160 caracteres"
}

IMPORTANTE: 
- El contenido debe estar en HTML bien formateado
- Los imageKeywords son palabras clave en INGLÉS para buscar imágenes relevantes
- Responde SOLO con el JSON, sin texto adicional`;

  try {
    console.log('📤 Enviando petición a Anthropic...');
    
    const message = await anthropic.messages.create({
      model: config.ai.model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('✅ Respuesta recibida de Anthropic');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Limpiar posibles markdown code blocks
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result: BlogPostResult = JSON.parse(cleanedResponse);
    
    console.log('✅ Post generado exitosamente');
    
    return result;
  } catch (error: any) {
    console.error('❌ Error generating blog post:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw new Error('Error al generar el contenido con IA');
  }
};