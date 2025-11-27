# Aplicar Índices de Rendimiento

## Método Recomendado: SQL Directo

Dado el drift en las migraciones, la forma más segura es aplicar los índices directamente con SQL:

### Opción 1: Desde psql

```bash
cd backend
psql postgresql://lapublica:dev123@localhost:5432/lapublica_dev -f add_performance_indexes.sql
```

### Opción 2: Desde Prisma Studio

1. Abre Prisma Studio: `npx prisma studio`
2. Ve a la pestaña "Raw SQL"
3. Copia y pega el contenido de `add_performance_indexes.sql`
4. Ejecuta

### Opción 3: Desde pgAdmin o DBeaver

1. Conecta a la base de datos
2. Abre una consulta SQL
3. Copia y pega el contenido de `add_performance_indexes.sql`
4. Ejecuta

## Verificar que se aplicaron

```sql
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('User', 'Company', 'Offer', 'CompanyLead')
ORDER BY tablename, indexname;
```

## Después de aplicar

Una vez aplicados los índices, puedes:

1. **Marcar la migración como resuelta** (si quieres mantener el historial):
```bash
npx prisma migrate resolve --applied add_performance_indexes
```

2. **O simplemente continuar** - los índices ya están aplicados y funcionando

## Nota

Los índices se aplican inmediatamente y mejoran el rendimiento sin afectar los datos existentes.








