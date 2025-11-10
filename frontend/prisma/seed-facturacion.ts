import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFacturacion() {
  try {
    console.log('🏗️ Creando configuración inicial de facturación...');

    await prisma.configFacturacion.upsert({
      where: { id: 'config-facturacion-1' },
      update: {},
      create: {
        id: 'config-facturacion-1',
        nombreEmpresa: 'La Pública',
        cif: 'B12345678',
        direccion: 'Carrer Exemple, 123',
        ciudad: 'Barcelona',
        codigoPostal: '08000',
        provincia: 'Barcelona',
        pais: 'España',
        telefono: '+34 934 123 456',
        email: 'facturacion@lapublica.cat',
        web: 'www.lapublica.cat',
        serieActual: '2024',
        siguienteNumero: 1,
        prefijoFactura: 'FAC',
        ivaPorDefecto: 21.0,
        diasVencimiento: 30,
        condicionesPago: 'Condicions de pagament: 30 dies des de la data de factura. Pagaments amb targeta de crèdit acceptats. Interessos de demora aplicables segons la normativa vigent.',
        pieFactura: 'Gràcies per confiar en La Pública. Per a qualsevol consulta, contacteu amb nosaltres a facturacion@lapublica.cat'
      }
    });

    console.log('✅ Configuración de facturación creada exitosamente');
    console.log('📊 Configuración inicial:');
    console.log('   - Serie: 2024');
    console.log('   - Próximo número: 1');
    console.log('   - Formato: FAC-2024-0001');
    console.log('   - IVA: 21%');
    console.log('   - Días vencimiento: 30');

  } catch (error) {
    console.error('❌ Error creando configuración de facturación:', error);
    throw error;
  }
}

async function main() {
  await seedFacturacion();
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedFacturacion };