# Arquitectura La Pública - Guía Definitiva

## 🎯 Información del Proyecto

**Nombre:** La Pública
**Tipo:** Plataforma B2B2C para empleados públicos
**Stack:** Next.js 14 + Node.js + PostgreSQL
**Monorepo:** Frontend + Backend

---

## 📁 Estructura de Directorios

### Frontend (`/frontend/app/`)

#### Rutas Principales
```
/admin/                     ← Panel de administración completo
  ├── anuncios/
  ├── empresas/
  ├── usuarios/
  └── ... (20+ módulos)

/dashboard/                 ← Portal empleados públicos
  ├── admin/               ← Dashboard admin (SECUNDARIO)
  ├── facturacio/          ← Sistema facturación
  ├── forums/
  ├── blogs/
  └── ... (15+ módulos)

/empresa/                   ← Portal empresas
  ├── extras/
  ├── presupuestos/
  ├── solicitudes/
  └── perfil/

/gestor-empreses/           ← Portal gestores comerciales
  ├── crm-dashboard/
  ├── leads/
  ├── pipeline/
  └── agenda/
```

---

## 🚨 REGLAS CRÍTICAS

### REGLA 1: Admin Principal en `/admin`
```
✅ CORRECTO: /admin/presupuestos/
❌ PROHIBIDO: /dashboard/admin/presupuestos/
```

**Excepción:** `/dashboard/admin/` puede tener vistas alternativas pero **NO reemplaza** `/admin/`

---

### REGLA 2: Idioma Consistente

**Frontend (rutas públicas):** Catalán
```
✅ /empresa/presupuestos/
✅ /dashboard/facturacio/
```

**Backend (modelos internos):** Inglés
```
✅ model Company { }
✅ model Invoice { }
```

**APIs:** Pueden ser catalán
```
✅ /api/empresa/presupuestos/
✅ /api/admin/facturacio/
```

---

### REGLA 3: Parámetros Dinámicos Únicos

En cada carpeta, **UN SOLO** nombre de parámetro:
```
✅ CORRECTO:
  /presupuestos/[id]/
  /presupuestos/[id]/aprobar/

❌ PROHIBIDO:
  /presupuestos/[id]/
  /presupuestos/[presupuestoId]/  ← Error Next.js
```

---

### REGLA 4: Páginas Padre Obligatorias

Si creas subcarpetas, crea la página padre:
```
✅ CORRECTO:
  /ruta/page.tsx
  /ruta/subruta/page.tsx

❌ PROHIBIDO:
  /ruta/subruta/page.tsx    ← Sin padre = 404
```

---

## 🔒 Protocolos de Seguridad

### ANTES de Cualquier Cambio

1. **Verificar directorio:**
```bash
   pwd
   # Debe mostrar: /Users/maneldor/Desktop/la_publica_new
```

2. **Verificar archivo existe:**
```bash
   ls -la [ruta/archivo]
```

3. **Mostrar contenido actual:**
```bash
   cat [ruta/archivo]
```

4. **Esperar confirmación explícita**

---

### PROHIBICIONES ABSOLUTAS

❌ **NUNCA:**
- Decir que archivos no existen sin `ls -la`
- Crear archivos sin verificar que no existen
- Acceder a `/la_publica_comun*` (otros proyectos)
- Modificar archivos sin mostrar contenido actual
- Hacer múltiples cambios sin confirmación entre cada uno

---

## 📊 Mapa de Modelos Backend

### Modelos Principales
```prisma
User
  ├─ primaryRole: UserRole
  ├─ Company? (relación inversa vía userId)
  └─ Employee?

Company
  ├─ userId: String @unique
  ├─ name: String
  ├─ planType: String
  └─ Relaciones:
      ├─ Presupuesto[]
      ├─ SolicitudExtra[]
      ├─ EmpresaExtra[]
      └─ Invoice[]

Presupuesto
  ├─ empresaId: String
  ├─ estado: String
  ├─ totalAPagar: Float
  └─ items: PresupuestoItem[]

FeatureExtra
  ├─ nombre: String
  ├─ precio: Float
  └─ categoria: String

SolicitudExtra
  ├─ empresaId: String
  ├─ usuarioId: String
  ├─ extrasIds: String[]
  └─ estado: EstadoSolicitud
```

---

## 🎭 Roles del Sistema
```typescript
enum UserRole {
  SUPER_ADMIN           // Acceso total
  ADMIN                 // Panel /admin
  EMPLEADO_PUBLICO      // Portal /dashboard
  EMPRESA               // Portal /empresa
  COMPANY_MANAGER       // Gestión empresa
  GESTOR_EMPRESAS       // Portal /gestor-empreses
}
```

---

## 🔐 Rutas de Autenticación
```typescript
// NextAuth configurado en /lib/auth.ts

Redirecciones por rol:
- ADMIN → /admin
- EMPRESA → /empresa
- GESTOR_EMPRESAS → /gestor-empreses
- EMPLEADO_PUBLICO → /dashboard
```

---

## ✅ Checklist Pre-Commit

Antes de hacer `git commit`:

- [ ] ¿Ejecuté `npm run build` en backend? (sin errores)
- [ ] ¿Ejecuté `npm run build` en frontend? (sin errores)
- [ ] ¿Probé la funcionalidad en navegador?
- [ ] ¿Verifiqué que no hay duplicados de rutas?
- [ ] ¿Seguí las convenciones de idioma?
- [ ] ¿Documenté cambios importantes?

---

## 🆘 En Caso de Emergencia

### Si el sistema se rompe:

1. **NO PÁNICO**
2. **Verificar último commit funcional:**
```bash
   git log --oneline -10
```
3. **Volver al último estado limpio:**
```bash
   git stash
   git reset --hard [COMMIT_BUENO]
```
4. **Rehacer cambios con cuidado**

---

## 📞 Información de Contacto

**Último commit estable:** c5ebf7d (5 nov 2025, 12:12)
**Proyecto activo:** `/Users/maneldor/Desktop/la_publica_new`
**Proyectos inactivos:** `la_publica_comun*` (NO TOCAR)

---

*Documento creado: 10 noviembre 2025*
*Última actualización: 10 noviembre 2025*