# 🐛 BUG REPORT TEMPLATE

## Información Básica
- **ID**: BUG-XXX
- **Fecha**: _______________
- **Tester**: _______________
- **Severidad**: [ ] CRITICAL [ ] HIGH [ ] MEDIUM [ ] LOW
- **Estado**: [ ] NUEVO [ ] EN PROGRESO [ ] RESUELTO [ ] CERRADO

---

## 📝 Descripción del Bug

### Resumen
*Descripción breve y clara del problema*

### Comportamiento Esperado
*¿Qué debería pasar?*

### Comportamiento Actual
*¿Qué está pasando realmente?*

---

## 🔄 Pasos para Reproducir

1.
2.
3.
4.

---

## 🌍 Entorno

- **URL**:
- **Browser**: [ ] Chrome [ ] Firefox [ ] Safari [ ] Edge
- **Versión Browser**:
- **OS**: [ ] Windows [ ] macOS [ ] Linux
- **Dispositivo**: [ ] Desktop [ ] Tablet [ ] Mobile
- **Resolución**:

---

## 👤 Usuario de Prueba

- **Rol**: [ ] SUPER_ADMIN [ ] ADMIN [ ] USER [ ] EMPRESA [ ] GESTOR
- **Email**:
- **Autenticado**: [ ] SÍ [ ] NO

---

## 📸 Evidencia

### Screenshots
- [ ] Screenshot adjuntado: `evidence/BUG-XXX-screenshot.png`
- [ ] Video adjuntado: `evidence/BUG-XXX-video.mp4`

### Logs de Consola
```
[Pegar logs de browser console aquí]
```

### Logs de Servidor
```
[Pegar logs de servidor aquí si son relevantes]
```

### Network/API Errors
```
[Pegar errores de network tab aquí]
```

---

## 🔍 Análisis Técnico

### Área Afectada
- [ ] Frontend (React/NextJS)
- [ ] Backend (API Routes)
- [ ] Base de Datos (PostgreSQL)
- [ ] Autenticación (NextAuth)
- [ ] UI/UX
- [ ] Performance

### Componente Específico
*¿Qué componente o archivo está involucrado?*

### API Endpoints Afectados
*Si aplica, listar endpoints que fallan*

---

## 💥 Impacto

### Funcionalidades Afectadas
- [ ] Login/Logout
- [ ] Dashboard
- [ ] Gestión Empresas
- [ ] Gestión Usuarios
- [ ] Audit Logs
- [ ] Generación Cupones
- [ ] Validación Cupones
- [ ] Notificaciones
- [ ] Otros: _______________

### Usuarios Afectados
- [ ] Solo este rol específico
- [ ] Múltiples roles
- [ ] Todos los usuarios
- [ ] Solo en ciertos dispositivos

### Workaround Disponible
- [ ] SÍ - Describir: _______________
- [ ] NO

---

## 🔧 Investigación Adicional

### Tests Adicionales Realizados
*¿Qué más has probado?*

### Patrones Identificados
*¿Se reproduce siempre? ¿Solo en ciertas condiciones?*

### Posible Causa
*Si tienes una teoría sobre qué está causando el bug*

---

## ⚡ Prioridad y Urgencia

### Justificación de Severidad
*¿Por qué has asignado esta severidad?*

### Bloquea Testing
- [ ] SÍ - Este bug bloquea continuar con testing
- [ ] NO - Se puede continuar testing otras áreas

### Bloquea Release
- [ ] SÍ - Debe arreglarse antes de producción
- [ ] NO - Se puede arreglar en siguiente iteración

---

## 📋 Checklist de Reporte

- [ ] Título descriptivo
- [ ] Severidad asignada
- [ ] Pasos claros para reproducir
- [ ] Screenshot/video adjuntado
- [ ] Logs incluidos
- [ ] Entorno especificado
- [ ] Impacto evaluado
- [ ] Workaround documentado (si existe)

---

## 📧 Notificaciones

### Desarrollador Asignado
*Si conoces quién debería verlo*

### Stakeholders a Notificar
- [ ] Product Owner
- [ ] Tech Lead
- [ ] QA Team
- [ ] Customer Support

---

## 💬 Comentarios Adicionales

*Cualquier información adicional que pueda ser útil*

---

**Instrucciones:**
1. Llenar todos los campos aplicables
2. Adjuntar screenshots/videos en carpeta `evidence/`
3. Guardar como `bugs/BUG-XXX.md` donde XXX es número consecutivo
4. Notificar al equipo apropiado
5. Seguir el bug hasta su resolución