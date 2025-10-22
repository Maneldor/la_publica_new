import axios from 'axios';

interface TranslationResult {
  titulo: string;
  contenido: string;
  extracto?: string;
  confianza: number;
}

export class TranslationService {
  private deeplApiKey: string;

  constructor() {
    this.deeplApiKey = process.env.DEEPL_API_KEY || '';
  }

  async traducir(
    texto: string,
    idiomaDestino: string
  ): Promise<{ texto: string; confianza: number }> {
    if (!this.deeplApiKey) {
      return {
        texto: `[${idiomaDestino.toUpperCase()}] ${texto}`,
        confianza: 0.5
      };
    }

    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        null,
        {
          params: {
            auth_key: this.deeplApiKey,
            text: texto,
            target_lang: idiomaDestino.toUpperCase()
          }
        }
      );

      return {
        texto: response.data.translations[0].text,
        confianza: 0.95
      };
    } catch (error) {
      console.error('Error en traducción DeepL:', error);
      return {
        texto: `[${idiomaDestino.toUpperCase()}] ${texto}`,
        confianza: 0.5
      };
    }
  }

  async traducirContenido(
    contenido: {
      titulo: string;
      contenido: string;
      extracto?: string;
    },
    idiomaDestino: string
  ): Promise<TranslationResult> {
    const [titulo, contenidoTrad, extracto] = await Promise.all([
      this.traducir(contenido.titulo, idiomaDestino),
      this.traducir(contenido.contenido, idiomaDestino),
      contenido.extracto
        ? this.traducir(contenido.extracto, idiomaDestino)
        : Promise.resolve({ texto: '', confianza: 0 })
    ]);

    return {
      titulo: titulo.texto,
      contenido: contenidoTrad.texto,
      extracto: extracto.texto || undefined,
      confianza: (titulo.confianza + contenidoTrad.confianza) / 2
    };
  }

  getIdiomasPorComunidad(comunidadSlug: string): string[] {
    const mapaComunidades: Record<string, string[]> = {
      cataluna: ['ca', 'es'],
      'pais-vasco': ['eu', 'es'],
      galicia: ['gl', 'es'],
      valencia: ['ca', 'es'],
      baleares: ['ca', 'es'],
      default: ['es']
    };

    return mapaComunidades[comunidadSlug] || mapaComunidades.default;
  }
}