# 01 · Arquitectura General de La Pública
Versió definitiva – Novembre 2025

---

# 🏛️ 1. Introducció

**La Pública** és una plataforma digital B2B2C orientada a connectar empleats públics amb empreses col·laboradores, gestors comercials i serveis interns.  
Aquesta arquitectura defineix totes les normes, estructures i protocols que guien el desenvolupament, manteniment i escalabilitat de la plataforma.

Aquest document és la referència principal per a qualsevol desenvolupador, sistema IA o col·laborador.

---

# 🧱 2. Stack Tecnològic

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Next.js API Routes |
| Base de dades | PostgreSQL |
| ORM | Prisma |
| Autenticació | NextAuth |
| Estils | TailwindCSS |
| Infraestructura | Monorepo |
| IA | PúblicaKit IA |
| Contenidors | Docker |

---

# 📁 3. Estructura Global del Repositori

```
/frontend/                     ← Aplicació Next.js
/backend/                      ← API + serveis + negoci
/docs/arquitectura/            ← Documentació tècnica
.github/workflows/             ← CI/CD
.env                           ← Variables entorn
```

---

# 🧭 4. Arquitectura del Frontend

## 4.1 Directori principal
```
/frontend/app/
```

## 4.2 Rutes principals
```
/admin/                        ← Panell Administració (principal)
/dashboard/                    ← Portal empleats públics
/empresa/                      ← Portal empreses col·laboradores
/gestor-empreses/              ← CRM gestors comercials
```

---

# ✔ Normes crítiques del Frontend

## 4.3 `/admin` és l’únic panell d’administració principal
```
✔ /admin/empreses/
✘ /dashboard/admin/empreses/    ← Només vistes secundàries
```

## 4.4 Idioma per capa
- Frontend → **Català**
- Models i backend → **Anglès**
- APIs → Català permes

## 4.5 Paràmetres dinàmics únics
```
✔ /empresa/ofertes/[id]/
✘ /empresa/ofertes/[ofertaId]/   ← duplicació
```

## 4.6 Pàgina pare obligatòria
```
✔ /empresa/page.tsx
✔ /empresa/ofertes/page.tsx
✘ /empresa/ofertes/[id]/page.tsx  ← sense pare
```

---

# 🧩 5. Arquitectura del Backend

## 5.1 Estructura de mòduls

```
/backend/modules/
  /planes/                      ← Sistema de plans i límits
  /extras/                      ← Gestió d’extras
  /ia/                          ← Agents IA PúblicaKit
  /crm/                         ← CRM gestors comercials
  /facturacio/                  ← Factures, PDFs, pressupostos
  /empreses/                    ← Gestió d’empreses
  /logs/                        ← Registre de seguretat
```

## 5.2 Middlewares principals

```
/backend/middlewares/
  planLimits.ts                 ← Control de límits segons plan
  auth.ts                       ← Validació d’autenticació + rol
  logs.ts                       ← Registre d’esdeveniments
```

---

# 🔐 6. Protocols de Seguretat Operativa

## Abans de modificar qualsevol fitxer:

1. **Comprovar que estàs al projecte correcte**
```bash
pwd
```

2. **Verificar existència**
```bash
ls -la [ruta]
```

3. **Mostrar contingut**
```bash
cat [ruta/fitxer]
```

4. **Esperar confirmació explícita** (si treballes amb IA o col·laboradors)

---

## ❌ Prohibicions absolutes

- Crear fitxers sense validar que no existeixen  
- Dir que un fitxer no existeix sense `ls -la`  
- Modificar múltiples fitxers de cop  
- Accedir o modificar `/la_publica_comun*`  
- Duplicar rutes dinàmiques  
- Mesclar català/castellà a rutes frontend  

---

# 🗄 7. Models Principals (resum)

*Definits completament al document 03_MODELS.md.*

## User
```prisma
model User {
  id           String @id @default(cuid())
  email        String @unique
  primaryRole  UserRole
  company      Company?
}
```

## Company
```prisma
model Company {
  id            String @id @default(cuid())
  name          String
  planType      String
  limitOffers   Int
  teamLimit     Int
  iaLevel       String
  Presupuesto   Presupuesto[]
  SolicitudExtra SolicitudExtra[]
  Invoice       Invoice[]
}
```

---

# 🎭 8. Rols del Sistema

```ts
enum UserRole {
  SUPER_ADMIN,
  ADMIN,
  EMPLEAT_PUBLIC,
  EMPRESA,
  COMPANY_MANAGER,
  GESTOR_EMPRESAS
}
```

### Redireccions automàtiques

```
ADMIN / SUPER_ADMIN → /admin
EMPRESA             → /empresa
GESTOR_EMPRESAS     → /gestor-empreses
EMPLEAT_PUBLIC      → /dashboard
```

---

# 🧮 9. Sistema de Plans i Límits

*Document complet: 02_PLANES_I_EXTRAS.md*

| Pla | Ofertes | IA | Estadístiques | Visibilitat |
|-----|---------|----|----------------|--------------|
| **Pionera** | 5 | IA bàsica | bàsiques | prioritària |
| **Estàndard** | 5 | IA bàsica | bàsiques | normal |
| **Estratègic** | 10 | IA bàsica + màrqueting | ampliades | preferent |
| **Enterprise** | Il·limitades | IA Pro | Pro | màxima |

### El middleware `planLimits.ts` controla:
- límit d’ofertes  
- accés a IA (bàsica / Pro)  
- límit de membres d’equip  
- accés a estadístiques ampliades  
- accés a extras premium  
- visibilitat automàtica  

---

# 🤖 10. Arquitectura IA – PúblicaKit IA

Agents disponibles:

- **PúblicaComercial**
- **PúblicaMarketing**
- **PúblicaDatos**
- **PúblicaComunidad**
- **PúblicaGestión**

Ubicació:
```
/backend/modules/ia/
```

Document detallat: **07_IA_PUBLICAKIT.md**

---

# 💸 11. Facturació

Inclou:

- conversió pressupost → factura  
- PDFs automàtics  
- upgrades/downgrades de plans  
- integració amb Stripe / PayPal  
- historial complet d’empreses  

Document complet: **08_FACTURACIO.md**

---

# 📊 12. CRM Gestors Comercials

Rutes principals:

```
/gestor-empreses/crm-dashboard
/gestor-empreses/leads
/gestor-empreses/pipeline
/gestor-empreses/agenda
```

Funcions:

- gestió de leads  
- seguiment empresarial  
- aprovació de sol·licituds d’extras  
- agenda de gestions  
- KPIs comercials  

Document complet: **06_CRM_GESTORS.md**

---

# 🌐 13. Sistema Editorial i Visibilitat

Inclou:
- insercions dinàmiques al blog  
- recomanacions IA  
- SmartLinks amb tracking  
- banners automàtics  
- prioritat de visibilitat per plan  

---

# 🧪 14. Checklist abans de fer commit

- ✔ `npm run build` frontend  
- ✔ `npm run build` backend  
- ✔ Validació de rutes  
- ✔ Validació de planLimits  
- ✔ Revisió d’idiomes  
- ✔ Sense duplicats  
- ✔ Documentació actualitzada  

---

# 🆘 15. Protocol d’Emergència Git

```
git log --oneline -10
git stash
git reset --hard [COMMIT_OK]
```

---

# 📌 16. Informació final

**Directori actiu:**  
`/Users/maneldor/Desktop/la_publica_new`

**Prohibits:**  
`la_publica_comun*`

**Última actualització:**  
Novembre 2025

---

# ✔ Fi del document
Document únic, final i llest per integrar.


