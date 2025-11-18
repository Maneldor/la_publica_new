# 🧪 TESTING CHECKLIST - LA PÚBLICA

## Fecha: _______________
## Tester: _______________
## Versión: 1.0.0

---

## 🚀 PRE-TESTING SETUP

- [ ] Servidor ejecutándose en http://localhost:3000
- [ ] Base de datos PostgreSQL funcionando
- [ ] Scripts de usuarios ejecutados correctamente
- [ ] Health check ejecutado: `node scripts/health-check.js`
- [ ] Logs del servidor monitoreados

---

## 🔐 AUTENTICACIÓN Y USUARIOS

### Super Admin (super.admin@lapublica.cat / superadmin123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a /admin
- [ ] Sesión persistente
- [ ] Logout funciona

### Admin Normal (admin@lapublica.cat / admin123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a /admin
- [ ] Acceso completo al panel admin
- [ ] Logout funciona

### Empleado Público (laura.garcia@generalitat.cat / empleat123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a /dashboard
- [ ] Dashboard carga correctamente
- [ ] Logout funciona

### Gestor La Pública (maria.garcia@lapublica.cat / gestora123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a gestor panel
- [ ] Panel gestor accesible
- [ ] Logout funciona

### Empresa Owner (joan.perez@empresadeprova.cat / owner123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a /empresa
- [ ] Panel empresa accesible
- [ ] Logout funciona

### Empresa Member (anna.marti@empresadeprova.cat / member123)
- [ ] Login desde página principal
- [ ] Login rápido funciona
- [ ] Redirige correctamente a /empresa
- [ ] Permisos de member funcionan
- [ ] Logout funciona

---

## 👑 PANEL SUPER ADMIN

### Dashboard Admin
- [ ] Métricas cargan correctamente
- [ ] Gráficos se renderizan
- [ ] Datos en tiempo real funcionan
- [ ] Navegación entre secciones

### Audit Logs
- [ ] Lista de logs carga
- [ ] Filtros por fecha funcionan
- [ ] Filtros por usuario funcionan
- [ ] Filtros por acción funcionan
- [ ] Paginación funciona
- [ ] Búsqueda por término funciona
- [ ] Exportar logs funciona
- [ ] Auto-refresh funciona

### Gestión de Usuarios
- [ ] Lista usuarios carga
- [ ] Crear nuevo usuario
- [ ] Editar usuario existente
- [ ] Activar/Desactivar usuario
- [ ] Cambiar rol de usuario
- [ ] Búsqueda de usuarios
- [ ] Filtros de usuarios

### Gestión de Empresas
- [ ] Lista empresas carga
- [ ] Aprobar empresa pendiente
- [ ] Rechazar empresa pendiente
- [ ] Ver detalles de empresa
- [ ] Editar datos empresa
- [ ] Desactivar empresa

---

## 🏢 PANEL EMPRESA

### Dashboard Empresa
- [ ] KPIs cargan correctamente
- [ ] Gráfico de conversiones
- [ ] Lista ofertas recientes
- [ ] Estadísticas de cupones

### Gestión de Ofertas
- [ ] Lista ofertas de la empresa
- [ ] Crear nueva oferta
- [ ] Editar oferta existente
- [ ] Cambiar estado de oferta
- [ ] Eliminar oferta
- [ ] Subir imágenes ofertas

### Gestión de Cupones
- [ ] Lista cupones activos
- [ ] Ver detalles de cupón
- [ ] Validar cupón manualmente
- [ ] Estadísticas de uso
- [ ] Exportar report cupones

---

## 👤 PANEL USUARIO (Empleado Público)

### Dashboard Usuario
- [ ] Ofertas destacadas cargan
- [ ] Navegación a categorías
- [ ] Buscador de ofertas
- [ ] Filtros funcionan

### Ofertas y Cupones
- [ ] Ver lista completa ofertas
- [ ] Filtrar por categoría
- [ ] Filtrar por ubicación
- [ ] Añadir a favoritos
- [ ] Generar cupón de oferta
- [ ] Ver cupones activos
- [ ] Ver historial cupones

### Perfil y Preferencias
- [ ] Ver datos personales
- [ ] Editar perfil
- [ ] Cambiar contraseña
- [ ] Configurar notificaciones
- [ ] Ver historial de actividad

### Notificaciones
- [ ] Recibir notificaciones in-app
- [ ] Marcar como leídas
- [ ] Ver historial notificaciones
- [ ] Configurar preferencias email

---

## 🔧 APIs Y ENDPOINTS

### APIs Públicas
- [ ] GET /api/ofertas (200)
- [ ] GET /api/ofertas?category=X (200)
- [ ] GET /api/ofertas/[id] (200)
- [ ] GET /api/categories (200)

### APIs Autenticadas (requieren login)
- [ ] GET /api/admin/dashboard (401 sin auth, 200 con admin)
- [ ] GET /api/admin/logs (401 sin auth, 200 con admin)
- [ ] GET /api/user/profile (401 sin auth, 200 con user)
- [ ] GET /api/empresa/dashboard (401 sin auth, 200 con empresa)

### APIs de Cupones
- [ ] POST /api/cupones/generate (requiere auth)
- [ ] POST /api/cupones/validate (requiere auth empresa)
- [ ] GET /api/cupones/my (requiere auth usuario)

---

## 📱 RESPONSIVE DESIGN

### Desktop (1920x1080)
- [ ] Página principal
- [ ] Panel admin
- [ ] Panel empresa
- [ ] Panel usuario
- [ ] Formularios

### Tablet (768x1024)
- [ ] Página principal
- [ ] Panel admin responsive
- [ ] Panel empresa responsive
- [ ] Panel usuario responsive
- [ ] Navegación mobile

### Mobile (375x667)
- [ ] Página principal mobile
- [ ] Login mobile
- [ ] Dashboard mobile
- [ ] Menú hamburguesa
- [ ] Formularios mobile

---

## ⚡ PERFORMANCE

### Tiempos de Carga
- [ ] Homepage < 3s
- [ ] Dashboard Admin < 5s (38 queries)
- [ ] Login < 2s
- [ ] APIs < 1s

### Optimizaciones
- [ ] Queries paralelas funcionan
- [ ] Paginación implementada
- [ ] Auto-refresh configurado
- [ ] Imágenes optimizadas

---

## 🔒 SEGURIDAD

### Autenticación
- [ ] Passwords hasheados correctamente
- [ ] Sesiones seguras
- [ ] Logout completo
- [ ] Expiración de sesiones

### Autorización
- [ ] Rutas protegidas
- [ ] Roles funcionan correctamente
- [ ] Acceso denegado para roles incorrectos
- [ ] Audit logs registran acciones

### Validación
- [ ] Inputs validados
- [ ] SQL injection protegido
- [ ] XSS protegido
- [ ] CSRF tokens

---

## 🐛 GESTIÓN DE ERRORES

### Errores de Red
- [ ] API no disponible
- [ ] Timeout de requests
- [ ] Conexión perdida
- [ ] Errores 500

### Errores de Usuario
- [ ] Credenciales incorrectas
- [ ] Campos requeridos
- [ ] Formatos inválidos
- [ ] Permisos insuficientes

### Errores de Sistema
- [ ] Base de datos no disponible
- [ ] Memoria insuficiente
- [ ] Archivos no encontrados
- [ ] Servicios externos caídos

---

## ✅ FLUJOS CRÍTICOS

### Flujo Completo Usuario
- [ ] 1. Registro/Login
- [ ] 2. Explorar ofertas
- [ ] 3. Añadir favoritos
- [ ] 4. Generar cupón
- [ ] 5. Usar cupón en empresa
- [ ] 6. Verificar historial

### Flujo Completo Empresa
- [ ] 1. Registro empresa
- [ ] 2. Aprobación admin
- [ ] 3. Login empresa
- [ ] 4. Crear oferta
- [ ] 5. Publicar oferta
- [ ] 6. Recibir cupones
- [ ] 7. Validar cupones

### Flujo Completo Admin
- [ ] 1. Login super admin
- [ ] 2. Revisar audit logs
- [ ] 3. Gestionar empresas pendientes
- [ ] 4. Moderar ofertas
- [ ] 5. Gestionar usuarios
- [ ] 6. Ver métricas

---

## 📊 RESUMEN FINAL

### Bugs Encontrados
- **Críticos:** _____ (blocking)
- **Altos:** _____ (importante)
- **Medios:** _____ (menor)
- **Bajos:** _____ (cosmético)

### Tests Ejecutados
- **Total:** _____
- **Pasados:** _____
- **Fallidos:** _____
- **Skipped:** _____

### Conclusión
- [ ] ✅ Production Ready
- [ ] ⚠️ Needs Minor Fixes
- [ ] ❌ Major Issues Found

**Notas adicionales:**
_________________________________
_________________________________
_________________________________