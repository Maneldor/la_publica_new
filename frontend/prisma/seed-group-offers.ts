import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ofertas grupales data...\n');

  // SEGURIDAD: Verificar que NO estamos en producción
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ NO ejecutar seed en producción!');
  }

  const hashedPassword = await bcrypt.hash('Test1234!', 10);

  // 1. CREAR USUARIOS DE PRUEBA SI NO EXISTEN
  console.log('📝 Creando usuarios de prueba...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lapublica.cat' },
    update: {},
    create: {
      email: 'admin@lapublica.cat',
      name: 'Admin La Pública',
      password: hashedPassword,
      role: 'ADMIN',
      userType: 'ADMIN',
      isActive: true,
    }
  });
  console.log(`✓ Admin: ${admin.email}`);

  const empleado1 = await prisma.user.upsert({
    where: { email: 'empleado1@gencat.cat' },
    update: {},
    create: {
      email: 'empleado1@gencat.cat',
      name: 'Maria Garcia',
      password: hashedPassword,
      role: 'USER',
      userType: 'EMPLOYEE',
      isActive: true,
    }
  });
  console.log(`✓ Empleado 1: ${empleado1.email}`);

  const empleado2 = await prisma.user.upsert({
    where: { email: 'empleado2@gencat.cat' },
    update: {},
    create: {
      email: 'empleado2@gencat.cat',
      name: 'Josep Martinez',
      password: hashedPassword,
      role: 'USER',
      userType: 'EMPLOYEE',
      isActive: true,
    }
  });
  console.log(`✓ Empleado 2: ${empleado2.email}`);

  // 2. CREAR EMPRESA DE PRUEBA
  console.log('\n🏢 Creando empresa de prueba...');

  const company = await prisma.company.upsert({
    where: { cif: 'B12345678' },
    update: {},
    create: {
      cif: 'B12345678',
      name: 'Tesla Catalunya',
      email: 'contacto@teslacatalunya.cat',
      phone: '933123456',
      address: 'Avinguda Diagonal 123',
      status: 'PUBLISHED',
      isActive: true,
    }
  });
  console.log(`✓ Empresa: ${company.name}`);

  // Usuario de la empresa
  const companyUser = await prisma.user.upsert({
    where: { email: 'empresa@teslacatalunya.cat' },
    update: {},
    create: {
      email: 'empresa@teslacatalunya.cat',
      name: 'Joan Pérez',
      password: hashedPassword,
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
      ownedCompanyId: company.id,
      isActive: true,
    }
  });
  console.log(`✓ Usuario empresa: ${companyUser.email}`);

  // 3. CREAR CATEGORÍA
  console.log('\n📂 Creando categoría...');

  const category = await prisma.offerCategory.upsert({
    where: { slug: 'automocio' },
    update: {},
    create: {
      name: 'Automoció',
      slug: 'automocio',
      description: 'Vehicles i accessoris',
      icon: 'Car',
      color: '#3B82F6',
      isActive: true,
    }
  });
  console.log(`✓ Categoría: ${category.name}`);

  // 4. CREAR SOLICITUDES DE OFERTAS GRUPALES
  console.log('\n📋 Creando solicitudes de ofertas grupales...');

  const request1 = await prisma.groupOfferRequest.create({
    data: {
      title: 'Tesla Model 3 per a empleats públics',
      description: `Sol·licitem crear una oferta grupal per al Tesla Model 3 dirigida als empleats públics de Catalunya.

Especificacions del producte:
- Tesla Model 3 Standard Range Plus
- Autonomia: fins a 614 km
- Acceleració: 0-100 km/h en 5.3 segons
- Velocitat màxima: 225 km/h
- Autopilot inclòs
- Pantalla tàctil 15"
- 5 anys de garantia

Proposem oferir un descompte progressiu segons el nombre de participants.`,
      category: 'Automoció',
      location: 'Catalunya',
      minParticipants: 50,
      maxParticipants: 100,
      targetPrice: 30000,
      status: 'PENDING',
      requesterId: empleado1.id,
      contactEmail: 'empleado1@gencat.cat',
      contactPhone: '933111111',
      tags: ['tesla', 'cotxe elèctric', 'sostenible'],
      priority: 1,
    }
  });
  console.log(`✓ Solicitud 1: ${request1.title}`);

  const request2 = await prisma.groupOfferRequest.create({
    data: {
      title: 'Curs de conducció eficient',
      description: `Sol·licitem crear una oferta grupal per a un curs de conducció eficient i sostenible.

Contingut del curs:
- Tècniques d'eco-driving
- Manteniment preventiu
- Planificació de rutes eficients
- Ús de vehicles elèctrics
- Certificació oficial

Aquest curs seria molt beneficial per als empleats públics que utilitzen vehicles de l'administració.`,
      category: 'Formació',
      location: 'Barcelona',
      minParticipants: 20,
      maxParticipants: 50,
      targetPrice: 150,
      status: 'APPROVED',
      requesterId: empleado2.id,
      contactEmail: 'empleado2@gencat.cat',
      contactPhone: '933222222',
      reviewedAt: new Date(),
      tags: ['formació', 'conducció', 'sostenibilitat'],
      priority: 0,
    }
  });
  console.log(`✓ Solicitud 2: ${request2.title}`);

  // 5. CREAR OFERTAS GRUPALES
  console.log('\n🎯 Creando ofertas grupales...');

  // Oferta 1: Tesla Model 3 (basada en request1)
  const offer1 = await prisma.offer.create({
    data: {
      title: 'Tesla Model 3 - Compra Grupal Empleats Públics',
      slug: 'tesla-model-3-compra-grupal-empleats-publics',
      shortDescription: 'Aconsegueix un Tesla Model 3 amb descomptes de fins al 20% exclusiu per a empleats públics',
      description: `<h2>Tesla Model 3 - Oferta Grupal Exclusiva</h2>
<p>Oferta especial per a empleats públics de Catalunya amb descomptes progressius segons participació.</p>

<h3>Característiques del vehicle:</h3>
<ul>
  <li>🔋 Autonomia: fins a 614 km</li>
  <li>⚡ Acceleració: 0-100 km/h en 5.3 segons</li>
  <li>🤖 Autopilot inclòs</li>
  <li>📱 Pantalla tàctil de 15 polzades</li>
  <li>🛡️ 5 anys de garantia</li>
  <li>🔧 Manteniment mínim</li>
</ul>

<h3>Descomptes per nivells:</h3>
<ul>
  <li>50-74 participants: 10% de descompte</li>
  <li>75-99 participants: 15% de descompte</li>
  <li>100+ participants: 20% de descompte</li>
</ul>

<p><strong>Inclou:</strong> Vehicle, carregador domèstic, instal·lació gratuïta i formació d'ús.</p>`,
      images: [
        'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg',
        'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Interior-Desktop-Global.jpg'
      ],
      price: 45000,
      originalPrice: 50000,
      currency: 'EUR',
      priceType: 'FIXED',
      companyId: company.id,
      categoryId: category.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
      featured: true,
      contactMethod: 'EMAIL',
      contactEmail: 'ventas@teslacatalunya.cat',
      contactPhone: '933456789',
      location: 'Catalunya',
      remote: false,
      tags: ['tesla', 'cotxe elèctric', 'sostenible', 'empleats públics'],
      requirements: 'Ser empleat públic de Catalunya amb contracte indefinit o temporal superior a 1 any',
      benefits: 'Descompte progressiu, finançament preferent, assegurança amb descompte',
      duration: '1 any de suport post-venda inclòs',
    }
  });
  console.log(`✓ Oferta Tesla: ${offer1.slug}`);

  // Oferta 2: Curs de conducció (basada en request2)
  const offer2 = await prisma.offer.create({
    data: {
      title: 'Curs de Conducció Eficient i Sostenible',
      slug: 'curs-conduccio-eficient-sostenible',
      shortDescription: 'Aprèn tècniques d\'eco-driving i reduceix fins a un 20% el consum de combustible',
      description: `<h2>Curs de Conducció Eficient i Sostenible</h2>
<p>Formació especialitzada per a empleats públics sobre conducció eficient i sostenible.</p>

<h3>Contingut del curs:</h3>
<ul>
  <li>🌱 Tècniques d'eco-driving</li>
  <li>🔧 Manteniment preventiu del vehicle</li>
  <li>📍 Planificació de rutes eficients</li>
  <li>⚡ Ús òptim de vehicles elèctrics</li>
  <li>📜 Certificació oficial IDAE</li>
</ul>

<h3>Format:</h3>
<ul>
  <li>📚 4 hores de teoria online</li>
  <li>🚗 4 hores de pràctica presencial</li>
  <li>📋 Avaluació final</li>
  <li>🏆 Certificat oficial</li>
</ul>

<h3>Beneficis:</h3>
<ul>
  <li>Reducció del 15-20% en consum de combustible</li>
  <li>Menor desgast del vehicle</li>
  <li>Conducció més segura</li>
  <li>Contribució al medi ambient</li>
</ul>`,
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800'
      ],
      price: 180,
      originalPrice: 250,
      currency: 'EUR',
      priceType: 'FIXED',
      companyId: company.id,
      categoryId: category.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      featured: false,
      contactMethod: 'EMAIL',
      contactEmail: 'formacio@teslacatalunya.cat',
      contactPhone: '933456790',
      location: 'Barcelona i online',
      remote: true,
      tags: ['formació', 'conducció eficient', 'sostenibilitat', 'eco-driving'],
      requirements: 'Permís de conduir vigent i experiència mínima de 2 anys',
      benefits: 'Certificació oficial, material didàctic inclòs, seguiment post-curs',
      duration: '2 setmanes (teoria online + pràctica presencial)',
    }
  });
  console.log(`✓ Oferta Curs: ${offer2.slug}`);

  // 6. CREAR CONFIGURACIONS GRUPALS
  console.log('\n⚙️ Creando configuraciones grupales...');

  const now = new Date();
  const registrationEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 días
  const serviceStart = new Date(registrationEnd.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después

  // Configuración para Tesla Model 3
  const config1 = await prisma.groupOfferConfig.create({
    data: {
      title: 'Tesla Model 3 - Configuración Grupal',
      slug: 'tesla-model-3-config',
      description: 'Configuración de compra grupal para Tesla Model 3 dirigida a empleats públics',
      shortDescription: 'Compra grupal Tesla Model 3 con descuentos progresivos',
      images: offer1.images,
      category: 'Automoció',
      tags: ['tesla', 'elèctric', 'grupal'],
      minParticipants: 50,
      maxParticipants: 100,
      currentCount: 0,
      originalPrice: 50000,
      groupPrice: 45000,
      savingsAmount: 5000,
      savingsPercent: 10.0,
      requiresDeposit: true,
      depositAmount: 2000,
      depositPercent: 4.44, // 2000/45000 * 100
      registrationStart: now,
      registrationEnd: registrationEnd,
      serviceStart: serviceStart,
      serviceEnd: new Date(serviceStart.getTime() + 90 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      publishedAt: now,
      companyId: company.id,
      contactEmail: 'ventas@teslacatalunya.cat',
      contactPhone: '933456789',
      location: 'Catalunya',
      address: 'Concessionaris Tesla arreu de Catalunya',
      isOnline: false,
      requirements: 'Ser empleat públic amb contracte indefinit o temporal >1 any',
      includes: 'Vehicle Tesla Model 3, carregador domèstic, instal·lació, formació',
      excludes: 'Assegurança, manteniment posterior al període de garantia',
      terms: 'Compra subjecta a aprovació de finançament si és necessari',
      cancellationPolicy: 'Cancel·lació gratuïta fins 48h abans de la confirmació final',
      refundPolicy: 'Reemborsament complet del dipòsit si no s\'assoleix el mínim',
      priority: 1,
      featured: true,
    }
  });
  console.log(`✓ Configuración Tesla: ${config1.title}`);

  // Configuración para Curs de Conducció
  const config2 = await prisma.groupOfferConfig.create({
    data: {
      title: 'Curs Conducció Eficient - Configuración Grupal',
      slug: 'curs-conduccio-eficient-config',
      description: 'Configuración grupal para curs de conducció eficient i sostenible',
      shortDescription: 'Formació grupal en conducció eficient amb certificació oficial',
      images: offer2.images,
      category: 'Formació',
      tags: ['formació', 'conducció', 'eficiència'],
      minParticipants: 20,
      maxParticipants: 50,
      currentCount: 0,
      originalPrice: 250,
      groupPrice: 180,
      savingsAmount: 70,
      savingsPercent: 28.0,
      requiresDeposit: false,
      depositAmount: null,
      depositPercent: null,
      registrationStart: now,
      registrationEnd: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      serviceStart: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      serviceEnd: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      publishedAt: now,
      companyId: company.id,
      contactEmail: 'formacio@teslacatalunya.cat',
      contactPhone: '933456790',
      location: 'Barcelona',
      address: 'Centre de Formació Tesla Catalunya - Carrer de la Tecnologia 45',
      isOnline: true,
      requirements: 'Permís de conduir vigent, experiència mínima 2 anys',
      includes: 'Formació teòrica i pràctica, material didàctic, certificació IDAE',
      excludes: 'Transport fins al centre, àpats durant la formació',
      terms: 'Assistència obligatòria al 100% de les sessions per obtenir el certificat',
      cancellationPolicy: 'Cancel·lació fins 7 dies abans sense penalització',
      refundPolicy: 'Reemborsament 100% si no s\'assoleix el mínim de participants',
      priority: 0,
      featured: false,
    }
  });
  console.log(`✓ Configuración Curs: ${config2.title}`);

  // 7. CREAR ALGUNOS PARTICIPANTES DE PRUEBA
  console.log('\n👥 Creando participantes de prueba...');

  // Participante 1 en Tesla
  const participant1 = await prisma.groupParticipant.create({
    data: {
      groupOfferId: config1.id,
      userId: empleado1.id,
      status: 'PENDING',
      contactName: 'Maria Garcia',
      contactEmail: 'empleado1@gencat.cat',
      contactPhone: '933111111',
      specialRequests: 'Preferència per color blau',
      totalAmount: 45000,
      paidAmount: 0,
      pendingAmount: 45000,
      registrationPaid: false,
      depositPaid: false,
      finalPaid: false,
    }
  });
  console.log(`✓ Participant Tesla: ${empleado1.name}`);

  // Participante 2 en Curs
  const participant2 = await prisma.groupParticipant.create({
    data: {
      groupOfferId: config2.id,
      userId: empleado2.id,
      status: 'CONFIRMED',
      contactName: 'Josep Martinez',
      contactEmail: 'empleado2@gencat.cat',
      contactPhone: '933222222',
      totalAmount: 180,
      paidAmount: 180,
      pendingAmount: 0,
      registrationPaid: true,
      registrationPaidAt: new Date(),
      depositPaid: false,
      finalPaid: true,
      finalPaidAt: new Date(),
    }
  });
  console.log(`✓ Participant Curs: ${empleado2.name}`);

  // Vincular la solicitud aprobada con su oferta grupal
  await prisma.groupOfferRequest.update({
    where: { id: request2.id },
    data: {
      groupOfferId: config2.id,
    }
  });

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('═══════════════════════════════════════');
  console.log('📧 USUARIOS DE PRUEBA:');
  console.log('═══════════════════════════════════════');
  console.log('Admin:     admin@lapublica.cat / Test1234!');
  console.log('Empresa:   empresa@teslacatalunya.cat / Test1234!');
  console.log('Empleado1: empleado1@gencat.cat / Test1234!');
  console.log('Empleado2: empleado2@gencat.cat / Test1234!');
  console.log('═══════════════════════════════════════');
  console.log('📊 DATOS CREADOS:');
  console.log('═══════════════════════════════════════');
  console.log('• 4 usuarios');
  console.log('• 1 empresa (Tesla Catalunya)');
  console.log('• 1 categoría (Automoció)');
  console.log('• 2 solicitudes de ofertas grupales');
  console.log('• 2 ofertas grupales');
  console.log('• 2 configuraciones grupales');
  console.log('• 2 participantes');
  console.log('═══════════════════════════════════════');
  console.log('🌐 Accede a Prisma Studio en: http://localhost:5559\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });