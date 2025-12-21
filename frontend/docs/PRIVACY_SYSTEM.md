# Sistema de Privacitat - La Pública

## Índex

1. [Visió General](#visió-general)
2. [Arquitectura](#arquitectura)
3. [Models de Dades](#models-de-dades)
4. [Categories Sensibles](#categories-sensibles)
5. [Configuració de Privacitat d'Usuari](#configuració-de-privacitat-dusuari)
6. [Auto-detecció de Categories](#auto-detecció-de-categories)
7. [Integració amb Grups Professionals](#integració-amb-grups-professionals)
8. [APIs Disponibles](#apis-disponibles)
9. [Components Frontend](#components-frontend)
10. [Panell d'Administració](#panell-dadministració)
11. [Auditoria](#auditoria)
12. [Guia d'Ús](#guia-dús)

---

## Visió General

El sistema de privacitat de La Pública permet als usuaris controlar quina informació personal és visible per a altres usuaris. A més, implementa **categories sensibles** per a col·lectius professionals que requereixen protecció addicional (policies, funcionaris de presons, etc.).

### Característiques principals:

- Control granular de camps del perfil
- Categories sensibles amb restriccions forçades
- Auto-detecció de categories per posició/departament
- Integració amb grups professionals
- Auditoria completa de canvis
- Panell d'administració

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Wizard Perfil    │  Member Cards    │  Pàgina Perfil           │
│  (Step Privacitat)│  (amb privacitat)│  (camps filtrats)        │
└────────┬──────────┴────────┬─────────┴────────┬─────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                          APIs                                    │
├─────────────────────────────────────────────────────────────────┤
│  /api/user/privacy         - Privacitat pròpia                  │
│  /api/user/privacy/detect  - Detectar categoria                 │
│  /api/user/privacy/assign  - Assignar categoria                 │
│  /api/members              - Llista membres (amb privacitat)    │
│  /api/users/[nick]         - Perfil públic (amb privacitat)     │
│  /api/admin/privacy/*      - Administració                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BASE DE DADES                             │
├─────────────────────────────────────────────────────────────────┤
│  UserPrivacySettings    │  SensitiveJobCategory                 │
│  PrivacyAuditLog        │  User (amb relacions)                 │
│  Group (amb categoria)  │  GroupMember                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Models de Dades

### UserPrivacySettings

Emmagatzema les preferències de privacitat de cada usuari.

```prisma
model UserPrivacySettings {
  id                String   @id @default(cuid())
  userId            String   @unique

  // Camps controlables
  showRealName      Boolean  @default(true)
  showPosition      Boolean  @default(true)
  showDepartment    Boolean  @default(true)
  showBio           Boolean  @default(true)
  showLocation      Boolean  @default(true)
  showPhone         Boolean  @default(false)  // Privat per defecte
  showEmail         Boolean  @default(false)  // Privat per defecte
  showSocialLinks   Boolean  @default(true)
  showJoinedDate    Boolean  @default(true)
  showLastActive    Boolean  @default(true)
  showConnections   Boolean  @default(true)
  showGroups        Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}
```

### SensitiveJobCategory

Defineix categories professionals amb restriccions especials.

```prisma
model SensitiveJobCategory {
  id                   String   @id @default(cuid())
  name                 String   @unique
  slug                 String   @unique
  description          String?
  icon                 String?
  color                String?

  // Patrons de detecció (arrays de strings)
  positionPatterns     String[]
  departmentPatterns   String[]

  // Restriccions forçades (no es poden desactivar)
  forceHidePosition    Boolean  @default(false)
  forceHideDepartment  Boolean  @default(false)
  forceHideBio         Boolean  @default(false)
  forceHideLocation    Boolean  @default(false)
  forceHidePhone       Boolean  @default(true)
  forceHideEmail       Boolean  @default(true)
  forceHideGroups      Boolean  @default(false)

  isActive             Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  users                User[]
  groups               Group[]  @relation("GroupSensitiveCategory")
}
```

### PrivacyAuditLog

Registra tots els canvis de privacitat per auditoria.

```prisma
model PrivacyAuditLog {
  id            String   @id @default(cuid())
  userId        String
  changedById   String
  changedByRole String   // 'USER', 'ADMIN', 'SYSTEM'
  fieldChanged  String
  oldValue      String?
  newValue      String?
  reason        String?
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id])
}
```

---

## Categories Sensibles

### Categories predefinides:

| Categoria | Descripció | Restriccions |
|-----------|------------|--------------|
| **Policia Local** | Agents de policia municipal | Amaga posició, departament, ubicació |
| **Mossos d'Esquadra** | Cos de policia autonòmic | Amaga posició, departament, ubicació |
| **Policia Nacional** | Cos de policia estatal | Amaga posició, departament, ubicació |
| **Guàrdia Civil** | Institut armat | Amaga posició, departament, ubicació |
| **Institucions Penitenciàries** | Funcionaris de presons | Amaga tot menys nom |
| **Serveis d'Intel·ligència** | CNI i similars | Màxima restricció |

### Patrons de detecció:

Cada categoria té patrons per detectar automàticament si un usuari hi pertany:

```json
{
  "name": "Policia Local",
  "positionPatterns": [
    "Agent", "Policia", "Caporal", "Sergent",
    "Sotsinspector", "Inspector", "Intendent", "Comissari"
  ],
  "departmentPatterns": [
    "Policia Local", "Seguretat Ciutadana",
    "Guàrdia Urbana", "Policia Municipal"
  ]
}
```

---

## Configuració de Privacitat d'Usuari

### Com funciona:

1. **Preferències de l'usuari**: L'usuari pot activar/desactivar camps al wizard o configuració
2. **Restriccions forçades**: Si pertany a una categoria sensible, alguns camps NO es poden mostrar
3. **Privacitat efectiva**: Combinació de preferències + restriccions forçades

### Càlcul de privacitat efectiva:

```typescript
const effectivePrivacy = {
  showPosition:
    (userPrivacy?.showPosition ?? true) &&
    !category?.forceHidePosition,
  showDepartment:
    (userPrivacy?.showDepartment ?? true) &&
    !category?.forceHideDepartment,
  showBio:
    (userPrivacy?.showBio ?? true) &&
    !category?.forceHideBio,
  showLocation:
    (userPrivacy?.showLocation ?? true) &&
    !category?.forceHideLocation,
  showPhone:
    (userPrivacy?.showPhone ?? false) &&  // Privat per defecte
    !category?.forceHidePhone,
  showEmail:
    (userPrivacy?.showEmail ?? false) &&  // Privat per defecte
    !category?.forceHideEmail,
  showGroups:
    (userPrivacy?.showGroups ?? true) &&
    !category?.forceHideGroups,
}
```

---

## Auto-detecció de Categories

### Flux al Wizard:

```
1. Usuari edita perfil (Step Professional)
2. Introdueix posició: "Agent de Policia Local"
3. Sistema crida /api/user/privacy/detect-category
4. API busca coincidències amb patrons
5. Si troba coincidència → Mostra SensitiveCategoryAlert
6. Usuari accepta → Crida /api/user/privacy/assign-category
7. Sistema assigna categoria + restriccions
```

### Flux amb Grups:

```
1. Usuari sol·licita unir-se a grup PROFESSIONAL
2. Admin aprova sol·licitud
3. Sistema comprova si grup té categoria sensible
4. Si té → Assigna automàticament la categoria a l'usuari
5. S'apliquen les restriccions de privacitat
```

### Algorisme de detecció:

```typescript
// Normalitzar text per a comparació (eliminar accents, minúscules)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Buscar coincidències
for (const category of categories) {
  for (const pattern of category.positionPatterns) {
    const normalizedPattern = normalizeText(pattern)
    if (normalizedPosition.includes(normalizedPattern) ||
        normalizedPattern.includes(normalizedPosition)) {
      return { category, matchedOn: 'position', matchedPattern: pattern }
    }
  }
}
```

---

## Integració amb Grups Professionals

### Tipus de grups:

| Tipus | Descripció | Límit |
|-------|------------|-------|
| PUBLIC | Obert a tothom | Il·limitat |
| PRIVATE | Cal sol·licitar accés | Il·limitat |
| SECRET | Només per invitació | Il·limitat |
| PROFESSIONAL | Grup laboral | **1 per usuari** |

### Vincle amb categories sensibles:

Un grup PROFESSIONAL pot tenir una `sensitiveJobCategoryId` associada. Quan un usuari s'uneix:

1. S'assigna automàticament la categoria a l'usuari
2. S'actualitza `hasSystemRestrictions = true`
3. S'apliquen les restriccions de privacitat
4. Es crea log d'auditoria

### Flux d'aprovació:

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Usuari     │────>│  Sol·licitud    │────>│     Admin        │
│  sol·licita  │     │  (AdminAlert)   │     │    aprova        │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                     ┌────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  Transaction:                                                 │
│  1. Afegir usuari al grup                                    │
│  2. Si grup té categoria sensible:                           │
│     - Assignar categoria a usuari                            │
│     - Actualitzar UserPrivacySettings                        │
│     - Crear PrivacyAuditLog                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## APIs Disponibles

### Usuari

| Endpoint | Mètode | Descripció |
|----------|--------|------------|
| `/api/user/privacy` | GET | Obtenir configuració pròpia |
| `/api/user/privacy` | PATCH | Actualitzar configuració |
| `/api/user/privacy/detect-category` | POST | Detectar categoria per posició/dept |
| `/api/user/privacy/assign-category` | POST | Acceptar categoria detectada |
| `/api/user/privacy/assign-category` | DELETE | Admin elimina categoria d'usuari |

### Membres i Perfils

| Endpoint | Mètode | Descripció |
|----------|--------|------------|
| `/api/members` | GET | Llista membres amb privacitat aplicada |
| `/api/users/[nick]` | GET | Perfil públic amb privacitat aplicada |

### Grups

| Endpoint | Mètode | Descripció |
|----------|--------|------------|
| `/api/groups/[id]/join` | POST | Unir-se a grup (assigna categoria si cal) |
| `/api/admin/alerts/[id]` | PATCH | Aprovar sol·licitud (assigna categoria) |

### Administració

| Endpoint | Mètode | Descripció |
|----------|--------|------------|
| `/api/admin/sensitive-categories` | GET | Llistar categories sensibles |
| `/api/admin/privacy/categories` | GET | Llistar categories (detallat) |
| `/api/admin/privacy/categories` | POST | Crear categoria |
| `/api/admin/privacy/categories/[id]` | PUT | Actualitzar categoria |
| `/api/admin/privacy/categories/[id]` | DELETE | Eliminar categoria |
| `/api/admin/privacy/audit` | GET | Logs d'auditoria |

---

## Components Frontend

### SensitiveCategoryAlert

Modal que apareix quan es detecta una categoria sensible:

```tsx
<SensitiveCategoryAlert
  category={detectedCategory}
  matchedOn="position"
  matchedPattern="Agent"
  onAccept={handleAcceptCategory}
  onDecline={handleDeclineCategory}
  isLoading={isAssigning}
/>
```

**Característiques:**
- Mostra nom i descripció de la categoria
- Indica quin camp ha coincidit
- Llista els camps que s'ocultaran
- Botons per acceptar o rebutjar

### MemberCard (amb privacitat)

Mostra informació dels membres respectant la seva privacitat:

```tsx
// Si showDepartment: false
// → No mostra departament, mostra icona 🔒

// Si hasSystemRestrictions: true
// → Mostra badge de restricció
```

### Pàgina de Perfil (amb privacitat)

Filtra camps segons configuració:

```tsx
// Si és el propi perfil → Mostra tot
// Si és altre usuari → Aplica privacitat efectiva

// Resposta de l'API inclou:
{
  isOwnProfile: boolean,
  privacyApplied: boolean,
  privacySettings: { ... },  // Només si privacyApplied
  hasSystemRestrictions: boolean,
}
```

---

## Panell d'Administració

### Ubicació: `/admin/usuaris/privacitat`

### Seccions:

1. **Categories**: CRUD de categories sensibles
   - Crear noves categories
   - Editar patrons de detecció
   - Definir restriccions forçades
   - Activar/desactivar categories

2. **Auditoria**: Historial de canvis
   - Filtrar per usuari, data, tipus de canvi
   - Veure qui va fer cada canvi
   - Exportar logs

### GroupModal (amb selector de categoria)

Quan es crea/edita un grup PROFESSIONAL:

```tsx
// Mostra selector de categoria sensible
// Si es selecciona una categoria:
// - Els membres que s'uneixin rebran la categoria automàticament
// - S'aplicaran les restriccions de privacitat
```

---

## Auditoria

### Què es registra:

- Canvis de configuració de privacitat
- Assignació/eliminació de categories sensibles
- Qui va fer el canvi (usuari, admin, sistema)
- Data i hora
- Valor anterior i nou
- Motiu del canvi

### Exemple de log:

```json
{
  "userId": "user123",
  "changedById": "admin456",
  "changedByRole": "ADMIN",
  "fieldChanged": "sensitiveJobCategory",
  "oldValue": null,
  "newValue": "Policia Local",
  "reason": "Assignada automàticament en aprovar sol·licitud per unir-se al grup 'Policia Local Barcelona'",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Tipus de canvis registrats:

| Camp | Descripció |
|------|------------|
| `sensitiveJobCategory` | Assignació/eliminació de categoria |
| `showPosition` | Canvi de visibilitat de posició |
| `showDepartment` | Canvi de visibilitat de departament |
| `showBio` | Canvi de visibilitat de biografia |
| `showLocation` | Canvi de visibilitat d'ubicació |
| `showPhone` | Canvi de visibilitat de telèfon |
| `showEmail` | Canvi de visibilitat d'email |
| `showGroups` | Canvi de visibilitat de grups |

---

## Guia d'Ús

### Per a Usuaris

1. **Configurar privacitat**: Ves a Perfil → Wizard → Pas de Privacitat
2. **Veure què és visible**: Els camps amb icona de cadenat estan ocults per a altres
3. **Categories sensibles**: Si pertanys a un col·lectiu sensible, alguns camps s'ocultaran automàticament i no es podran canviar

### Per a Administradors

1. **Gestionar categories**: Admin → Grups → Modal de grup → Categoria sensible
2. **Veure auditoria**: Logs disponibles a la base de dades (PrivacyAuditLog)
3. **Vincular grups**: Al crear/editar grup PROFESSIONAL, seleccionar categoria sensible
4. **Eliminar categoria d'usuari**: Només via API DELETE a `/api/user/privacy/assign-category`

### Per a Desenvolupadors

1. **Aplicar privacitat a noves pàgines**:

```typescript
// Incloure privacySettings a la query
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    privacySettings: true,
    sensitiveJobCategory: true,
  }
})

// Calcular privacitat efectiva
const effectivePrivacy = {
  showPosition:
    (user.privacySettings?.showPosition ?? true) &&
    !user.sensitiveJobCategory?.forceHidePosition,
  // ... etc
}

// Filtrar dades segons privacitat
const filteredData = {
  position: effectivePrivacy.showPosition ? user.position : null,
  // ... etc
}
```

2. **Afegir nous camps de privacitat**:
   - Afegir camp `show*` a `UserPrivacySettings` (schema.prisma)
   - Afegir `forceHide*` a `SensitiveJobCategory` si cal
   - Executar `prisma migrate dev`
   - Actualitzar APIs (`/api/members`, `/api/users/[nick]`, etc.)
   - Actualitzar components frontend

3. **Crear nova categoria sensible**:

```typescript
await prisma.sensitiveJobCategory.create({
  data: {
    name: 'Nova Categoria',
    slug: 'nova-categoria',
    description: 'Descripció de la categoria',
    icon: '🛡️',
    color: '#3B82F6',
    positionPatterns: ['Patró1', 'Patró2'],
    departmentPatterns: ['Dept1', 'Dept2'],
    forceHidePosition: true,
    forceHideDepartment: true,
    forceHideLocation: true,
  }
})
```

---

## Consideracions de Seguretat

**Important**:

- Les restriccions forçades NO es poden desactivar per l'usuari
- Els admins poden veure tots els camps (per gestió)
- L'usuari sempre veu el seu propi perfil complet
- Els logs d'auditoria NO es poden eliminar
- Les dades sensibles MAI s'envien al frontend si estan ocultes
- Totes les operacions es fan dins de transaccions

---

## Preguntes Freqüents

**P: Puc desactivar les restriccions de la meva categoria?**
R: No. Les restriccions forçades per categories sensibles són obligatòries per protegir la teva identitat professional.

**P: Com sé si pertanyo a una categoria sensible?**
R: El sistema t'avisarà automàticament quan introdueixis la teva posició/departament, o quan t'uneixis a un grup professional.

**P: Un admin pot veure la meva informació oculta?**
R: Sí, els administradors tenen accés per gestió, però tots els accessos queden registrats a l'auditoria.

**P: Puc canviar de categoria sensible?**
R: Només un administrador pot eliminar o canviar la teva categoria sensible.

**P: Què passa si m'uneixo a un grup professional amb categoria?**
R: Se t'assignarà automàticament la categoria del grup i s'aplicaran les restriccions de privacitat corresponents.

**P: Les meves dades s'eliminen quan s'oculten?**
R: No. Les dades romanen a la base de dades, però no s'envien al frontend quan estan ocultes per altres usuaris.

---

*Documentació actualitzada: Desembre 2024*
*Versió: 1.0*
