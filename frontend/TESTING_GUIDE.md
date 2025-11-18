# 🧪 GUÍA DE TESTING - LA PÚBLICA

## PASO A PASO PARA TESTING COMPLETO

---

## FLUJO 1: SUPER ADMIN - AUDIT LOGS 🔍

### Objetivo: Verificar que el sistema de auditoría funciona correctamente

#### Pasos:
1. **Acceder como Super Admin**
   ```
   URL: http://localhost:3000/login
   Email: super.admin@lapublica.cat
   Password: superadmin123
   ```
   - Hacer clic en "Login Rápido" del Super Administrador
   - Verificar redirección a `/admin`

2. **Navegar a Audit Logs**
   - Clic en "Logs de Auditoría" en el sidebar
   - URL debería ser: `/admin/logs`
   - Verificar que carga la tabla de logs

3. **Testing de Filtros**
   - **Filtro por Fecha**: Seleccionar "Hoy" y verificar resultados
   - **Filtro por Usuario**: Elegir un usuario específico
   - **Filtro por Acción**: Filtrar por "LOGIN", "CREATE", "UPDATE", etc.
   - **Búsqueda**: Buscar por término específico (ej: "admin")

4. **Testing de Funcionalidades**
   - **Paginación**: Navegar entre páginas
   - **Auto-refresh**: Esperar 30s y verificar actualización
   - **Exportar**: Hacer clic en "Exportar" y descargar CSV
   - **Clear Filters**: Limpiar todos los filtros

#### ✅ Criterios de Éxito:
- Logs se cargan correctamente
- Todos los filtros funcionan
- Paginación responsive
- Auto-refresh cada 30s
- Exportación genera CSV válido

---

## FLUJO 2: GESTIÓN EMPRESAS 🏢

### Objetivo: Probar la gestión completa de empresas

#### Pasos:
1. **Acceder a Gestión de Empresas**
   ```
   Como: Super Admin
   URL: /admin/empresas/listar
   ```

2. **Verificar Lista de Empresas**
   - Comprobar que se cargan empresas
   - Verificar estados: PUBLISHED, PENDING, REJECTED
   - Probar filtros por estado

3. **Aprobar Empresa Pendiente**
   - Buscar empresa con estado PENDING
   - Hacer clic en "Aprobar"
   - Verificar cambio de estado
   - Comprobar log en audit logs

4. **Rechazar Empresa**
   - Buscar otra empresa PENDING
   - Hacer clic en "Rechazar"
   - Añadir razón de rechazo
   - Verificar estado actualizado

#### ✅ Criterios de Éxito:
- Estados cambian correctamente
- Acciones se registran en audit logs
- Filtros funcionan
- Empresa recibe notificación

---

## FLUJO 3: USUARIO FINAL - CUPONES 🎫

### Objetivo: Testing completo del flujo de cupones

#### Pasos:
1. **Login como Empleado Público**
   ```
   Email: laura.garcia@generalitat.cat
   Password: empleat123
   ```

2. **Explorar Ofertas**
   - Navegar a ofertas disponibles
   - Usar filtros por categoría
   - Usar buscador
   - Añadir ofertas a favoritos

3. **Generar Cupón**
   - Seleccionar una oferta activa
   - Hacer clic en "Conseguir Cupón"
   - Verificar generación de QR code
   - Comprobar que aparece en "Mis Cupones"

4. **Ver Historial**
   - Navegar a "Mis Cupones"
   - Verificar cupón recién creado
   - Comprobar estado "ACTIVE"
   - Ver detalles del cupón

#### ✅ Criterios de Éxito:
- Cupón se genera correctamente
- QR code es válido
- Aparece en historial usuario
- Evento se registra en audit logs

---

## FLUJO 4: EMPRESA - VALIDACIÓN CUPONES 💼

### Objetivo: Probar validación de cupones desde panel empresa

#### Pasos:
1. **Login como Empresa**
   ```
   Email: joan.perez@empresadeprova.cat
   Password: owner123
   ```

2. **Acceder a Cupones**
   - Navegar a sección de cupones
   - Ver lista de cupones activos
   - Verificar estadísticas de uso

3. **Validar Cupón**
   - Usar cupón generado en Flujo 3
   - Escanear QR o introducir código manualmente
   - Marcar como usado
   - Verificar cambio de estado

4. **Ver Reportes**
   - Navegar a reportes de cupones
   - Verificar métricas de conversión
   - Exportar reporte si disponible

#### ✅ Criterios de Éxito:
- Cupón se valida correctamente
- Estado cambia a "USED"
- Métricas se actualizan
- Usuario recibe confirmación

---

## FLUJO 5: RESPONSIVE TESTING 📱

### Objetivo: Verificar diseño responsive en diferentes dispositivos

#### Dispositivos de Prueba:
- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

#### Pasos por Dispositivo:
1. **Página Principal**
   - Verificar layout responsive
   - Comprobar navegación
   - Probar formularios

2. **Panel Admin** (Desktop/Tablet únicamente)
   - Sidebar responsive
   - Tablas adaptativas
   - Formularios responsive

