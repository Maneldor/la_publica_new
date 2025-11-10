import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFacturacion() {
  console.log('🌱 Iniciando seed de configuración de facturación...');

  const anioActual = new Date().getFullYear();

  try {
    const config = await prisma.configFacturacion.upsert({
      where: { id: 'default' },
      update: {
        anioActual
      },
      create: {
        id: 'default',
        prefijo: 'FAC',
        siguienteNumero: 1,
        anioActual,
        ivaDefecto: 21,
        recargoEquivalencia: 5.2,
        nombreEmpresa: 'La Pública',
        cifEmpresa: 'B12345678',
        direccionEmpresa: 'Carrer Example, 123\n08001 Barcelona\nCatalunya, Espanya',
        telefonoEmpresa: '+34 934 567 890',
        emailEmpresa: 'facturacio@lapublica.cat',
        terminosPago: 'Pagament a 30 dies des de la data de factura.\nTransferència bancària a: ES12 1234 5678 9012 3456 7890',
        notasLegales: 'Factura exempt d\'IVA segons l\'article XX de la Llei XX/XXXX.\n\nEn cas de retard en el pagament, s\'aplicaran interessos de demora segons la Llei 3/2004.'
      }
    });

    console.log('✅ Configuración de facturación creada/actualizada');
    console.log(`   Prefijo: ${config.prefijo}`);
    console.log(`   Siguiente número: ${config.siguienteNumero}`);
    console.log(`   Año actual: ${config.anioActual}`);

  } catch (error) {
    console.error('❌ Error al crear configuración:', error);
  }

  console.log('\n🎉 Seed de facturación completado');
}

seedFacturacion()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });