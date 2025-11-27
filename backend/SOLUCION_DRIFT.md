# Solución para Drift de Migraciones Prisma

## Problema
La base de datos tiene un estado diferente al historial de migraciones de Prisma. Esto es común cuando:
- La base de datos se creó manualmente
- Se aplicaron cambios directamente en la DB
- El historial de migraciones se perdió

## Solución Recomendada: Migración Baseline

### Opción 1: Crear Migración Baseline (Recomendado)

Esto marca el estado actual de la base de datos como el punto de partida:

```bash
cd backend

# 1. Crear una migración baseline que refleje el estado actual
npx prisma migrate dev --create-only --name baseline_current_state

# 2. Marcar esta migración como aplicada sin ejecutarla
npx prisma migrate resolve --applied baseline_current_state

# 3. Ahora puedes crear nuevas migraciones normalmente
npx prisma migrate dev --name add_performance_indexes
```

### Opción 2: Resetear Base de Datos (Solo Desarrollo)

⚠️ **ADVERTENCIA: Esto borrará todos los datos**

```bash
cd backend
npx prisma migrate reset
```

Luego aplicar las migraciones:
```bash
npx prisma migrate dev --name add_performance_indexes
```

### Opción 3: Aplicar Índices Manualmente con SQL

Si no quieres tocar las migraciones, puedes aplicar los índices directamente:

```sql
-- Índices para User
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_isActive_createdAt_idx" ON "User"("isActive", "createdAt");

-- Índices para Company (si tiene campo status)
-- CREATE INDEX IF NOT EXISTS "Company_status_isActive_idx" ON "Company"("status", "isActive");

-- Índices para Offer
CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status");

-- Índices para CompanyLead (si existe)
CREATE INDEX IF NOT EXISTS "CompanyLead_status_idx" ON "CompanyLead"("status");
CREATE INDEX IF NOT EXISTS "CompanyLead_createdAt_idx" ON "CompanyLead"("createdAt");
```

## Verificar Estado

Después de aplicar la solución:

```bash
# Verificar estado de migraciones
npx prisma migrate status

# Verificar que los índices se crearon
npx prisma db execute --stdin <<< "SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('User', 'Company', 'Offer') ORDER BY tablename, indexname;"
```

## Nota Importante

El schema del **backend** es diferente al del **frontend**. Los índices que añadí están en el schema del frontend (`frontend/prisma/schema.prisma`), pero las migraciones se están ejecutando desde el backend.

**Solución:** Aplicar los índices al schema correcto según dónde se ejecuten las consultas del dashboard.








