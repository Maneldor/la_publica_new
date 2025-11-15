# 🧪 TESTING END-TO-END - Sistema de Planes La Pública

**Fecha:** 15 Noviembre 2025
**Tester:** Manel
**Versión:** Sistema Planes v1.0
**Servidor:** http://localhost:3000

---

## 📋 PREPARACIÓN DEL TESTING

### ✅ Pre-requisitos
- [ ] Servidor corriendo: `npm run dev`
- [ ] Base datos con 4 empresas de prueba
- [ ] Script SQL ejecutado: `test-data-setup.sql`
- [ ] Prisma Studio disponible (opcional)

### 👥 Usuarios de prueba
| Email | Password | Plan | Uso esperado |
|-------|----------|------|---------------|
| pionera@test.cat | Password123! | PIONERES | Trial 15 días |
| estandard@test.cat | Password123! | ESTÀNDARD | Límites ~85% |
| estrategic@test.cat | Password123! | ESTRATÈGIC | Límites ~90% |
| enterprise@test.cat | Password123! | ENTERPRISE | Sin límites |

---

## 1️⃣ TESTING WIDGET LÍMITES (SIDEBAR)

### 🎯 Objetivo
Verificar que el widget de límites en sidebar muestra información correcta y actualizada.

### 📍 Ubicación
Sidebar izquierdo de todas las páginas `/empresa/*`

### ✅ Tests básicos
- [ ] **Widget visible** - Aparece en sidebar de todas las empresas
- [ ] **Título correcto** - "Límits del meu pla"
- [ ] **4 recursos** - Muestra ofertes, extres, empleats, usuaris
- [ ] **Formato correcto** - "X/Y utilitzats" para cada recurso
- [ ] **Loading state** - Skeleton/spinner mientras carga
- [ ] **Error handling** - Manejo si falla la carga

### 🎨 Tests visuales
- [ ] **Barras de progreso** - 4 barras visibles
- [ ] **Colores dinámicos**:
  - [ ] Verde cuando <80% del límite
  - [ ] Amarillo cuando 80-100% del límite
  - [ ] Rojo cuando >100% del límite
- [ ] **Porcentajes** - Se muestran correctamente
- [ ] **Responsive** - Se ve bien en móvil/tablet

### 🔗 Tests de navegación
- [ ] **Botón "Veure detalls"** - Presente y funcional
- [ ] **Link correcto** - Va a `/empresa/pla`
- [ ] **Click funciona** - Navega correctamente

### 🚨 Tests de alertas
- [ ] **Alerta límite** - Aparece si algún límite >100%
- [ ] **Color rojo** - Alerta tiene borde/fondo rojo
- [ ] **Mensaje claro** - "Has superat alguns límits del teu pla"

### 📊 Tests por empresa

#### PIONERES (pionera@test.cat)
- [ ] **Límites bajos** - 5 ofertes, 3 extres, 2 empleats, 3 usuaris
- [ ] **Estado actual**: _____/_____
- [ ] **Colores correctos** según uso

#### ESTÀNDARD (estandard@test.cat)
- [ ] **Límites medios** - 20 ofertes, 10 extres, 5 empleats, 8 usuaris
- [ ] **Estado actual**: _____/_____
- [ ] **~85% ofertas** - Barra amarilla tras ejecutar script SQL

#### ESTRATÈGIC (estrategic@test.cat)
- [ ] **Límites altos** - 100 ofertes, 50 extres, 20 empleats, 30 usuaris
- [ ] **Estado actual**: _____/_____
- [ ] **~90% extras** - Barra amarilla tras ejecutar script SQL

#### ENTERPRISE (enterprise@test.cat)
- [ ] **Límites ilimitados** - 999999 en todos
- [ ] **Estado actual**: _____/_____
- [ ] **Barras verdes** - Siempre <1%

---

## 2️⃣ TESTING SISTEMA NOTIFICACIONES

### 🎯 Objetivo
Verificar funcionamiento completo del sistema de notificaciones: badge, panel, API.

### 🔔 Tests Badge (Header)

#### Ubicación y visibilidad
- [ ] **Badge presente** - Visible en header empresa
- [ ] **Icono campana** - Bell icon de Lucide
- [ ] **Posición correcta** - Entre mensaje y avatar usuario

#### Contador numérico
- [ ] **Contador visible** - Solo si unreadCount > 0
- [ ] **Números correctos** - Coincide con notificaciones sin leer
- [ ] **Máximo 9+** - Muestra "9+" si >9 notificaciones
- [ ] **Badge oculto** - No aparece si unreadCount = 0

#### Colores dinámicos
- [ ] **Rojo si errors** - hasErrors = true
- [ ] **Amarillo si warnings** - hasWarnings = true (sin errors)
- [ ] **Azul por defecto** - Solo notificaciones info
- [ ] **Transición suave** - Cambio de color animado

#### Efectos especiales
- [ ] **Ping animation** - Solo en errores críticos
- [ ] **Hover effect** - Cambia color al pasar ratón
- [ ] **Click funcional** - Abre panel lateral

### 📱 Tests Panel de Notificaciones