3. **Panel Usuario** (Todos los dispositivos)
   - Menú hamburguesa en mobile
   - Cards de ofertas adaptativas
   - Formularios mobile-friendly

#### ✅ Criterios de Éxito:
- Sin scroll horizontal
- Elementos accesibles
- Texto legible
- Botones clickeables

---

## FLUJO 6: PERFORMANCE TESTING ⚡

### Objetivo: Verificar rendimiento del sistema

#### Métricas a Medir:
1. **Tiempo de Carga Inicial**
   - Homepage: < 3 segundos
   - Dashboard Admin: < 5 segundos
   - APIs: < 1 segundo

2. **Memoria y CPU**
   - Uso de memoria estable
   - Sin memory leaks
   - CPU usage razonable

#### Herramientas:
- Chrome DevTools (Network tab)
- Lighthouse audit
- Console.log para debug

#### Pasos:
1. **Abrir Chrome DevTools**
2. **Ir a Network tab**
3. **Navegar por diferentes páginas**
4. **Medir tiempos de carga**
5. **Ejecutar Lighthouse audit**

#### ✅ Criterios de Éxito:
- Tiempos bajo límites establecidos
- Lighthouse score > 80
- Sin errores de memoria
- Queries optimizadas

---

## FLUJO 7: TESTING DE ERRORES 🚨

### Objetivo: Verificar gestión de errores

#### Escenarios de Error:
1. **Credenciales Incorrectas**
   - Intentar login con password incorrecto
   - Verificar mensaje de error claro
   - Sin información sensible expuesta

2. **Permisos Insuficientes**
   - Usuario normal accediendo a /admin
   - Verificar redirección o error 403
   - Mensaje apropiado

3. **Datos Inválidos**
   - Enviar formularios con datos incorrectos
   - Verificar validación frontend
   - Verificar validación backend

4. **API No Disponible**
   - Simular desconexión (offline)
   - Verificar mensajes de error
   - Retry mechanisms

#### ✅ Criterios de Éxito:
- Errores manejados graciosamente
- Mensajes claros para usuario
- Sistema no se rompe
- Logs apropiados

---

## FLUJO 8: INTEGRACIÓN COMPLETA 🔄

### Objetivo: Testing de flujo end-to-end completo

#### Escenario: "Empleado usa cupón en empresa"

1. **Admin aprueba empresa nueva**
   - Login como super admin
   - Aprobar empresa pendiente
   - Verificar notificación a empresa

2. **Empresa crea oferta**
   - Login como empresa
   - Crear nueva oferta
   - Publicar oferta

3. **Usuario encuentra y usa oferta**
   - Login como empleado público
   - Buscar nueva oferta
   - Generar cupón
   - Ver QR code

4. **Empresa valida cupón**
   - Login como empresa
   - Validar cupón del usuario
   - Confirmar uso

5. **Admin revisa actividad**
   - Login como admin
   - Revisar audit logs
   - Verificar todas las acciones registradas

#### ✅ Criterios de Éxito:
- Flujo completo sin errores
- Todas las acciones en audit logs
- Notificaciones enviadas
- Estados actualizados correctamente

---

## 🔧 HERRAMIENTAS DE TESTING

### Browser DevTools
```javascript
// Debug de estado de usuario
console.log('Session:', await fetch('/api/auth/session').then(r => r.json()));

// Debug de APIs
console.log('Ofertas:', await fetch('/api/ofertas').then(r => r.json()));

// Verificar localStorage
console.log('Local Storage:', localStorage);
```

### Database Queries
```sql
-- Verificar usuarios
SELECT email, role, "userType", "isActive" FROM "User";

-- Verificar audit logs recientes
SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 10;

-- Verificar cupones
SELECT * FROM "Coupon" ORDER BY "createdAt" DESC LIMIT 5;
```

### Health Check Script
```bash
# Ejecutar health check automatizado
node scripts/health-check.js
```

---

## 📝 REPORTING BUGS

### Cuando encuentres un bug:
1. **Parar el testing inmediatamente**
2. **Tomar screenshot**
3. **Anotar pasos para reproducir**
4. **Verificar logs del servidor**
5. **Crear ticket usando BUG_TEMPLATE.md**

### Severidad de Bugs:
- **CRITICAL**: Sistema no funciona
- **HIGH**: Funcionalidad principal rota
- **MEDIUM**: Funcionalidad secundaria rota
- **LOW**: Problema cosmético

---

## ✅ POST-TESTING

### Al completar todos los flujos:
1. **Llenar TESTING_CHECKLIST.md**
2. **Documentar todos los bugs encontrados**
3. **Completar FINAL_REPORT.md**
4. **Ejecutar health check final**
5. **Reportar conclusiones**

### Archivos a Generar:
- `bugs/BUG-001.md` (si hay bugs)
- `FINAL_REPORT.md` completado
- `TESTING_CHECKLIST.md` completado
- Screenshots de evidencia

---

**¡Importante!** Este testing es crucial para asegurar que La Pública está production-ready. Tómate el tiempo necesario y reporta cualquier problema encontrado.