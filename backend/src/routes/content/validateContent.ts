import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/permissions.middleware';

// Lista de palabras inapropiadas (puedes expandirla o moverla a la BD)
const inappropriateWords = [
  'spam',
  'idiota',
  'estúpido',
  'tonto',
  'imbécil',
  'mierda',
  'odio',
  'violencia',
  'amenaza',
  'insulto',
  'discriminación',
  'racismo',
  'xenofobia'
];

export const validateContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, excerpt } = req.body;

    const textToValidate = `${title} ${content} ${excerpt}`.toLowerCase();

    // Buscar palabras inapropiadas
    const foundWords = inappropriateWords.filter(word =>
      textToValidate.includes(word.toLowerCase())
    );

    if (foundWords.length > 0) {
      return res.json({
        isValid: false,
        message: `Se detectaron palabras inapropiadas: ${foundWords.join(', ')}`,
        words: foundWords
      });
    }

    // Opcional: Verificar palabras en base de datos
    // const dbWords = await prisma.inappropriateWord.findMany();
    // const dbFoundWords = dbWords.filter(w =>
    //   textToValidate.includes(w.word.toLowerCase())
    // );

    // if (dbFoundWords.length > 0) {
    //   return res.json({
    //     isValid: false,
    //     message: `Se detectaron palabras inapropiadas`,
    //     words: dbFoundWords.map(w => w.word)
    //   });
    // }

    return res.json({
      isValid: true,
      message: 'Contenido válido'
    });

  } catch (error) {
    console.error('Error validando contenido:', error);
    return res.status(500).json({
      message: 'Error validando contenido'
    });
  }
};