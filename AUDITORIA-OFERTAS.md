# 🔍 AUDITORÍA COMPLETA - MÓDULO OFERTAS

**Fecha:** 15 Noviembre 2024
**Objetivo:** Preparar implementación del Módulo de Ofertas

---

## 📊 BASE DE DATOS

### Modelo Oferta
- ❌ **NO EXISTE** en schema.prisma
- **Campos requeridos:**
  - id, title, description, price, images
  - companyId, categoryId, status, featured
  - createdAt, updatedAt, publishedAt
- **Relaciones pendientes:**
  - Company (muchas ofertas por empresa)
  - OfferCategory (categorización)

### Modelo OfferCategory
- ❌ **NO EXISTE**
- **Necesario crear categorías:**
  - Tecnología, Marketing, Consultoría, Servicios, etc.

### Límites por Plan
- ✅ **YA CONFIGURADO** en PlanConfig:
  - **PIONERES:** 50 ofertas activas, 10 destacadas
  - **ESTÀNDARD:** 100 ofertas activas, 20 destacadas
  - **ESTRATÈGIC:** 200 ofertas activas, 50 destacadas
  - **ENTERPRISE:** Ilimitadas ofertas activas y destacadas

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

### Frontend - Páginas
- ❌ `/app/empresa/ofertas/` **NO EXISTE**
- ✅ `/app/admin/ofertas/` SÍ EXISTE:
  - `/admin/ofertas/crear/`
  - `/admin/ofertas/listar/`

### APIs
- ❌ `/api/empresa/ofertas/` **NO EXISTE**
- ✅ APIs empresa disponibles:
  - `/api/empresa/extras/` ✅
  - `/api/empresa/limits/` ✅
  - `/api/empresa/plan/` ✅
  - `/api/empresa/presupuestos/` ✅

### Menú de Navegación
- ❌ **NO HAY** link "Ofertas" en sidebar empresa
- ✅ **SÍ EXISTE** permiso `canManageOffers` en gestión de miembros

---

## 🎨 SISTEMA DE IMÁGENES
- ❌ **NO CONFIGURADO** upload de imágenes
- ❌ **NO HAY** integración con Cloudinary/similar
- ✅ Existe `/public/images/` básico
- **Ubicación uploads:** Pendiente implementar

---

## 📈 DATOS ACTUALES
- **Ofertas en BD:** 0 registros (modelo no existe)
- **Categorías:** 0 (modelo no existe)
- **Límites configurados:** ✅ En todos los planes

---

## ⚙️ APIS DISPONIBLES
- ❌ GET `/api/empresa/ofertas` - No existe
- ❌ POST `/api/empresa/ofertas` - No existe
- ❌ PUT `/api/empresa/ofertas/[id]` - No existe
- ❌ DELETE `/api/empresa/ofertas/[id]` - No existe
- ❌ GET `/api/ofertas/public` - No existe (vista pública)

---

## ✅ LO QUE ESTÁ LISTO

### ✅ Infraestructura Base
- Sistema de autenticación empresa ✅
- Gestión de límites por plan ✅
- Sistema de permisos de miembros ✅
- Estructura de carpetas `/empresa` ✅
- APIs base funcionando ✅

### ✅ Límites Configurados
- Valores por plan definidos en seed ✅
- API `/api/empresa/limits` funcionando ✅
- Widget de límites en dashboard ✅

### ✅ Referencia Admin
- Páginas admin ofertas como referencia ✅
- Permisos `canManageOffers` definidos ✅

---

## ❌ LO QUE FALTA IMPLEMENTAR

### ❌ Modelo de Datos Completo
1. **Modelo Offer** en Prisma schema
2. **Modelo OfferCategory** para categorización
3. **Migraciones** de base de datos
4. **Seed de categorías** predefinidas

### ❌ Backend APIs
1. **CRUD completo** `/api/empresa/ofertas/`
2. **Validaciones** de límites por plan
3. **Upload de imágenes** para ofertas
4. **APIs públicas** para mostrar ofertas

### ❌ Frontend Empresa
1. **Páginas** `/empresa/ofertas/`
   - Lista de ofertas
   - Crear oferta
   - Editar oferta
   - Vista previa
2. **Componentes** reutilizables
3. **Formularios** con validación
4. **Sistema de imágenes**

### ❌ Menú y Navegación
1. **Link "Ofertas"** en sidebar empresa
2. **Badge contador** de ofertas activas
3. **Navegación** entre páginas

### ❌ Sistema de Imágenes
1. **Upload component** para imágenes
2. **Integración** Cloudinary/Uploadcare
3. **Optimización** y redimensionado
4. **Galería** de imágenes por oferta

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### FASE 1: Modelo de Datos (Prioridad Alta)
1. **Crear modelo Offer** en schema.prisma
2. **Crear modelo OfferCategory**
3. **Ejecutar migración** `npx prisma migrate dev`
4. **Crear seed** de categorías básicas

### FASE 2: APIs Backend (Prioridad Alta)
1. **Implementar** `/api/empresa/ofertas/route.ts` (GET, POST)
2. **Implementar** `/api/empresa/ofertas/[id]/route.ts` (GET, PUT, DELETE)
3. **Validar límites** por plan en creación
4. **Testing** de endpoints

### FASE 3: Frontend Básico (Prioridad Media)
1. **Crear** `/empresa/ofertas/page.tsx` (lista)
2. **Crear** `/empresa/ofertas/crear/page.tsx`
3. **Agregar link** al sidebar empresa
4. **Componente tabla** de ofertas

### FASE 4: Sistema de Imágenes (Prioridad Media)
1. **Configurar** servicio de upload (Cloudinary)
2. **Componente** upload de imágenes
3. **Integrar** en formulario crear/editar

### FASE 5: Funcionalidades Avanzadas (Prioridad Baja)
1. **Vista pública** de ofertas
2. **Búsqueda y filtros**
3. **Analytics** de ofertas
4. **Compartir en redes**

---

## 📝 NOTAS ADICIONALES

### 🔧 Consideraciones Técnicas
- **Usar estructura similar** a `/empresa/extras/` como referencia
- **Reutilizar componentes** existentes (tabla, formularios)
- **Seguir patrón** de APIs empresa existentes
- **Mantener consistencia** con límites por plan

### 🎨 UX/UI
- **Integrar** con diseño actual del dashboard
- **Usar iconografía** consistente (📦 para ofertas)
- **Estados claros** (borrador, publicada, destacada)
- **Feedback visual** cuando se alcanzan límites

### 🔒 Seguridad
- **Validar** permisos de empresa por oferta
- **Limitar** según plan de suscripción
- **Sanitizar** contenido de ofertas
- **Rate limiting** en creación

### 📊 Métricas Futuras
- **Vistas** por oferta
- **Clics** y conversiones
- **Ofertas más populares**
- **Rendimiento por categoría**

---

## 🚀 ESTIMACIÓN DE DESARROLLO

- **FASE 1 (Modelo):** 1-2 días
- **FASE 2 (APIs):** 3-4 días
- **FASE 3 (Frontend básico):** 5-7 días
- **FASE 4 (Imágenes):** 2-3 días
- **FASE 5 (Avanzado):** 5-10 días

**TOTAL ESTIMADO:** 16-26 días de desarrollo

---

## ✅ ESTADO ACTUAL: PREPARADO PARA COMENZAR

El proyecto tiene **excelente base** para implementar el módulo de ofertas:
- ✅ Infraestructura sólida
- ✅ Patrones establecidos
- ✅ Límites configurados
- ✅ Ejemplos de referencia

**Recomendación:** Comenzar con FASE 1 (Modelo de Datos) inmediatamente.