#### Comportamiento de apertura/cierre
- [ ] **Slide-in desde derecha** - Animación smooth
- [ ] **Overlay background** - Fondo semitransparente
- [ ] **Click outside** - Cierra al hacer click fuera
- [ ] **Botón X** - Cierra al hacer click en X
- [ ] **Escape key** - Cierra con tecla Escape (si implementado)

#### Header del panel
- [ ] **Título "Notificacions"** - Presente y visible
- [ ] **Contador sin leer** - "X sense llegir" si >0
- [ ] **Botón cerrar** - X funcional
- [ ] **Fondo slate-800** - Color correcto

#### Botón "Marcar todas"
- [ ] **Visible si unread > 0** - Solo aparece con notificaciones sin leer
- [ ] **Funcionalidad** - Marca todas como leídas
- [ ] **Actualiza contador** - Badge se actualiza inmediatamente
- [ ] **Estado persiste** - Al reabrir panel sigue marcado

#### Lista de notificaciones
- [ ] **Loading state** - Skeleton mientras carga
- [ ] **Estado vacío** - Mensaje "No tens notificacions"
- [ ] **Scroll** - Lista scrolleable si muchas notificaciones
- [ ] **Orden por prioridad** - Critical > High > Medium > Low

#### Items individuales
- [ ] **Iconos por tipo**:
  - [ ] AlertCircle (rojo) para error
  - [ ] AlertTriangle (amarillo) para warning
  - [ ] CheckCircle (verde) para success
  - [ ] Info (azul) para info
- [ ] **Colores de fondo** por tipo
- [ ] **Título destacado** - Negrita
- [ ] **Mensaje descriptivo** - Texto claro
- [ ] **Timestamp** - Fecha/hora relativa
- [ ] **Estado read/unread** - Fondo diferente

#### Acciones por notificación
- [ ] **Botón acción principal** - "Veure més", "Veure plans", etc.
- [ ] **Link funcional** - Va a URL correcta
- [ ] **Marcar como leída** - Al hacer click en acción
- [ ] **Botón individual** - "Marcar com llegida"
- [ ] **Cerrar panel** - Tras hacer click en acción

### 🔄 Tests API notificaciones

#### Endpoint `/api/empresa/notifications`
- [ ] **Requiere autenticación** - 401 si no autenticado
- [ ] **Status 200** - Responde correctamente autenticado
- [ ] **Formato JSON** correcto:
```json
{
  "notifications": [...],
  "unreadCount": 3,
  "hasWarnings": true,
  "hasErrors": false
}
```

#### Auto-refresh
- [ ] **Cada 5 minutos** - Se actualiza automáticamente
- [ ] **No bloquea UI** - Actualizaciones en background
- [ ] **Manejo de errores** - Silencioso si falla

### 📬 Tests Notificaciones Trial Ending

#### Con PIONERES (15 días restantes)
- [ ] **Notificación aparece** - Tipo warning, prioridad high
- [ ] **Título correcto** - "El teu període de prova acaba aviat"
- [ ] **Días exactos** - "Només queden 15 dies per renovar..."
- [ ] **Botón acción** - "Veure plans disponibles"
- [ ] **Link correcto** - Va a `/empresa/plans`
- [ ] **Icono warning** - AlertTriangle amarillo
- [ ] **Fondo amarillo** - border-l-4 border-yellow-500

### 📊 Tests Notificaciones Límites

#### Scenario: ESTÀNDARD con 85% ofertas
- [ ] **Notificación warning** - Aparece automáticamente
- [ ] **Título límites** - "Estàs apropant-te al límit d'ofertes"
- [ ] **Porcentaje exacto** - "Has utilitzat el 85% del teu límit"
- [ ] **Botón acción** - "Veure detalls del pla"
- [ ] **Link correcto** - Va a `/empresa/pla`
- [ ] **Prioridad MEDIUM** - Aparece tras críticas

#### Scenario: Crear límite >100%
- [ ] **Notificación error** - Aparece inmediatamente
- [ ] **Título error** - "Has superat el límit d'ofertes"
- [ ] **Mensaje crítico** - Indica acción necesaria
- [ ] **Botón upgrade** - "Actualitzar pla"
- [ ] **Link planes** - Va a `/empresa/plans`
- [ ] **Prioridad HIGH** - Aparece primero
- [ ] **Color rojo** - Alert visual

---

## 3️⃣ TESTING DASHBOARD MI PLAN

### 🎯 Objetivo
Verificar página `/empresa/pla` muestra información completa y actualizada.

### 📍 URL
`/empresa/pla`

### 🎨 Tests elementos visuales

#### Card principal del plan
- [ ] **Card grande** - Ocupa ancho completo
- [ ] **Gradient azul** - Fondo degradado
- [ ] **Nombre del plan** - Destacado y grande
- [ ] **Responsive** - Se adapta a móvil

#### Badge trial (solo PIONERES)
- [ ] **Badge visible** - Solo para planes trial
- [ ] **Texto "PROVA GRATUÏTA"** - En color claro
- [ ] **Posición correcta** - Junto al nombre del plan

#### Alerta trial ending
- [ ] **Aparece si <30 días** - Warning visible
- [ ] **Color amarillo** - Fondo warning
- [ ] **Días restantes** - Número exacto
- [ ] **Mensaje claro** - Llama a la acción

