import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEines() {
  console.log('🌱 Creant categories Eines...')

  // Categories
  const categories = await Promise.all([
    prisma.einesCategory.upsert({
      where: { slug: 'speeches' },
      update: {},
      create: {
        name: 'Speeches (Trucades)',
        slug: 'speeches',
        description: 'Guions i arguments per trucades telefòniques',
        icon: 'mdi-phone-outline',
        order: 1
      }
    }),
    prisma.einesCategory.upsert({
      where: { slug: 'correus' },
      update: {},
      create: {
        name: 'Plantilles Correu',
        slug: 'correus',
        description: 'Plantilles d\'email per diferents situacions',
        icon: 'mdi-email-outline',
        order: 2
      }
    }),
    prisma.einesCategory.upsert({
      where: { slug: 'informacio' },
      update: {},
      create: {
        name: 'Informació Serveis',
        slug: 'informacio',
        description: 'Documentació sobre plans, avantatges i serveis',
        icon: 'mdi-file-document-outline',
        order: 3
      }
    }),
    prisma.einesCategory.upsert({
      where: { slug: 'documents' },
      update: {},
      create: {
        name: 'Documents',
        slug: 'documents',
        description: 'Contractes, checklists i altres documents',
        icon: 'mdi-folder-outline',
        order: 4
      }
    })
  ])

  console.log('✅ Categories creades:', categories.length)

  // Recursos
  const speechCategory = categories[0]
  const correusCategory = categories[1]
  const infoCategory = categories[2]
  const docsCategory = categories[3]

  const resources = await Promise.all([
    // ========== SPEECHES ==========
    prisma.einesResource.upsert({
      where: { slug: 'speech-trucada-inicial' },
      update: {},
      create: {
        categoryId: speechCategory.id,
        title: 'Trucada inicial de presentació',
        slug: 'speech-trucada-inicial',
        summary: 'Guió per a la primera trucada de presentació a una empresa nova.',
        content: `# Speech: Trucada Inicial de Presentació

## Obertura
"Bon dia/Bona tarda, em dic {{nomGestor}} i truco de La Pública.

Podria parlar amb el/la responsable de recursos humans o beneficis per a empleats?"

## Si contactem amb la persona adequada
"Perfecte, {{nomContacte}}. El motiu de la meva trucada és molt breu:

Som La Pública, una plataforma exclusiva per a empleats públics de Catalunya que ofereix descomptes i ofertes especials en comerços i serveis locals.

Estem treballant amb empreses com la seva, {{nomEmpresa}}, per oferir als seus empleats accés a avantatges exclusius sense cap cost per a l'empresa.

Si no té inconvenient, m'agradaria enviar-li un correu amb tota la informació detallada. Seria possible?"

## Si accepta
"Fantàstic! Li enviaré la informació a {{email}}. El contactaré la setmana vinent per si té alguna pregunta.

Moltes gràcies pel seu temps, {{nomContacte}}. Que tingui un bon dia!"

## Si no està interessat
"Entenc perfectament. Si en algun moment canvia d'opinió o vol més informació, pot contactar-nos a info@lapublica.cat.

Moltes gràcies pel seu temps. Que tingui un bon dia!"

## Punts clau a recordar
- Ser breu i directe (màxim 2 minuts)
- No pressionar, només informar
- Aconseguir el permís per enviar correu
- Programar seguiment

## Variables a substituir
- {{nomGestor}}: El teu nom
- {{nomContacte}}: Nom de la persona amb qui parles
- {{nomEmpresa}}: Nom de l'empresa
- {{email}}: Email de contacte`,
        tags: ['trucada', 'presentació', 'inicial', 'nou lead'],
        isTemplate: true
      }
    }),

    prisma.einesResource.upsert({
      where: { slug: 'speech-trucada-contacte' },
      update: {},
      create: {
        categoryId: speechCategory.id,
        title: 'Trucada de contacte (seguiment)',
        slug: 'speech-trucada-contacte',
        summary: 'Guió per a trucades de seguiment després d\'enviar informació.',
        content: `# Speech: Trucada de Contacte (Seguiment)

## Obertura
"Bon dia/Bona tarda, {{nomContacte}}. Sóc {{nomGestor}} de La Pública.

Li truco per fer seguiment del correu que li vaig enviar fa uns dies sobre la nostra plataforma d'avantatges per a empleats públics.

Ha tingut oportunitat de revisar-lo?"

## Si l'ha revisat
"Fantàstic! Té alguna pregunta sobre com funciona o els avantatges que oferim?

[ESCOLTAR I RESPONDRE PREGUNTES]

El que li proposo és que programem una petita demostració de 15 minuts on li puc ensenyar la plataforma i com els seus empleats podrien beneficiar-se. Quan li aniria bé?"

## Si no l'ha revisat
"Cap problema, sé que estem tots molt ocupats. Li resumeixo molt breument:

La Pública és una plataforma que ofereix descomptes exclusius en comerços locals per a empleats públics. L'empresa no té cap cost, i els seus empleats accedeixen a ofertes especials.

Li sembla bé que programem 15 minuts la setmana vinent per explicar-li amb més detall?"

## Tancament amb cita
"Perfecte! Queda programat pel {{dia}} a les {{hora}}. Li enviaré una confirmació per correu.

Moltes gràcies, {{nomContacte}}. Fins aviat!"

## Variables
- {{nomGestor}}, {{nomContacte}}, {{dia}}, {{hora}}`,
        tags: ['trucada', 'seguiment', 'contacte'],
        isTemplate: true
      }
    }),

    // ========== CORREUS ==========
    prisma.einesResource.upsert({
      where: { slug: 'plantilla-correu-presentacio' },
      update: {},
      create: {
        categoryId: correusCategory.id,
        title: 'Correu de presentació inicial',
        slug: 'plantilla-correu-presentacio',
        summary: 'Plantilla de correu per enviar després de la primera trucada.',
        content: `# Plantilla: Correu de Presentació

**Assumpte:** Avantatges exclusius per als empleats de {{nomEmpresa}} - La Pública

---

Benvolgut/da {{nomContacte}},

Gràcies per la seva atenció durant la nostra conversa telefònica d'avui.

Com li comentava, **La Pública** és una plataforma exclusiva que connecta empleats públics de Catalunya amb comerços i serveis locals que ofereixen descomptes i avantatges especials.

## Per què unir-se a La Pública?

✅ **Sense cost per a l'empresa** - La Pública és gratuïta per a les empreses adherides
✅ **Avantatges exclusius** - Descomptes que van del 10% al 50% en productes i serveis
✅ **Comerços locals** - Suport al teixit comercial de proximitat
✅ **Fàcil d'usar** - Accés via web i app mòbil
✅ **Benefici pels empleats** - Un valor afegit sense inversió

## Propers passos

Si està interessat/da, estaria encantat de programar una breu demostració de 15 minuts on li podré mostrar:
- Com funciona la plataforma
- Exemples d'ofertes disponibles
- El procés d'alta (molt senzill!)

**Respongui aquest correu o truqui'm al {{telefonGestor}}** per acordar una data.

Cordialment,

**{{nomGestor}}**
Gestor Comercial - La Pública
📞 {{telefonGestor}}
📧 {{emailGestor}}

---
*La Pública - Avantatges exclusius per a empleats públics*`,
        tags: ['correu', 'presentació', 'inicial'],
        isTemplate: true
      }
    }),

    // ========== INFORMACIÓ ==========
    prisma.einesResource.upsert({
      where: { slug: 'info-plans-comparativa' },
      update: {},
      create: {
        categoryId: infoCategory.id,
        title: 'Comparativa de Plans',
        slug: 'info-plans-comparativa',
        summary: 'Informació detallada sobre els diferents plans disponibles.',
        content: `# Comparativa de Plans La Pública

## Plans Disponibles

### 🌟 Pla PIONERES (Gratuït)
- **Preu:** 0€/mes
- **Ideal per:** Empreses petites que volen provar
- **Inclou:**
  - Perfil bàsic a la plataforma
  - 1 oferta activa
  - Accés al directori

### 📊 Pla ESTÀNDARD
- **Preu:** 49€/mes
- **Ideal per:** Empreses amb presència local consolidada
- **Inclou:**
  - Tot de Pioneres
  - Fins a 5 ofertes actives
  - Estadístiques bàsiques
  - Suport prioritari

### 🚀 Pla ESTRATÈGIC
- **Preu:** 99€/mes
- **Ideal per:** Empreses que volen maximitzar visibilitat
- **Inclou:**
  - Tot d'Estàndard
  - Ofertes il·limitades
  - Destacat a la home
  - Campanyes especials
  - Gestor dedicat

### 🏆 Pla ENTERPRISE
- **Preu:** Personalitzat
- **Ideal per:** Grans empreses i cadenes
- **Inclou:**
  - Tot d'Estratègic
  - Múltiples localitzacions
  - API d'integració
  - Informes personalitzats
  - Account manager dedicat

## Recomanacions segons tipus d'empresa

| Tipus d'empresa | Pla recomanat |
|-----------------|---------------|
| Comerç local petit | PIONERES o ESTÀNDARD |
| Cadena local | ESTRATÈGIC |
| Serveis professionals | ESTÀNDARD |
| Franquícies | ENTERPRISE |
| Sector salut/benestar | ESTRATÈGIC |

## Període de prova
Tots els plans tenen **6 mesos de prova gratuïta** per a noves empreses.`,
        tags: ['plans', 'preus', 'comparativa'],
        isTemplate: false
      }
    }),

    // ========== DOCUMENTS ==========
    prisma.einesResource.upsert({
      where: { slug: 'checklist-dades-lead' },
      update: {},
      create: {
        categoryId: docsCategory.id,
        title: 'Checklist dades lead',
        slug: 'checklist-dades-lead',
        summary: 'Llista de verificació de dades necessàries abans d\'enviar a CRM.',
        content: `# Checklist: Dades del Lead

Abans d'enviar el lead a verificació CRM, assegura't que tens totes aquestes dades:

## Dades de l'empresa
- [ ] Nom comercial complet
- [ ] CIF/NIF verificat
- [ ] Adreça completa (carrer, número, CP, ciutat)
- [ ] Telèfon principal
- [ ] Email de contacte
- [ ] Pàgina web (si en té)
- [ ] Sector d'activitat

## Dades del contacte
- [ ] Nom i cognoms
- [ ] Càrrec a l'empresa
- [ ] Telèfon directe
- [ ] Email personal/professional
- [ ] Millor hora per contactar

## Informació comercial
- [ ] Pla d'interès identificat
- [ ] Pressupost confirmat
- [ ] Timing de decisió
- [ ] Competidors actuals (si n'hi ha)

## Historial de contactes
- [ ] Primera trucada realitzada
- [ ] Correu de presentació enviat
- [ ] Notes de seguiment actualitzades

## Validacions
- [ ] Totes les dades són coherents
- [ ] No hi ha duplicats al sistema
- [ ] El lead compleix criteris de qualificació`,
        tags: ['checklist', 'verificació', 'dades'],
        isTemplate: false
      }
    }),

    prisma.einesResource.upsert({
      where: { slug: 'guia-qualificacio-leads' },
      update: {},
      create: {
        categoryId: docsCategory.id,
        title: 'Guia de qualificació de leads',
        slug: 'guia-qualificacio-leads',
        summary: 'Criteris per determinar si un lead està qualificat.',
        content: `# Guia de Qualificació de Leads

## Criteris BANT

### B - Budget (Pressupost)
L'empresa té pressupost per invertir en el servei?
- ✅ Té pressupost assignat
- ⚠️ Ha de sol·licitar aprovació
- ❌ No té pressupost

### A - Authority (Autoritat)
Estem parlant amb qui pren la decisió?
- ✅ Decisor directe
- ⚠️ Influenciador important
- ❌ No té poder de decisió

### N - Need (Necessitat)
L'empresa té una necessitat real?
- ✅ Necessitat clara i urgent
- ⚠️ Necessitat futura
- ❌ No té necessitat identificada

### T - Timing (Temps)
Quan prendran la decisió?
- ✅ En els propers 30 dies
- ⚠️ En 1-3 mesos
- ❌ Sense data prevista

## Puntuació mínima per qualificar
- Mínim 3 criteris amb ✅
- O 2 criteris amb ✅ i 2 amb ⚠️

## Accions segons qualificació

### Lead qualificat (3-4 ✅)
→ Avançar a QUALIFIED
→ Preparar proposta comercial

### Lead potencial (2 ✅ + 2 ⚠️)
→ Mantenir en CONTACTED
→ Programar seguiment mensual

### Lead fred (menys de 2 ✅)
→ Mantenir en nurturing
→ Enviar contingut periòdicament`,
        tags: ['qualificació', 'bant', 'guia'],
        isTemplate: false
      }
    }),

    prisma.einesResource.upsert({
      where: { slug: 'contracte-tipus-empresa' },
      update: {},
      create: {
        categoryId: docsCategory.id,
        title: 'Contracte tipus empresa',
        slug: 'contracte-tipus-empresa',
        summary: 'Model de contracte estàndard per a noves empreses.',
        content: `# Contracte d'Adhesió a La Pública

**CONTRACTE DE COL·LABORACIÓ COMERCIAL**

Entre:

**LA PÚBLICA PLATFORM SL** (en endavant, "La Pública")
CIF: B-XXXXXXXX
Domicili: [Adreça]

I

**{{nomEmpresa}}** (en endavant, "l'Empresa")
CIF: {{cifEmpresa}}
Domicili: {{adrecaEmpresa}}
Representada per: {{nomRepresentant}}

## CLÀUSULES

### Primera - Objecte
L'Empresa s'adhereix a la plataforma La Pública per oferir productes i/o serveis amb condicions especials als usuaris de la plataforma.

### Segona - Pla contractat
L'Empresa contracta el pla **{{pla}}** amb les condicions següents:
- Quota mensual: {{quotaMensual}}€
- Període de prova: {{diesProva}} dies
- Forma de pagament: {{formaPagament}}

### Tercera - Obligacions de l'Empresa
- Mantenir les ofertes publicades vigents
- Respectar els descomptes anunciats
- Atendre correctament els usuaris de La Pública

### Quarta - Durada
Aquest contracte té una durada inicial de 12 mesos, renovable automàticament.

### Cinquena - Resolució
Qualsevol de les parts pot resoldre el contracte amb 30 dies d'antelació.

---

Signat a {{ciutat}}, a {{data}}

Per La Pública: ________________

Per l'Empresa: ________________`,
        tags: ['contracte', 'legal', 'adhesió'],
        isTemplate: true
      }
    }),

    prisma.einesResource.upsert({
      where: { slug: 'plantilla-proposta-comercial' },
      update: {},
      create: {
        categoryId: correusCategory.id,
        title: 'Plantilla proposta comercial',
        slug: 'plantilla-proposta-comercial',
        summary: 'Document de proposta comercial formal amb preus i condicions.',
        content: `# PROPOSTA COMERCIAL

**Per a:** {{nomEmpresa}}
**Data:** {{dataActual}}
**Vàlida fins:** {{dataVenciment}}

---

Estimat/da {{nomContacte}},

Gràcies per l'interès mostrat en La Pública. Ens complau presentar-li la nostra proposta comercial personalitzada per {{nomEmpresa}}.

## 🎯 OBJECTIU

Oferir als empleats de {{nomEmpresa}} accés exclusiu a una plataforma de descomptes i avantatges en comerços locals, millorant el seu benestar i satisfacció laboral.

## 📋 SOLUCIÓ PROPOSADA

### Pla Recomanat: {{planRecomanat}}

**Característiques incloses:**
{{caracteristiquesPla}}

**Preu:** {{preuMensual}}€/mes

## 🎁 OFERTA ESPECIAL

- **6 mesos de prova GRATUÏTS**
- Configuració i alta sense cost
- Formació inicial inclosa
- Suport personalitzat durant l'onboarding

## 💰 INVERSIÓ

| Concepte | Import |
|----------|--------|
| Alta i configuració | 0€ (gratuït) |
| 6 primers mesos | 0€ (prova gratuïta) |
| A partir del mes 7 | {{preuMensual}}€/mes |

**Total primer any:** {{totalPrimerAny}}€

## ✅ BENEFICIS PER {{nomEmpresa}}

- Millora del clima laboral
- Reconeixement com a empresa que cuida els empleats
- Sense inversió inicial
- Cancel·lació sense penalització

## 📞 PROPERS PASSOS

1. Acceptació de la proposta
2. Signatura del contracte
3. Configuració del perfil empresarial
4. Comunicació als empleats
5. Inici del període de prova

**Questa proposta és vàlida fins al {{dataVenciment}}.**

---

Espero la seva resposta i quedo a la seva disposició per a qualsevol dubte.

Cordialment,

**{{nomGestor}}**
Consultor Comercial - La Pública
📞 {{telefonGestor}}
📧 {{emailGestor}}`,
        tags: ['proposta', 'comercial', 'document'],
        isTemplate: true
      }
    })
  ])

  console.log('✅ Recursos creats:', resources.length)
}

seedEines()
  .catch(console.error)
  .finally(() => prisma.$disconnect())