import { NextRequest, NextResponse } from 'next/server';

// Simulació de base de dades en memòria - Dades completes de test
const guardatsDB: any[] = [
  // Ofertes guardades (8 total)
  {
    id: '1',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-1',
    metadata: {
      titol: 'Descompte 20% en roba esportiva',
      imatge: '/images/offers/roba-esportiva.jpg',
      url: '/dashboard/ofertes/oferta-1',
      description: 'Aprofita aquesta oferta exclusiva per renovar el teu armari esportiu amb les millors marques'
    },
    dataGuardat: '2024-10-15T10:30:00Z'
  },
  {
    id: '7',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-2',
    metadata: {
      titol: 'Menú familiar a Can Pere',
      imatge: '/images/offers/menu-familiar.jpg',
      url: '/dashboard/ofertes/oferta-2',
      description: 'Menú per a 4 persones amb productes locals i de temporada'
    },
    dataGuardat: '2024-10-09T13:00:00Z'
  },
  {
    id: '9',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-3',
    metadata: {
      titol: 'Sessió de ioga gratuïta',
      imatge: '/images/offers/ioga.jpg',
      url: '/dashboard/ofertes/oferta-3',
      description: 'Primera classe gratuïta al nostre centre de benestar'
    },
    dataGuardat: '2024-10-07T18:45:00Z'
  },
  {
    id: '10',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-4',
    metadata: {
      titol: 'Descompte en llibres locals',
      imatge: '/images/offers/llibres.jpg',
      url: '/dashboard/ofertes/oferta-4',
      description: '30% de descompte en autors catalans i literatura local'
    },
    dataGuardat: '2024-10-06T12:20:00Z'
  },
  {
    id: '11',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-5',
    metadata: {
      titol: 'Curs de cuina vegetariana',
      imatge: '/images/offers/cuina-veg.jpg',
      url: '/dashboard/ofertes/oferta-5',
      description: 'Aprèn a cuinar plats vegetarians deliciosos i saludables'
    },
    dataGuardat: '2024-10-05T16:10:00Z'
  },
  {
    id: '12',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-6',
    metadata: {
      titol: 'Revisió dental gratuïta',
      imatge: '/images/offers/dental.jpg',
      url: '/dashboard/ofertes/oferta-6',
      description: 'Consulta i neteja dental gratuïta per a nous pacients'
    },
    dataGuardat: '2024-10-04T14:30:00Z'
  },
  {
    id: '13',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-7',
    metadata: {
      titol: 'Bicicletes de segona mà',
      imatge: '/images/offers/bici.jpg',
      url: '/dashboard/ofertes/oferta-7',
      description: 'Bicicletes revisades i garantides a preus populars'
    },
    dataGuardat: '2024-10-03T11:15:00Z'
  },
  {
    id: '14',
    usuariId: 'jordi-garcia',
    tipus: 'oferta',
    itemId: 'oferta-8',
    metadata: {
      titol: 'Taller de reparació electrònics',
      imatge: '/images/offers/reparacio.jpg',
      url: '/dashboard/ofertes/oferta-8',
      description: 'Aprèn a reparar els teus dispositius electrònics'
    },
    dataGuardat: '2024-10-02T09:45:00Z'
  },

  // Empreses guardades (6 total)
  {
    id: '2',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-1',
    metadata: {
      titol: 'EcoTech Solutions',
      imatge: '/images/companies/ecotech.jpg',
      url: '/dashboard/empreses/empresa-1',
      description: 'Empresa tecnològica especialitzada en solucions sostenibles i energia renovable'
    },
    dataGuardat: '2024-10-14T15:45:00Z'
  },
  {
    id: '15',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-2',
    metadata: {
      titol: 'Cooperativa Horta del Barri',
      imatge: '/images/companies/cooperativa.jpg',
      url: '/dashboard/empreses/empresa-2',
      description: 'Cooperativa de productes ecològics locals i agricultura urbana'
    },
    dataGuardat: '2024-10-01T14:20:00Z'
  },
  {
    id: '16',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-3',
    metadata: {
      titol: 'Taller de Reparacions Solidàries',
      imatge: '/images/companies/taller.jpg',
      url: '/dashboard/empreses/empresa-3',
      description: 'Taller comunitari especialitzat en reparació de bicicletes i aparells'
    },
    dataGuardat: '2024-09-30T16:50:00Z'
  },
  {
    id: '17',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-4',
    metadata: {
      titol: 'Llibreria La Paraula',
      imatge: '/images/companies/llibreria.jpg',
      url: '/dashboard/empreses/empresa-4',
      description: 'Llibreria independent amb literatura catalana i espai cultural'
    },
    dataGuardat: '2024-09-29T12:30:00Z'
  },
  {
    id: '18',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-5',
    metadata: {
      titol: 'Centre de Ioga Mindful',
      imatge: '/images/companies/ioga.jpg',
      url: '/dashboard/empreses/empresa-5',
      description: 'Centre especialitzat en ioga, meditació i benestar personal'
    },
    dataGuardat: '2024-09-28T19:15:00Z'
  },
  {
    id: '19',
    usuariId: 'jordi-garcia',
    tipus: 'empresa',
    itemId: 'empresa-6',
    metadata: {
      titol: 'Clínica Dental Comunitària',
      imatge: '/images/companies/dental.jpg',
      url: '/dashboard/empreses/empresa-6',
      description: 'Servei dental accessible amb preus solidaris per al barri'
    },
    dataGuardat: '2024-09-27T10:45:00Z'
  },

  // Anuncis guardats (5 total)
  {
    id: '3',
    usuariId: 'jordi-garcia',
    tipus: 'anunci',
    itemId: 'anunci-1',
    metadata: {
      titol: 'Esdeveniment cultural al barri',
      imatge: '/images/announcements/cultura.jpg',
      url: '/dashboard/anuncis/anunci-1',
      description: 'Concert de música catalana aquest dissabte al parc central'
    },
    dataGuardat: '2024-10-13T09:15:00Z'
  },
  {
    id: '20',
    usuariId: 'jordi-garcia',
    tipus: 'anunci',
    itemId: 'anunci-2',
    metadata: {
      titol: 'Mercat d\'intercanvi de roba',
      imatge: '/images/announcements/intercanvi.jpg',
      url: '/dashboard/anuncis/anunci-2',
      description: 'Mercat mensual d\'intercanvi de roba i objectes per a tota la família'
    },
    dataGuardat: '2024-09-26T15:30:00Z'
  },
  {
    id: '21',
    usuariId: 'jordi-garcia',
    tipus: 'anunci',
    itemId: 'anunci-3',
    metadata: {
      titol: 'Jornada de neteja del parc',
      imatge: '/images/announcements/neteja.jpg',
      url: '/dashboard/anuncis/anunci-3',
      description: 'Activitat comunitària per mantenir nets els nostres espais verds'
    },
    dataGuardat: '2024-09-25T11:20:00Z'
  },
  {
    id: '22',
    usuariId: 'jordi-garcia',
    tipus: 'anunci',
    itemId: 'anunci-4',
    metadata: {
      titol: 'Assemblea de veïns',
      imatge: '/images/announcements/assemblea.jpg',
      url: '/dashboard/anuncis/anunci-4',
      description: 'Reunió mensual per tractar temes del barri i propostes de millora'
    },
    dataGuardat: '2024-09-24T17:45:00Z'
  },
  {
    id: '23',
    usuariId: 'jordi-garcia',
    tipus: 'anunci',
    itemId: 'anunci-5',
    metadata: {
      titol: 'Festa major del barri',
      imatge: '/images/announcements/festa.jpg',
      url: '/dashboard/anuncis/anunci-5',
      description: 'Programa d\'activitats de la festa major amb concerts i espectacles'
    },
    dataGuardat: '2024-09-23T14:10:00Z'
  },

  // Blogs guardats (4 total)
  {
    id: '4',
    usuariId: 'jordi-garcia',
    tipus: 'blog',
    itemId: 'blog-1',
    metadata: {
      titol: 'Guia de sostenibilitat urbana',
      imatge: '/images/blogs/sostenibilitat.jpg',
      url: '/dashboard/blogs/blog-1',
      description: 'Com fer la teva ciutat més sostenible amb petits gestos quotidians'
    },
    dataGuardat: '2024-10-12T14:20:00Z'
  },
  {
    id: '24',
    usuariId: 'jordi-garcia',
    tipus: 'blog',
    itemId: 'blog-2',
    metadata: {
      titol: 'L\'art de la cuina de temporada',
      imatge: '/images/blogs/cuina.jpg',
      url: '/dashboard/blogs/blog-2',
      description: 'Receptes amb productes de proximitat i respectuosos amb el medi ambient'
    },
    dataGuardat: '2024-09-22T16:30:00Z'
  },
  {
    id: '25',
    usuariId: 'jordi-garcia',
    tipus: 'blog',
    itemId: 'blog-3',
    metadata: {
      titol: 'Tecnologia al servei de la comunitat',
      imatge: '/images/blogs/tecnologia.jpg',
      url: '/dashboard/blogs/blog-3',
      description: 'Com utilitzar la tecnologia per millorar la vida comunitària'
    },
    dataGuardat: '2024-09-21T13:45:00Z'
  },
  {
    id: '26',
    usuariId: 'jordi-garcia',
    tipus: 'blog',
    itemId: 'blog-4',
    metadata: {
      titol: 'Jardineria urbana per principiants',
      imatge: '/images/blogs/jardineria.jpg',
      url: '/dashboard/blogs/blog-4',
      description: 'Consells pràctics per començar el teu propi hort urbà'
    },
    dataGuardat: '2024-09-20T10:15:00Z'
  },

  // Forums guardats (3 total)
  {
    id: '5',
    usuariId: 'jordi-garcia',
    tipus: 'forum',
    itemId: 'forum-1',
    metadata: {
      titol: 'Debat sobre mobilitat urbana',
      imatge: '/images/forums/mobilitat.jpg',
      url: '/dashboard/forums/forum-1',
      description: 'Discussió comunitària sobre les millores en transport públic'
    },
    dataGuardat: '2024-10-11T16:30:00Z'
  },
  {
    id: '27',
    usuariId: 'jordi-garcia',
    tipus: 'forum',
    itemId: 'forum-2',
    metadata: {
      titol: 'Espais verds al barri',
      imatge: '/images/forums/espais-verds.jpg',
      url: '/dashboard/forums/forum-2',
      description: 'Propostes per millorar i crear nous espais verds comunitaris'
    },
    dataGuardat: '2024-09-19T14:25:00Z'
  },
  {
    id: '28',
    usuariId: 'jordi-garcia',
    tipus: 'forum',
    itemId: 'forum-3',
    metadata: {
      titol: 'Seguretat al barri',
      imatge: '/images/forums/seguretat.jpg',
      url: '/dashboard/forums/forum-3',
      description: 'Discussió sobre mesures de seguretat i convivència veïnal'
    },
    dataGuardat: '2024-09-18T11:40:00Z'
  },

  // Grups guardats (2 total)
  {
    id: '6',
    usuariId: 'jordi-garcia',
    tipus: 'grup',
    itemId: 'grup-1',
    metadata: {
      titol: 'Grup de Jardineria Ecològica',
      imatge: '/images/groups/jardineria.jpg',
      url: '/dashboard/grups/grup-1',
      description: 'Comunitat dedicada a compartir consells de jardineria sostenible'
    },
    dataGuardat: '2024-10-10T11:45:00Z'
  },
  {
    id: '29',
    usuariId: 'jordi-garcia',
    tipus: 'grup',
    itemId: 'grup-2',
    metadata: {
      titol: 'Ciclistes del Barri',
      imatge: '/images/groups/ciclistes.jpg',
      url: '/dashboard/grups/grup-2',
      description: 'Grup per organitzar sortides en bicicleta i promoure la mobilitat sostenible'
    },
    dataGuardat: '2024-09-17T18:20:00Z'
  },

  // Assessoraments guardats (5 total)
  {
    id: '8',
    usuariId: 'jordi-garcia',
    tipus: 'assessorament',
    itemId: 'assessorament-legal-contractacio-publica',
    metadata: {
      titol: 'Assessorament Legal en Contractació Pública',
      imatge: '/images/advisory/legal-contractacio.jpg',
      url: '/dashboard/assessorament/assessorament-legal-contractacio-publica',
      description: 'Primera consulta gratuïta de 60 minuts amb expert en contractació pública'
    },
    dataGuardat: '2024-10-08T10:15:00Z'
  },
  {
    id: '30',
    usuariId: 'jordi-garcia',
    tipus: 'assessorament',
    itemId: 'assessorament-fiscal-pimes',
    metadata: {
      titol: 'Assessorament Fiscal per PIMES',
      imatge: '/images/advisory/fiscal.jpg',
      url: '/dashboard/assessorament/assessorament-fiscal-pimes',
      description: 'Suport fiscal especialitzat per a petites i mitjanes empreses del barri'
    },
    dataGuardat: '2024-09-16T15:30:00Z'
  },
  {
    id: '31',
    usuariId: 'jordi-garcia',
    tipus: 'assessorament',
    itemId: 'assessorament-nutricional-empleats',
    metadata: {
      titol: 'Assessorament Nutricional per Empleats Públics',
      imatge: '/images/advisory/nutricional.jpg',
      url: '/dashboard/assessorament/assessorament-nutricional-empleats',
      description: 'Consulta dietètica gratuïta per millorar hàbits alimentaris al treball'
    },
    dataGuardat: '2024-09-15T12:45:00Z'
  },
  {
    id: '32',
    usuariId: 'jordi-garcia',
    tipus: 'assessorament',
    itemId: 'assessorament-transformacio-digital',
    metadata: {
      titol: 'Transformació Digital per Administracions',
      imatge: '/images/advisory/digital.jpg',
      url: '/dashboard/assessorament/assessorament-transformacio-digital',
      description: 'Consulta sobre implementació de tecnologia en l\'administració pública'
    },
    dataGuardat: '2024-09-14T16:20:00Z'
  },
  {
    id: '33',
    usuariId: 'jordi-garcia',
    tipus: 'assessorament',
    itemId: 'assessorament-immobiliari-funcionaris',
    metadata: {
      titol: 'Assessorament Immobiliari per Funcionaris',
      imatge: '/images/advisory/immobiliari.jpg',
      url: '/dashboard/assessorament/assessorament-immobiliari-funcionaris',
      description: 'Consultoria immobiliària especialitzada en hipoteques per empleats públics'
    },
    dataGuardat: '2024-09-13T09:30:00Z'
  }
];

// GET - Obtenir tots els guardats d'un usuari
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuariId = searchParams.get('usuariId');
    const tipus = searchParams.get('tipus');

    if (!usuariId) {
      return NextResponse.json(
        { error: 'usuariId és requerit' },
        { status: 400 }
      );
    }

    let guardats = guardatsDB.filter(guardat => guardat.usuariId === usuariId);

    // Filtrar per tipus si s'especifica
    if (tipus) {
      guardats = guardats.filter(guardat => guardat.tipus === tipus);
    }

    // Ordenar per data de guardat (més recent primer)
    guardats.sort((a, b) => new Date(b.dataGuardat).getTime() - new Date(a.dataGuardat).getTime());

    return NextResponse.json({
      success: true,
      data: guardats,
      total: guardats.length
    });

  } catch (error) {
    console.error('Error obtenint guardats:', error);
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// POST - Guardar un nou item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuariId, tipus, itemId, metadata } = body;

    if (!usuariId || !tipus || !itemId) {
      return NextResponse.json(
        { error: 'usuariId, tipus i itemId són requerits' },
        { status: 400 }
      );
    }

    // Verificar si ja existeix
    const existeix = guardatsDB.find(
      guardat => guardat.usuariId === usuariId &&
                 guardat.tipus === tipus &&
                 guardat.itemId === itemId
    );

    if (existeix) {
      return NextResponse.json(
        { error: 'Aquest item ja està guardat' },
        { status: 409 }
      );
    }

    // Crear nou guardat
    const nouGuardat = {
      id: Date.now().toString(),
      usuariId,
      tipus,
      itemId,
      metadata: metadata || {},
      dataGuardat: new Date().toISOString()
    };

    guardatsDB.push(nouGuardat);

    return NextResponse.json({
      success: true,
      data: nouGuardat
    });

  } catch (error) {
    console.error('Error guardant item:', error);
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un guardat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuariId = searchParams.get('usuariId');
    const tipus = searchParams.get('tipus');
    const itemId = searchParams.get('itemId');

    if (!usuariId || !tipus || !itemId) {
      return NextResponse.json(
        { error: 'usuariId, tipus i itemId són requerits' },
        { status: 400 }
      );
    }

    const index = guardatsDB.findIndex(
      guardat => guardat.usuariId === usuariId &&
                 guardat.tipus === tipus &&
                 guardat.itemId === itemId
    );

    if (index === -1) {
      return NextResponse.json(
        { error: 'Guardat no trobat' },
        { status: 404 }
      );
    }

    guardatsDB.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Guardat eliminat correctament'
    });

  } catch (error) {
    console.error('Error eliminant guardat:', error);
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}