#### Lista de funcionalidades
- [ ] **Checks verdes** - Icons de CheckCircle
- [ ] **Funcionalidades del plan** - Listado completo
- [ ] **Texto claro** - Descripción entendible
- [ ] **Formato lista** - Organizado verticalmente

### 📊 Tests barras de progreso

#### 4 recursos monitorizados
- [ ] **Ofertes** - Barra presente
- [ ] **Extres** - Barra presente
- [ ] **Empleats** - Barra presente
- [ ] **Usuaris** - Barra presente

#### Información por barra
- [ ] **Título recurso** - Nombre claro
- [ ] **Uso actual** - Número usado
- [ ] **Límite total** - Número máximo
- [ ] **Formato "X/Y"** - Ej: "17/20 ofertes"
- [ ] **Porcentaje visual** - Barra llena según %

#### Colores dinámicos
- [ ] **Verde <80%** - bg-green-500
- [ ] **Amarillo 80-100%** - bg-yellow-500
- [ ] **Rojo >100%** - bg-red-500
- [ ] **Transición suave** - Cambio animado

### 🔗 Tests navegación

#### Botón upgrade
- [ ] **Visible si no ENTERPRISE** - Solo planes inferiores
- [ ] **Oculto si ENTERPRISE** - Ya es máximo
- [ ] **Texto correcto** - "Veure plans superiors"
- [ ] **Link funcional** - Va a `/empresa/plans`
- [ ] **Estilo destacado** - Botón call-to-action

### 📋 Tests por empresa

#### PIONERES
- [ ] **Badge trial** - Visible y correcto
- [ ] **Alerta 15 días** - Warning presente
- [ ] **Límites bajos** - 5/3/2/3
- [ ] **Botón upgrade** - Presente
- [ ] **Estado actual**: _____

#### ESTÀNDARD
- [ ] **Sin badge trial** - Plan pagado
- [ ] **Sin alerta** - No trial ending
- [ ] **Límites medios** - 20/10/5/8
- [ ] **85% ofertas** - Barra amarilla
- [ ] **Botón upgrade** - Presente
- [ ] **Estado actual**: _____

#### ESTRATÈGIC
- [ ] **Límites altos** - 100/50/20/30
- [ ] **90% extras** - Barra amarilla
- [ ] **Botón upgrade** - Solo a ENTERPRISE
- [ ] **Estado actual**: _____

#### ENTERPRISE
- [ ] **Límites ilimitados** - 999999 en todo
- [ ] **Sin botón upgrade** - Ya es máximo
- [ ] **Mensaje máximo** - "Ja tens el pla màxim"
- [ ] **Estado actual**: _____

### 📄 Tests sección información

#### Renovación automática
- [ ] **Información presente** - Sección visible
- [ ] **Fecha próxima** - Fecha correcta
- [ ] **Precio próximo** - Importe correcto
- [ ] **Método pago** - Info tarjeta (si configurado)

#### Links de soporte
- [ ] **Contacto** - Link funcional
- [ ] **FAQ** - Link funcional
- [ ] **Política** - Link funcional

---

## 4️⃣ TESTING COMPARADOR DE PLANES

### 🎯 Objetivo
Verificar página `/empresa/plans` filtra y muestra planes correctos según empresa actual.

### 📍 URL
`/empresa/plans`

### 🔍 Tests filtrado de planes

#### PIONERES ve 3 planes superiores
- [ ] **ESTÀNDARD visible** - Card presente
- [ ] **ESTRATÈGIC visible** - Card presente
- [ ] **ENTERPRISE visible** - Card presente
- [ ] **PIONERES oculto** - No aparece (es actual)
- [ ] **Layout 3 columnas** - Grid responsive

#### ESTÀNDARD ve 2 planes superiores
- [ ] **ESTRATÈGIC visible** - Card presente
- [ ] **ENTERPRISE visible** - Card presente
- [ ] **PIONERES oculto** - Plan inferior
- [ ] **ESTÀNDARD oculto** - Plan actual
- [ ] **Layout 2 columnas** - Grid responsive

#### ESTRATÈGIC ve 1 plan superior
- [ ] **ENTERPRISE visible** - Única card
- [ ] **Otros ocultos** - Solo superior disponible
- [ ] **Layout 1 columna** - Centrado

#### ENTERPRISE sin opciones
- [ ] **Mensaje máximo** - "Ja tens el pla màxim"
- [ ] **Sin cards** - No hay planes superiores
- [ ] **Botón volver** - Al dashboard

### 🎨 Tests cards de planes

#### Diseño consistente
- [ ] **Layout uniforme** - Todas cards iguales
- [ ] **Sombra card** - Efecto visual
- [ ] **Padding correcto** - Espaciado interno
- [ ] **Border hover** - Efecto al pasar ratón

#### Información por card
- [ ] **Nombre plan** - Título destacado
- [ ] **Precio mensual** - €X.XX/mes
- [ ] **Funcionalidades** - Lista con checks
- [ ] **Límites destacados** - Números grandes
- [ ] **Descripción clara** - Texto entendible

#### Botón de acción
- [ ] **"Actualitzar a aquest pla"** - Texto correcto
- [ ] **Color destacado** - Botón call-to-action
- [ ] **Click funciona** - Abre modal upgrade
- [ ] **Loading disable** - Se desactiva tras click

#### Plan recomendado
- [ ] **Border azul** - Plan destacado
- [ ] **Badge "POPULAR"** - Si configurado
- [ ] **Posición central** - Destacado visualmente

### 📱 Tests responsive
- [ ] **Mobile** - Cards en columna
- [ ] **Tablet** - 2 columnas máximo
- [ ] **Desktop** - 3 columnas máximo
- [ ] **Scroll horizontal** - Si necesario en móvil

---

## 5️⃣ TESTING MODAL UPGRADE

### 🎯 Objetivo
Verificar modal de upgrade calcula correctamente prorrateo y ejecuta upgrade.

### 🚀 Tests apertura modal

#### Trigger
- [ ] **Click botón plan** - Abre modal
- [ ] **Loading inicial** - Spinner mientras carga datos
- [ ] **Overlay background** - Fondo oscuro semitransparente
- [ ] **Modal centrado** - Posición correcta

#### Estados de carga
- [ ] **Skeleton inicial** - Mientras carga cálculos
- [ ] **Error handling** - Si falla API prorrateo
- [ ] **Retry button** - Si error, botón reintentar

### 📊 Tests información mostrada

#### Cabecera del modal
- [ ] **Plan actual → nuevo** - "ESTÀNDARD → ESTRATÈGIC"
- [ ] **Fecha efectiva** - "Efectiu immediatament"
- [ ] **Botón cerrar** - X funcional

#### Cálculos de prorrateo
- [ ] **Días restantes** - Del ciclo actual
- [ ] **Crédito disponible** - €X.XX del plan actual
- [ ] **Coste inmediato** - €X.XX a pagar HOY
- [ ] **Fórmula visible** - (precio_nuevo - crédito)
- [ ] **Próxima renovación** - Fecha exacta
- [ ] **Precio próximo** - Precio completo del nuevo plan

#### Validación cálculos
- [ ] **Lógica correcta** - Crédito proporcional días restantes
- [ ] **Decimales** - Máximo 2 decimales
- [ ] **Moneda €** - Symbol euro presente
- [ ] **Números positivos** - No negativos (excepto si crédito > precio)

### 📋 Tests grid de mejoras

#### 4 recursos comparados
- [ ] **Ofertes** - Actual → Nuevo
- [ ] **Extres** - Actual → Nuevo
- [ ] **Empleats** - Actual → Nuevo
- [ ] **Usuaris** - Actual → Nuevo

#### Visualización
- [ ] **Números grandes** - Fácil lectura
- [ ] **Flecha visual** - De actual a nuevo
- [ ] **Diferencia destacada** - +X en verde
- [ ] **"Ilimitado"** - Si 999999

### ✨ Tests funcionalidades destacadas

#### Lista de mejoras
- [ ] **Nuevas funcionalidades** - Solo las que se añaden
- [ ] **Checks verdes** - Icons de confirmación
- [ ] **Texto claro** - Descripción entendible
- [ ] **Sin duplicados** - Solo mejoras reales

### ⚠️ Tests avisos importantes

#### 3 avisos legales
- [ ] **Upgrade inmediato** - Cambio al confirmar
- [ ] **Cobro diferencia** - Se cobra hoy la diferencia
- [ ] **Efectivo resto mes** - Válido hasta próxima renovación
- [ ] **Iconos warning** - Visual attention

### 🎬 Tests acciones

#### Botón cancelar
- [ ] **"Cancel·lar"** - Texto correcto
- [ ] **Cierra modal** - Sin cambios
- [ ] **No ejecuta** - No hace upgrade
- [ ] **Vuelve a plans** - Estado anterior

#### Botón confirmar
- [ ] **"Confirmar actualització"** - Texto correcto
- [ ] **Loading state** - Spinner durante proceso
- [ ] **Disable botones** - No múltiple click
- [ ] **Manejo errores** - Si falla API

#### Proceso exitoso
- [ ] **Toast success** - Notificación verde
- [ ] **Mensaje claro** - "Plan actualitzat correctament"
- [ ] **Auto-cierre modal** - Se cierra automáticamente
- [ ] **Redirect/refresh** - Actualiza página

### 🔄 Tests después del upgrade

#### Página se actualiza
- [ ] **Datos nuevos** - Plan actualizado visible
- [ ] **Límites nuevos** - Widget sidebar actualizado
- [ ] **Notificaciones** - Badge actualizado
- [ ] **Estado sincronizado** - Todo coherente

---

## 6️⃣ TESTING FLUJOS COMPLETOS

### 🎯 Objetivo
Probar upgrade end-to-end desde notificación hasta confirmación.

### 🚀 Flujo 1: PIONERES → ESTÀNDARD

#### Setup
- [ ] **Login pionera@test.cat** - Credenciales correctas
- [ ] **Dashboard carga** - Sin errores

#### Notificación trial
- [ ] **Badge muestra contador** - >0 notificaciones
- [ ] **Notificación trial visible** - En panel lateral
- [ ] **Click "Veure plans"** - Va a comparador

#### Comparador
- [ ] **3 planes disponibles** - ESTÀNDARD, ESTRATÈGIC, ENTERPRISE
- [ ] **Selecciona ESTÀNDARD** - Click botón actualizar

#### Modal upgrade
- [ ] **Cálculos correctos** - Prorrateo PIONERES → ESTÀNDARD
- [ ] **Confirmación** - Click confirmar

#### Resultado
- [ ] **Toast success** - Upgrade exitoso
- [ ] **Plan actualizado** - Dashboard muestra ESTÀNDARD
- [ ] **Límites nuevos** - Widget sidebar actualizado
- [ ] **Badge sin trial** - Notificación trial desaparece

#### Estado final ESTÀNDARD
- [ ] **Plan actual**: ESTÀNDARD
- [ ] **Límites**: 20/10/5/8
- [ ] **Sin notificación trial**
- [ ] **Upgrade disponible** - Puede seguir a ESTRATÈGIC

### 🚀 Flujo 2: ESTÀNDARD → ESTRATÈGIC

#### Setup post-upgrade anterior
- [ ] **Plan actual ESTÀNDARD** - Desde flujo anterior O login directo

#### Dashboard actual
- [ ] **Límites 85% ofertas** - Visible en widget (tras script SQL)
- [ ] **Notificación warning** - Límites cerca
- [ ] **Botón upgrade** - Presente en dashboard

#### Comparador
- [ ] **2 planes disponibles** - ESTRATÈGIC, ENTERPRISE
- [ ] **Selecciona ESTRATÈGIC** - Plan medio

#### Modal y confirmación
- [ ] **Prorrateo ESTÀNDARD → ESTRATÈGIC** - Cálculo correcto
- [ ] **Confirma upgrade** - Ejecuta cambio

#### Resultado
- [ ] **Plan ESTRATÈGIC** - Actualizado
- [ ] **Límites altos** - 100/50/20/30
- [ ] **Warning desaparece** - Ya no cerca del límite

### 🚀 Flujo 3: ESTRATÈGIC → ENTERPRISE

#### Último upgrade
- [ ] **Login estrategic@test.cat** - O continuar desde anterior
- [ ] **Plan actual ESTRATÈGIC** - Visible en dashboard
- [ ] **1 upgrade disponible** - Solo ENTERPRISE

#### Upgrade final
- [ ] **Prorrateo final** - Cálculo ESTRATÈGIC → ENTERPRISE
- [ ] **Confirma upgrade** - Último cambio

#### Estado final máximo
- [ ] **Plan ENTERPRISE** - Ya es máximo
- [ ] **Límites ilimitados** - 999999 en todo
- [ ] **Sin upgrade** - No hay planes superiores
- [ ] **Mensaje final** - "Ja tens el pla màxim"

### ✅ Verificación final sincronización

#### Todos los componentes actualizados
- [ ] **Widget sidebar** - Límites correctos del nuevo plan
- [ ] **Dashboard pla** - Plan actual correcto
- [ ] **Comparador** - Planes disponibles correctos
- [ ] **Notificaciones** - Sin alertas innecesarias
- [ ] **Badge** - Contador actualizado

#### APIs responden correctamente
- [ ] **GET /api/empresa/plan** - Plan actualizado
- [ ] **GET /api/empresa/limits** - Límites nuevos
- [ ] **GET /api/empresa/notifications** - Sin notificaciones obsoletas

---

## 7️⃣ TESTING ADMIN PANEL

### 🎯 Objetivo
Verificar panel admin `/admin/plans` funciona correctamente.

### 🔐 Setup admin
- [ ] **Login admin** - Credenciales admin válidas
- [ ] **Acceso autorizado** - Puede ver `/admin/plans`
- [ ] **Interface admin** - Layout diferente a empresa

### 👁️ Tests visualización

#### Vista cards (por defecto)
- [ ] **2 filas layout** - PIONERES arriba, 3 abajo
- [ ] **PIONERES destacado** - Color/diseño diferente
- [ ] **3 planes regulares** - ESTÀNDARD, ESTRATÈGIC, ENTERPRISE
- [ ] **Cards uniformes** - Diseño consistente

#### Toggle vista tabla
- [ ] **Botón toggle** - Presente y funcional
- [ ] **Cambia a tabla** - Layout diferente
- [ ] **Vuelve a cards** - Toggle bidireccional
- [ ] **Mantiene datos** - Información igual

#### Vista tabla
- [ ] **Columnas ordenadas** - Tier, Nombre, Precio, Límites, Estado, Acciones
- [ ] **Datos correctos** - Información completa
- [ ] **Sorting** - Por columnas (si implementado)
- [ ] **Responsive** - Se ve en móvil

### ✏️ Tests edición de planes

#### Modal edición
- [ ] **Click "Editar pla"** - Abre modal
- [ ] **Campos pre-rellenados** - Datos actuales cargados
- [ ] **Formulario completo** - Todos los campos editables

#### Campos editables
- [ ] **Nombre plan** - Input text funcional
- [ ] **Precio mensual** - Input number con validación
- [ ] **Límites** - 4 inputs para recursos
- [ ] **Funcionalidades** - Textarea multilínea

#### Validaciones
- [ ] **Campos requeridos** - Error si vacíos
- [ ] **Precio positivo** - No negativos
- [ ] **Límites válidos** - Números enteros
- [ ] **Formato correcto** - Funcionalidades una por línea

