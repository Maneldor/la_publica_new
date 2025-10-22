import { PrismaClient, UserRole, AdministrationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCourses } from './seeds/courses.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. VERIFICAR/CREAR COMUNIDAD CATALUNYA
    console.log('\n🏛️ Verificando comunidad Catalunya...');
    let catalunya = await prisma.comunidadConfig.findUnique({
      where: { slug: 'catalunya' }
    });

    if (!catalunya) {
      catalunya = await prisma.comunidadConfig.create({
        data: {
          slug: 'catalunya',
          nombre: 'Catalunya',
          nombreLocal: 'Catalunya',
          idiomas: 'ca,es',
          idiomaDefault: 'ca',
          dominioBase: 'catalunya.lapublica.es',
          activa: true,
          descripcion: 'Comunitat autònoma de Catalunya',
          configuracion: JSON.stringify({
            features: ['groups', 'forums', 'content'],
            theme: 'default'
          })
        }
      });
      console.log('✅ Comunidad Catalunya creada');
    } else {
      console.log('ℹ️ Comunidad Catalunya ya existe');
    }

    // 2. CREAR USUARIOS
    console.log('\n👥 Creando usuarios...');

    // Usuario Admin
    const adminEmail = 'admin@lapublica.es';
    let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('admin123456', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedAdminPassword,
          primaryRole: UserRole.ADMIN,
          isActive: true,
          isEmailVerified: true,
          employee: {
            create: {
              firstName: 'Admin',
              lastName: 'LaPublica',
              community: 'Catalunya',
              administrationType: AdministrationType.CENTRAL,
              bio: 'Administrador principal de La Pública',
              canBeGroupAdmin: true,
              canBeGroupModerator: true,
              canBeContentManager: true
            }
          }
        }
      });
      console.log('✅ Usuario admin creado');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    // Usuario Empleado Principal
    const empleadoEmail = 'empleado@lapublica.cat';
    let empleadoUser = await prisma.user.findUnique({ where: { email: empleadoEmail } });

    if (!empleadoUser) {
      const hashedEmpleadoPassword = await bcrypt.hash('empleado123', 10);
      empleadoUser = await prisma.user.create({
        data: {
          email: empleadoEmail,
          password: hashedEmpleadoPassword,
          primaryRole: UserRole.EMPLEADO_PUBLICO,
          isActive: true,
          isEmailVerified: true,
          employee: {
            create: {
              firstName: 'Joan',
              lastName: 'Martínez',
              nick: 'jmartinez',
              jobTitle: 'Tècnic Superior',
              department: 'Tecnologies de la Informació',
              organization: 'Generalitat de Catalunya',
              community: 'Catalunya',
              administrationType: AdministrationType.AUTONOMICA,
              province: 'Barcelona',
              city: 'Barcelona',
              bio: 'Funcionari públic a la Generalitat de Catalunya especialitzat en innovació digital i administració electrònica.',
              skills: JSON.stringify(['Administració digital', 'Gestió de projectes', 'Innovació pública']),
              canBeGroupAdmin: true
            }
          }
        }
      });
      console.log('✅ Usuario empleado principal creado');
    } else {
      console.log('ℹ️ Usuario empleado principal ya existe');
    }

    // 10 Empleados adicionales
    const empleadosData = [
      {
        firstName: 'Maria',
        lastName: 'García',
        nick: 'mgarcia',
        jobTitle: 'Cap de Departament',
        department: 'Recursos Humans',
        bio: 'Responsable de la gestió del talent i desenvolupament professional en l\'àmbit públic.',
        skills: ['Gestió de persones', 'Formació', 'Legislació laboral']
      },
      {
        firstName: 'Pere',
        lastName: 'López',
        nick: 'plopez',
        jobTitle: 'Analista de Polítiques',
        department: 'Planificació Estratègica',
        bio: 'Especialista en l\'anàlisi i disseny de polítiques públiques innovadores.',
        skills: ['Anàlisi de dades', 'Polítiques públiques', 'Investigació social']
      },
      {
        firstName: 'Carme',
        lastName: 'Vilà',
        nick: 'cvila',
        jobTitle: 'Tècnica de Comunicació',
        department: 'Comunicació i Premsa',
        bio: 'Gestiono la comunicació institucional i les relacions amb els mitjans.',
        skills: ['Comunicació digital', 'Relacions públiques', 'Gestió de crisis']
      },
      {
        firstName: 'Jordi',
        lastName: 'Puig',
        nick: 'jpuig',
        jobTitle: 'Advocat Assessor',
        department: 'Assessoria Jurídica',
        bio: 'Assessorament jurídic en dret administratiu i procediments legals.',
        skills: ['Dret administratiu', 'Procediments legals', 'Contractació pública']
      },
      {
        firstName: 'Anna',
        lastName: 'Roca',
        nick: 'aroca',
        jobTitle: 'Coordinadora Ambiental',
        department: 'Medi Ambient',
        bio: 'Coordinació de projectes de sostenibilitat i protecció del medi ambient.',
        skills: ['Sostenibilitat', 'Gestió ambiental', 'Energies renovables']
      },
      {
        firstName: 'Marc',
        lastName: 'Serrano',
        nick: 'mserrano',
        jobTitle: 'Economista',
        department: 'Hisenda i Finances',
        bio: 'Anàlisi econòmica i gestió pressupostària per a l\'optimització de recursos públics.',
        skills: ['Anàlisi econòmica', 'Gestió pressupostària', 'Fiscalitat']
      },
      {
        firstName: 'Núria',
        lastName: 'Ferrer',
        nick: 'nferrer',
        jobTitle: 'Treballadora Social',
        department: 'Serveis Socials',
        bio: 'Atenció social directa i coordinació de programes d\'inclusió social.',
        skills: ['Treball social', 'Inclusió social', 'Atenció a la dependència']
      },
      {
        firstName: 'David',
        lastName: 'Molina',
        nick: 'dmolina',
        jobTitle: 'Enginyer de Sistemes',
        department: 'Infraestructures TIC',
        bio: 'Manteniment i millora de les infraestructures tecnològiques de l\'administració.',
        skills: ['Sistemes informàtics', 'Xarxes', 'Ciberseguretat']
      },
      {
        firstName: 'Laura',
        lastName: 'Vendrell',
        nick: 'lvendrell',
        jobTitle: 'Gestora Cultural',
        department: 'Cultura i Educació',
        bio: 'Promoció cultural i coordinació d\'activitats educatives i culturals.',
        skills: ['Gestió cultural', 'Organització d\'esdeveniments', 'Patrimoni cultural']
      },
      {
        firstName: 'Oriol',
        lastName: 'Camps',
        nick: 'ocamps',
        jobTitle: 'Inspector d\'Obres',
        department: 'Urbanisme i Obres',
        bio: 'Supervisió i control de qualitat en obres públiques i projectes urbanístics.',
        skills: ['Construcció', 'Urbanisme', 'Control de qualitat']
      }
    ];

    const empleadosCreados = [];
    for (let i = 0; i < empleadosData.length; i++) {
      const empleadoData = empleadosData[i];
      const email = `empleado${i + 1}@lapublica.cat`;

      let existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('empleado123', 10);
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            primaryRole: UserRole.EMPLEADO_PUBLICO,
            isActive: true,
            isEmailVerified: true,
            employee: {
              create: {
                firstName: empleadoData.firstName,
                lastName: empleadoData.lastName,
                nick: empleadoData.nick,
                jobTitle: empleadoData.jobTitle,
                department: empleadoData.department,
                organization: 'Generalitat de Catalunya',
                community: 'Catalunya',
                administrationType: Math.random() > 0.5 ? AdministrationType.AUTONOMICA : AdministrationType.LOCAL,
                province: 'Barcelona',
                city: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'][Math.floor(Math.random() * 4)],
                bio: empleadoData.bio,
                skills: JSON.stringify(empleadoData.skills),
                canBeGroupAdmin: Math.random() > 0.7
              }
            }
          },
          include: { employee: true }
        });
        empleadosCreados.push(newUser);
        console.log(`✅ Empleado ${empleadoData.firstName} ${empleadoData.lastName} creado`);
      } else {
        empleadosCreados.push(existingUser);
        console.log(`ℹ️ Empleado ${email} ya existe`);
      }
    }

    // 3. CREAR GRUPOS
    console.log('\n👥 Creando grupos...');

    const gruposData = [
      {
        name: 'Polítiques Públiques',
        description: 'Espai de debat i col·laboració per al disseny i implementació de polítiques públiques innovadores i eficaces.',
        type: 'PUBLICO',
        category: 'Política i Govern'
      },
      {
        name: 'Innovació i Tecnologia',
        description: 'Grup dedicat a l\'exploració de noves tecnologies i metodologies per millorar l\'eficiència de l\'administració pública.',
        type: 'PUBLICO',
        category: 'Tecnologia'
      },
      {
        name: 'Administració Local',
        description: 'Coordinació i suport entre professionals de l\'administració local catalana.',
        type: 'PUBLICO',
        category: 'Administració'
      },
      {
        name: 'Recursos Humans',
        description: 'Gestió del talent, formació i desenvolupament professional en l\'àmbit públic.',
        type: 'PRIVADO',
        category: 'RRHH'
      },
      {
        name: 'Sostenibilitat i Medi Ambient',
        description: 'Iniciatives i projectes per a un futur més sostenible des de l\'administració pública.',
        type: 'PUBLICO',
        category: 'Medi Ambient'
      }
    ];

    const gruposCreados = [];
    for (const grupoData of gruposData) {
      let existingGroup = await prisma.group.findFirst({
        where: { name: grupoData.name }
      });

      if (!existingGroup) {
        const newGroup = await prisma.group.create({
          data: {
            name: grupoData.name,
            description: grupoData.description,
            type: grupoData.type,
            category: grupoData.category,
            creatorId: adminUser.id,
            comunidadSlug: catalunya.slug,
            configuration: JSON.stringify({
              allowPosts: true,
              requireApproval: grupoData.type === 'PRIVADO',
              maxMembers: grupoData.type === 'PRIVADO' ? 50 : null
            })
          }
        });

        // Añadir miembros aleatorios
        const miembrosAAgregar = [adminUser, empleadoUser, ...empleadosCreados.slice(0, Math.floor(Math.random() * 6) + 3)];
        for (const miembro of miembrosAAgregar) {
          await prisma.groupMember.create({
            data: {
              groupId: newGroup.id,
              userId: miembro.id,
              role: miembro.id === adminUser.id ? 'admin' : 'member',
              status: 'active'
            }
          });
        }

        gruposCreados.push(newGroup);
        console.log(`✅ Grupo "${grupoData.name}" creado con ${miembrosAAgregar.length} miembros`);
      } else {
        gruposCreados.push(existingGroup);
        console.log(`ℹ️ Grupo "${grupoData.name}" ya existe`);
      }
    }

    // 4. CREAR POSTS
    console.log('\n📝 Creando posts...');

    const postsData = [
      {
        content: 'Estic treballant en la implementació del nou sistema de gestió documental. Algú ha tingut experiència amb sistemes similars? Quins són els principals reptes que heu trobat?',
        type: 'texto',
        isPinned: true
      },
      {
        content: 'Excel·lent sessió de formació sobre administració electrònica aquesta setmana! Han presentat les noves funcionalitats del portal de tràmits. Molt útil per millorar l\'atenció ciutadana.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Comparteixo el link a la nova guia de bones pràctiques en atenció ciutadana que ha publicat la Generalitat. Molt recomanable per a tots els companys de primera línia: https://gencat.cat/guia-atencio',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Qüestió urgent: necessito informació sobre el nou procediment de contractació pública. Hi ha alguna normativa específica que hagi canviat recentment?',
        type: 'texto',
        isPinned: true
      },
      {
        content: 'Felicitats a l\'equip de TIC pel llançament del nou portal intern! La interfície és molt més intuïtiva. Gràcies per facilitar-nos la feina diària.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Aquest mes hem reduït el temps mitjà de resolució d\'expedients en un 25%. Compartint l\'experiència: la clau ha estat la coordinació entre departaments i l\'ús d\'eines digitals.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Recordatori: demà tenim la sessió formativa sobre la nova Llei de Transparència. És obligatòria per a tot el personal que gestiona informació pública.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Algú coneix experiències d\'èxit en projectes de participació ciutadana? Estem dissenyant un procés participatiu i ens agradaria conèixer casos pràctics.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Avui hem celebrat el primer "Dia de la Innovació Pública" al nostre departament. Presentades 12 propostes de millora dels processos interns. L\'esperit d\'innovació està molt viu!',
        type: 'texto',
        isPinned: true
      },
      {
        content: 'Problema tècnic resolt! Per a qui tingui incidències amb l\'accés al sistema de gestió, el problema estava en la configuració de proxy. Ja funciona correctament.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Recomanació lectora: "Digital Government: Technology and Public Sector Performance" - Excel·lent per entendre l\'impacte de la tecnologia en l\'administració pública.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Algú més ha notat millores en la comunicació interdepartamental després de la implementació de les noves eines col·laboratives? A nosaltres ens ha ajudat molt.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Reflexió del dia: la digitalització no és només tecnologia, és també un canvi cultural. Com gestionem el canvi en les nostres organitzacions?',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Nou protocol d\'emergències aprovat! Ja està disponible a la intranet. Recordeu revisar-lo i compartir-lo amb els vostres equips.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Èxit total en la jornada de portes obertes! Més de 200 ciutadans han visitat les nostres instal·lacions. La transparència i proximitat són clau per recuperar la confiança.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Pregunta per als experts en contractació: amb la nova normativa europea, quin impacte tindrà en els nostres processos de licitació? Algú ha fet ja alguna formació?',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Compartint experiència: hem implementat un sistema de suggeriments ciutadans online. En 2 mesos, 150 propostes rebudes, 30 ja implementades. La participació funciona!',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Avís important: la reunió de coordinació d\'aquesta tarda es fa per videoconferència. Link disponible al calendari corporatiu.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Celebrem el reconeixement europeu al nostre projecte de ciutat intel·ligent! Orgullosos de formar part d\'una administració innovadora.',
        type: 'texto',
        isPinned: false
      },
      {
        content: 'Consulta: estem preparant un pla de formació en competències digitals. Quines àrees considereu més prioritàries per al vostre desenvolupament professional?',
        type: 'texto',
        isPinned: false
      }
    ];

    // Crear posts de forma realista (últims 30 dies)
    const todosLosUsuarios = [adminUser, empleadoUser, ...empleadosCreados];
    const postsCreados = [];

    for (let i = 0; i < postsData.length; i++) {
      const postData = postsData[i];
      const autorAleatorio = todosLosUsuarios[Math.floor(Math.random() * todosLosUsuarios.length)];

      // Fecha aleatoria en los últimos 30 días
      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - Math.floor(Math.random() * 30));

      const newPost = await prisma.post.create({
        data: {
          userId: autorAleatorio.id,
          content: postData.content,
          type: postData.type,
          isPinned: postData.isPinned,
          comunidadSlug: catalunya.slug,
          idioma: 'ca',
          viewsCount: Math.floor(Math.random() * 100) + 10,
          sharesCount: Math.floor(Math.random() * 20),
          createdAt: fechaCreacion
        }
      });

      // Añadir likes aleatorios
      const numLikes = Math.floor(Math.random() * 50) + 1;
      const usuariosParaLikes = todosLosUsuarios.sort(() => 0.5 - Math.random()).slice(0, numLikes);

      for (const usuario of usuariosParaLikes) {
        await prisma.postLike.create({
          data: {
            postId: newPost.id,
            userId: usuario.id,
            emoji: ['👍', '❤️', '👏', '💡'][Math.floor(Math.random() * 4)]
          }
        });
      }

      postsCreados.push(newPost);
      console.log(`✅ Post creado con ${numLikes} likes`);
    }

    // 5. CREAR COMENTARIOS
    console.log('\n💬 Creando comentarios...');

    const comentariosData = [
      'Molt interessant! Pots compartir més detalls?',
      'Totalment d\'acord amb la teva proposta.',
      'Gràcies per compartir aquesta informació.',
      'He tingut una experiència similar al meu departament.',
      'Excel·lent iniciativa! Com podem participar?',
      'Això podria solucionar molts dels nostres problemes actuals.',
      'Necessitem més formació en aquest tema.',
      'Perfecte! Ja ho estem implementant aquí.',
      'Molt útil aquesta informació, gràcies!',
      'Podríem organitzar una reunió per parlar-ne?',
      'Fantàstic treball! Felicitats a l\'equip.',
      'Teniu algun manual o guia que pugueu compartir?',
      'La nostra experiència ha estat molt positiva també.',
      'Això és exactament el que necessitàvem!',
      'Molt bona reflexió, comparteixo la visió.',
      'Podríem aplicar-ho al nostre àmbit també.',
      'Gràcies per mantenir-nos informats.',
      'Excel·lent exemple de col·laboració.',
      'La innovació és clau per al futur de l\'administració.',
      'Molt orgullós de formar part d\'aquest equip!'
    ];

    for (let i = 0; i < 50; i++) {
      const postAleatorio = postsCreados[Math.floor(Math.random() * postsCreados.length)];
      const autorAleatorio = todosLosUsuarios[Math.floor(Math.random() * todosLosUsuarios.length)];
      const comentarioAleatorio = comentariosData[Math.floor(Math.random() * comentariosData.length)];

      // Fecha posterior al post
      const fechaComentario = new Date(postAleatorio.createdAt);
      fechaComentario.setHours(fechaComentario.getHours() + Math.floor(Math.random() * 48));

      await prisma.postComment.create({
        data: {
          postId: postAleatorio.id,
          userId: autorAleatorio.id,
          content: comentarioAleatorio,
          createdAt: fechaComentario
        }
      });
    }

    console.log('✅ 50 comentarios creados');

    // 6. CREAR CURSOS
    console.log('\n🎓 Creando cursos de formación...');
    await seedCourses();

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   🏛️ Comunidad: Catalunya`);
    console.log(`   👤 Admin: ${adminEmail} (password: admin123456)`);
    console.log(`   👥 Empleados: ${empleadosCreados.length + 1} usuarios`);
    console.log(`   🏢 Grupos: ${gruposCreados.length} grupos`);
    console.log(`   📝 Posts: ${postsCreados.length} posts`);
    console.log(`   💬 Comentarios: 50 comentarios`);
    console.log(`   🎓 Cursos: 22 cursos de formación`);
    console.log('\n🚀 ¡La base de datos está lista para usar!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });