import { NextRequest, NextResponse } from 'next/server';

// Acceso directo a la base de datos simulada (en producción sería una consulta DB real)
let guardatsDB: any[] = [];

// Inicializar con datos de prueba completos (esto normalmente estaría en un módulo compartido)
const initializeDB = () => {
  if (guardatsDB.length === 0) {
    guardatsDB = [
      // Algunos elementos de test para verificación rápida
      {
        id: '1',
        usuariId: 'jordi-garcia',
        tipus: 'oferta',
        itemId: 'oferta-1',
        metadata: {
          titol: 'Descompte 20% en roba esportiva',
          imatge: '/images/offers/roba-esportiva.jpg',
          url: '/dashboard/ofertes/oferta-1',
          description: 'Aprofita aquesta oferta exclusiva per renovar el teu armari esportiu'
        },
        dataGuardat: '2024-10-15T10:30:00Z'
      },
      {
        id: '2',
        usuariId: 'jordi-garcia',
        tipus: 'empresa',
        itemId: 'empresa-1',
        metadata: {
          titol: 'EcoTech Solutions',
          imatge: '/images/companies/ecotech.jpg',
          url: '/dashboard/empreses/empresa-1',
          description: 'Empresa tecnològica especialitzada en solucions sostenibles'
        },
        dataGuardat: '2024-10-14T15:45:00Z'
      },
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
      }
    ];
  }
};

// GET - Verificar si un item específico está guardado
export async function GET(request: NextRequest) {
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

    // Inicializar base de datos si es necesario
    initializeDB();

    // Verificar si el item existe en guardats
    const isGuardat = guardatsDB.some(
      guardat => guardat.usuariId === usuariId &&
                 guardat.tipus === tipus &&
                 guardat.itemId === itemId
    );

    return NextResponse.json({
      success: true,
      isGuardat
    });

  } catch (error) {
    console.error('Error verificant guardat:', error);
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}