#### Guardado
- [ ] **Botón guardar** - Ejecuta actualización
- [ ] **Loading state** - Spinner durante save
- [ ] **Toast success** - Confirmación guardado
- [ ] **Modal cierra** - Automáticamente tras save
- [ ] **Datos actualizados** - Visible en lista inmediatamente

### 🔄 Tests toggle activo/inactivo

#### Estado visual
- [ ] **Toggle presente** - En cada card/fila
- [ ] **Color azul** - Cuando activo
- [ ] **Color gris** - Cuando inactivo
- [ ] **Estado correcto** - Refleja BD

#### Funcionalidad
- [ ] **Click cambia estado** - Toggle funcional
- [ ] **API call** - Se ejecuta actualización
- [ ] **Toast feedback** - "Pla activat" / "Pla desactivat"
- [ ] **Estado persiste** - Al recargar mantiene cambio

#### Impacto en empresa
- [ ] **Planes inactivos** - No aparecen en comparador empresa
- [ ] **Plan actual inactivo** - Qué pasa? (Edge case)

### ➕ Tests crear nuevo plan

#### Botón crear
- [ ] **"Crear nou pla"** - Presente y visible
- [ ] **Click abre modal** - Modal creación

#### Formulario nuevo plan
- [ ] **Campos vacíos** - Formulario limpio
- [ ] **Mismo layout** - Igual que edición
- [ ] **Validaciones** - Mismas reglas

#### Proceso creación
- [ ] **Rellenar datos** - Información válida
- [ ] **Botón "Crear"** - Ejecuta creación
- [ ] **Toast success** - Confirmación
- [ ] **Aparece en lista** - Nuevo plan visible
- [ ] **Disponible empresa** - Se puede seleccionar

### 🗑️ Tests eliminación (si implementado)
- [ ] **Botón eliminar** - Presente
- [ ] **Confirmación** - Modal "¿Estás seguro?"
- [ ] **Restricciones** - No eliminar si empresas lo usan
- [ ] **Toast confirmación** - Tras eliminar

---

## 8️⃣ TESTING APIS BACKEND

### 🎯 Objetivo
Verificar todas las APIs responden correctamente y con datos válidos.

### 🔧 Setup testing APIs

#### Herramientas
- [ ] **Navegador dev tools** - Network tab
- [ ] **Postman** - Si disponible
- [ ] **curl** - Comandos bash
- [ ] **Usuario autenticado** - Cookie sesión válida

### 📡 GET /api/empresa/plan

#### Request básico
```bash
# Con cookie de sesión del navegador
curl 'http://localhost:3000/api/empresa/plan' \
  -H 'Cookie: next-auth.session-token=...'
```

#### Tests respuesta
- [ ] **Status 200** - Respuesta exitosa
- [ ] **Content-Type JSON** - Header correcto
- [ ] **Estructura correcta**:
```json
{
  "plan": {
    "tier": "ESTÀNDARD",
    "name": "Pla Estàndard",
    "price": 49.99,
    "limiteOfertas": 20,
    "limiteExtras": 10,
    "limiteEmpleados": 5,
    "limiteUsuaris": 8
  },
  "subscription": {
    "planId": "uuid",
    "companyId": "uuid",
    "trialEndsAt": null
  }
}
```

#### Tests validación
- [ ] **Plan correcto** - Coincide con empresa logueada
- [ ] **Datos completos** - Todos los campos presentes
- [ ] **Tipos correctos** - Numbers, strings, booleans

### 📊 GET /api/empresa/limits

#### Tests respuesta
- [ ] **Status 200** - Respuesta exitosa
- [ ] **Estructura correcta**:
```json
{
  "ofertes": { "used": 17, "limit": 20, "percentage": 85 },
  "extres": { "used": 8, "limit": 10, "percentage": 80 },
  "empleats": { "used": 3, "limit": 5, "percentage": 60 },
  "usuaris": { "used": 4, "limit": 8, "percentage": 50 }
}
```

#### Tests cálculos
- [ ] **Conteos correctos** - used refleja BD actual
- [ ] **Porcentajes exactos** - (used/limit) * 100
- [ ] **Límites correctos** - Coinciden con plan

### 🔔 GET /api/empresa/notifications

#### Tests respuesta
- [ ] **Status 200** - Respuesta exitosa
- [ ] **Estructura correcta**:
```json
{
  "notifications": [
    {
      "id": "trial-ending",
      "type": "warning",
      "priority": "high",
      "title": "El teu període de prova acaba aviat",
      "message": "Només queden 15 dies...",
      "actionText": "Veure plans",
      "actionUrl": "/empresa/plans",
      "createdAt": "2025-11-15T10:00:00Z",
      "read": false
    }
  ],
  "unreadCount": 1,
  "hasWarnings": true,
  "hasErrors": false
}
```

#### Tests lógica notificaciones
- [ ] **Trial ending** - Aparece si <30 días (PIONERES)
- [ ] **Límites warning** - Si >80% algún recurso
- [ ] **Límites error** - Si >100% algún recurso
- [ ] **Priorización** - Critical > High > Medium > Low
- [ ] **unreadCount correcto** - Cuenta notificaciones read=false

### 💰 POST /api/empresa/plan/calculate-proration

#### Request
```bash
curl 'http://localhost:3000/api/empresa/plan/calculate-proration' \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{"targetPlanId": "uuid-plan-estrategic"}'
```

#### Tests respuesta
- [ ] **Status 200** - Cálculo exitoso
- [ ] **Estructura correcta**:
```json
{
  "currentPlan": "ESTÀNDARD",
  "targetPlan": "ESTRATÈGIC",
  "daysRemaining": 15,
  "currentPlanCredit": 25.50,
  "targetPlanPrice": 99.99,
  "immediateCharge": 74.49,
  "nextRenewalDate": "2025-12-15",
  "nextRenewalPrice": 99.99
}
```

#### Tests cálculos prorrateo
- [ ] **Días restantes** - Correcto hasta próxima renovación
- [ ] **Crédito proporcional** - (días_restantes/30) * precio_actual
- [ ] **Cargo inmediato** - precio_nuevo - crédito
- [ ] **Fechas correctas** - Próxima renovación exacta

### ⬆️ POST /api/empresa/plan/upgrade

#### Request
```bash
curl 'http://localhost:3000/api/empresa/plan/upgrade' \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{"targetPlanId": "uuid-plan-estrategic"}'
```

#### Tests respuesta
- [ ] **Status 200** - Upgrade exitoso
- [ ] **Estructura correcta**:
```json
{
  "success": true,
  "message": "Pla actualitzat correctament",
  "newPlan": {
    "tier": "ESTRATÈGIC",
    "name": "Pla Estratègic"
  },
  "transaction": {
    "amount": 74.49,
    "description": "Upgrade ESTÀNDARD → ESTRATÈGIC"
  }
}
```

#### Tests efectos secundarios
- [ ] **Subscription actualizada** - BD tiene nuevo planId
- [ ] **Límites actualizados** - Empresa tiene nuevos límites
- [ ] **Notificaciones** - Se recalculan automáticamente

### 🚫 Tests autenticación

#### Sin cookie sesión
- [ ] **Status 401** - Unauthorized
- [ ] **Mensaje error** - "No autenticado"

#### Cookie inválida
- [ ] **Status 401** - Unauthorized
- [ ] **Redirección login** - Si desde navegador

#### Rol incorrecto
- [ ] **Status 403** - Forbidden (si endpoint admin)

---

## 9️⃣ TESTING EDGE CASES

### 🎯 Objetivo
Probar casos extremos y manejo de errores.

### ⚠️ Tests casos límite

#### Empresa sin plan
- [ ] **Manejo graceful** - No crash aplicación
- [ ] **Plan por defecto** - Asignar PIONERES automático
- [ ] **Mensaje error** - Claro para usuario

#### Límites en exacto 100%
- [ ] **Border case 100%** - ¿Warning o error?
- [ ] **Colores correctos** - Consistente con lógica
- [ ] **Notificaciones** - Aparece warning en 100% exacto

#### Empresa ENTERPRISE downgrade
- [ ] **No disponible** - No hay downgrades
- [ ] **UI apropiada** - Mensaje "plan máximo"

#### Trial vencido (días negativos)
- [ ] **Notificación crítica** - Error, no warning
- [ ] **Acceso limitado** - ¿Bloquear funciones?
- [ ] **Call to action** - Upgrade urgente

### 🌐 Tests conectividad

#### API backend caído
- [ ] **Loading state** - Spinner infinito o timeout
- [ ] **Error message** - "Error carregant dades"
- [ ] **Retry mechanism** - Botón reintentar
- [ ] **Graceful degradation** - App sigue funcionando

#### Timeout requests
- [ ] **Timeout después 30s** - No espera infinito
- [ ] **Error handling** - Mensaje apropiado
- [ ] **Estado loading** - Se limpia tras timeout

#### Internet intermitente
- [ ] **Offline detection** - Detecta sin conexión
- [ ] **Queue requests** - Reintenta cuando vuelve
- [ ] **Usuario informado** - Banner offline

### 📱 Tests responsive extremos

#### Móvil muy pequeño (320px)
- [ ] **Widget sidebar** - Se ve completo
- [ ] **Modal upgrade** - Cabe en pantalla
- [ ] **Panel notificaciones** - Ancho apropiado
- [ ] **Botones clickeables** - Min 44px touch target

#### Desktop muy ancho (2560px)
- [ ] **Layout no se rompe** - Max-width apropiado
- [ ] **Cards no se estiran** - Tamaño máximo
- [ ] **Grid responsive** - No demasiadas columnas

### 🔢 Tests datos extremos

#### Números muy grandes
- [ ] **Límite 999999** - Se muestra "Il·limitat"
- [ ] **Uso muy alto** - 50000/50 formatea bien
- [ ] **Precios decimales** - €99.99 formato correcto

#### Strings muy largos
- [ ] **Nombres plan largos** - Trunca con ellipsis
- [ ] **Mensajes notificación** - Wrap texto largo
- [ ] **Funcionalidades** - Lista larga scrolleable

#### Datos vacíos/nulos
- [ ] **Funcionalidades vacías** - No crashea
- [ ] **Descripción null** - Muestra placeholder
- [ ] **Logo empresa null** - Fallback icon

