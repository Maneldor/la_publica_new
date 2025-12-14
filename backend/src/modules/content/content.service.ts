import prisma from '../../config/database';
import { TranslationService } from '../../services/translation.service';

const translationService = new TranslationService();

export class ContentService {
  async crearYPublicar(data: {
    titulo: string;
    contenido: string;
    extracto?: string;
    tipo: string;
    idiomaOrigen: string;
    comunidades: string[];
    publicarInmediatamente: boolean;
    autorId: string;
    autorNombre: string;
    metadatos?: any;
  }) {
    const contenidoMaestro = await prisma.contenido_maestro.create({
      data: {
        tipo: data.tipo,
        tituloOriginal: data.titulo,
        contenidoOriginal: data.contenido,
        extracto: data.extracto,
        idiomaOrigen: data.idiomaOrigen,
        autorId: data.autorId,
        autorNombre: data.autorNombre,
        estado: data.publicarInmediatamente ? 'publicado' : 'borrador',
        metadatos: data.metadatos || null
      } as any
    });

    const idiomasNecesarios = new Set<string>();
    data.comunidades.forEach(comunidad => {
      const idiomas = translationService.getIdiomasPorComunidad(comunidad);
      idiomas.forEach(idioma => idiomasNecesarios.add(idioma));
    });

    const traducciones: Record<string, any> = {};

    for (const idioma of idiomasNecesarios) {
      if (idioma === data.idiomaOrigen) {
        traducciones[idioma] = null;
        continue;
      }

      const traduccion = await translationService.traducirContenido(
        {
          titulo: data.titulo,
          contenido: data.contenido,
          extracto: data.extracto
        },
        idioma
      );

      const traduccionGuardada = await prisma.traducciones.create({
        data: {
          contenidoId: contenidoMaestro.id,
          language: idioma,
          key: `content_${contenidoMaestro.id}_${idioma}`,
          value: traduccion.contenido,
          idiomaDestino: idioma,
          tituloTraducido: traduccion.titulo,
          contenidoTraducido: traduccion.contenido,
          extractoTraducido: traduccion.extracto,
          estadoTraduccion: 'automatica',
          traducidoPor: 'deepl',
          confianzaTraduccion: traduccion.confianza
        }
      });

      traducciones[idioma] = traduccionGuardada.id;
    }

    const publicaciones = [];

    for (const comunidad of data.comunidades) {
      const idiomas = translationService.getIdiomasPorComunidad(comunidad);

      for (const idioma of idiomas) {
        const slug = this.generarSlug(data.titulo);
        const urlPublica = this.generarUrlPublica(comunidad, idioma, slug);

        const publicacion = await prisma.publicaciones_comunidad.create({
          data: {
            contenidoId: contenidoMaestro.id,
            traduccionId: traducciones[idioma],
            comunidadSlug: comunidad,
            idioma,
            publicado: data.publicarInmediatamente,
            fechaPublicacion: data.publicarInmediatamente ? new Date() : null,
            slug,
            urlPublica
          } as any
        });

        publicaciones.push({
          comunidad,
          idioma,
          url: urlPublica,
          traduccionAutomatica: traducciones[idioma] !== null
        });
      }
    }

    return {
      contenidoId: contenidoMaestro.id,
      traduccionesCreadas: Object.keys(traducciones).filter(k => traducciones[k]).length,
      publicaciones
    };
  }

  private generarSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generarUrlPublica(comunidad: string, idioma: string, slug: string): string {
    const dominios: Record<string, string> = {
      cataluna: 'lapublica.cat',
      default: `${comunidad}.lapublica.es`
    };

    const dominio = dominios[comunidad] || dominios.default;
    const prefijoIdioma = idioma !== 'es' ? `/${idioma}` : '';

    return `https://${dominio}${prefijoIdioma}/blog/${slug}`;
  }

  async listarContenido(filtros: {
    tipo?: string;
    estado?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.estado) where.estado = filtros.estado;

    const [contenidos, total] = await Promise.all([
      prisma.contenido_maestro.findMany({
        where,
        include: {
          traducciones: true,
          publicaciones_comunidad: true
        },
        orderBy: { createdAt: 'desc' },
        take: filtros.limit || 20,
        skip: filtros.offset || 0
      }),
      prisma.contenido_maestro.count({ where })
    ]);

    return { contenidos, total };
  }
}