---

## 🐛 BUGS ENCONTRADOS

*Documentar aquí cualquier bug encontrado durante el testing*

### Bug #1
**Descripción:** _______________
**Pasos para reproducir:**
1. _____
2. _____
3. _____

**Esperado:** _______________
**Actual:** _______________
**Severidad:** 🔴 Alta / 🟡 Media / 🟢 Baja
**Estado:** 🔄 Pendiente / ⚡ En progreso / ✅ Resuelto
**Screenshot:** _______________

---

### Bug #2
**Descripción:** _______________
**Pasos para reproducir:**
1. _____
2. _____

**Esperado:** _______________
**Actual:** _______________
**Severidad:** 🔴 Alta / 🟡 Media / 🟢 Baja
**Estado:** 🔄 Pendiente / ⚡ En progreso / ✅ Resuelto

---

### Bug #3
**Descripción:** _______________
**Pasos para reproducir:**
1. _____

**Esperado:** _______________
**Actual:** _______________
**Severidad:** 🔴 Alta / 🟡 Media / 🟢 Baja
**Estado:** 🔄 Pendiente / ⚡ En progreso / ✅ Resuelto

---

## 📊 MÉTRICAS DE TESTING

### ✅ Resumen ejecutivo

**Tests planificados:** 200+
**Tests ejecutados:** ___/200
**Tests pasados:** ___
**Tests fallados:** ___
**% Éxito:** ___%

### 🎯 Cobertura por área

| Área | Tests | Pasados | Fallados | % |
|------|-------|---------|----------|---|
| Widget límites | __/25 | __ | __ | __% |
| Sistema notificaciones | __/40 | __ | __ | __% |
| Dashboard mi plan | __/30 | __ | __ | __% |
| Comparador planes | __/25 | __ | __ | __% |
| Modal upgrade | __/35 | __ | __ | __% |
| Flujos completos | __/20 | __ | __ | __% |
| Admin panel | __/25 | __ | __ | __% |
| APIs backend | __/30 | __ | __ | __% |
| Edge cases | __/20 | __ | __ | __% |

### 🐛 Distribución bugs

**Críticos (bloquean funcionalidad):** __
**Altos (afectan UX significativamente):** __
**Medios (problemas menores):** __
**Bajos (cosméticos):** __

**TOTAL BUGS:** __

### ⏱️ Tiempo de testing

**Inicio:** ___________
**Final:** ___________
**Tiempo total:** ___ horas ___ minutos

**Tiempo por área:**
- Preparación: ___ min
- Widget límites: ___ min
- Notificaciones: ___ min
- Dashboard: ___ min
- Comparador: ___ min
- Modal upgrade: ___ min
- Flujos completos: ___ min
- Admin panel: ___ min
- APIs: ___ min
- Edge cases: ___ min
- Documentación: ___ min

---

## 🎯 CONCLUSIÓN FINAL

### 🚀 Estado del sistema

**Veredicto general:**
- [ ] ✅ **APROBADO** - Sistema listo para producción
- [ ] ⚠️ **APROBADO CON OBSERVACIONES** - Bugs menores a resolver
- [ ] ❌ **RECHAZADO** - Bugs críticos que impiden lanzamiento

### 📋 Funcionalidades validadas

- [ ] ✅ Widget límites sidebar
- [ ] ✅ Badge notificaciones dinámico
- [ ] ✅ Panel notificaciones lateral
- [ ] ✅ Dashboard mi plan
- [ ] ✅ Comparador de planes
- [ ] ✅ Modal upgrade con prorrateo
- [ ] ✅ Flujos completos upgrade
- [ ] ✅ Sincronización componentes
- [ ] ✅ Admin panel CRUD
- [ ] ✅ APIs backend

### 🎊 Lo que funciona bien

1. ________________________________
2. ________________________________
3. ________________________________

### ⚠️ Areas de mejora identificadas

1. ________________________________
2. ________________________________
3. ________________________________

### 🚀 Recomendaciones próximos pasos

1. **Crítico:** _________________________
2. **Alto:** ____________________________
3. **Medio:** ___________________________

### 📝 Notas adicionales

____________________________________________________________________
____________________________________________________________________
____________________________________________________________________

---

## ✅ SIGN-OFF

**QA Tester:** Manel
**Fecha completado:** _______________
**Versión testeada:** Sistema Planes v1.0

**Aprobación:**
- [ ] ✅ Sistema aprobado para producción
- [ ] ⚠️ Aprobado con bugs menores a resolver
- [ ] ❌ Requiere fixing antes de lanzamiento

**Firma digital:** _______________________

---

╔═══════════════════════════════════════════════════════════╗
║     🎉 TESTING END-TO-END COMPLETADO                     ║
║                                                           ║
║  📊 Tests: ___/200+ ejecutados                           ║
║  ✅ Éxito: ___%                                          ║
║  🐛 Bugs: __ encontrados                                 ║
║  🚀 Estado: [APROBADO/OBSERVACIONES/RECHAZADO]           ║
║                                                           ║
║  Sistema de Planes La Pública - Listo para producción    ║
╚═══════════════════════════════════════════════════════════╝