-- Script para preparar datos de testing end-to-end
-- La Pública - Sistema de Planes y Notificaciones
-- Ejecutar desde Prisma Studio o pgAdmin

-- ==================================================================
-- 1. AJUSTAR TRIAL DE PIONERES PARA GENERAR NOTIFICACIÓN WARNING
-- ==================================================================

-- Ajustar trial para que acabe en 15 días (alerta amarilla)
UPDATE "Subscription"
SET "trialEndsAt" = NOW() + INTERVAL '15 days'
WHERE "planId" = (SELECT id FROM "PlanConfig" WHERE tier = 'PIONERES');

-- Verificar que se aplicó correctamente
SELECT
  c.name as empresa,
  pc.tier as plan,
  s."trialEndsAt",
  EXTRACT(DAY FROM (s."trialEndsAt" - NOW())) as dias_restantes
FROM "Company" c
JOIN "Subscription" s ON s."companyId" = c.id
JOIN "PlanConfig" pc ON pc.id = s."planId"
WHERE pc.tier = 'PIONERES';

-- ==================================================================
-- 2. VERIFICAR LÍMITES ACTUALES DE TODAS LAS EMPRESAS
-- ==================================================================

SELECT
  c.name as empresa,
  c.email,
  pc.tier as plan,
  pc."limiteOfertas",
  (SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) as ofertas_usadas,
  ROUND((SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) * 100.0 / pc."limiteOfertas", 1) as porcentaje_ofertas,
  pc."limiteExtras",
  (SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id) as extras_usados,
  pc."limiteEmpleados",
  (SELECT COUNT(*) FROM "Employee" WHERE "companyId" = c.id) as empleados_usados,
  pc."limiteUsuaris",
  (SELECT COUNT(*) FROM "User" WHERE "companyId" = c.id) as usuaris_usados
FROM "Company" c
JOIN "Subscription" s ON s."companyId" = c.id
JOIN "PlanConfig" pc ON pc.id = s."planId"
ORDER BY pc.tier;

-- ==================================================================
-- 3. CREAR OFERTAS PARA EMPRESA ESTÀNDARD (ALCANZAR 85% DEL LÍMITE)
-- ==================================================================

-- Primero verificar empresa ESTÀNDARD
DO $$
DECLARE
    company_id UUID;
    limite_ofertas INT;
    ofertas_actuales INT;
    target_ofertas INT;
    ofertas_a_crear INT;
    i INT;
BEGIN
    -- Obtener ID de empresa ESTÀNDARD y su límite
    SELECT c.id, pc."limiteOfertas"
    INTO company_id, limite_ofertas
    FROM "Company" c
    JOIN "Subscription" s ON s."companyId" = c.id
    JOIN "PlanConfig" pc ON pc.id = s."planId"
    WHERE c.email = 'estandard@test.cat';

    -- Contar ofertas actuales
    SELECT COUNT(*) INTO ofertas_actuales
    FROM "Oferta"
    WHERE "companyId" = company_id;

    -- Calcular target (85% del límite)
    target_ofertas := FLOOR(limite_ofertas * 0.85);

    -- Calcular cuántas crear
    ofertas_a_crear := target_ofertas - ofertas_actuales;

    RAISE NOTICE 'Empresa ESTÀNDARD:';
    RAISE NOTICE 'Límite ofertas: %', limite_ofertas;
    RAISE NOTICE 'Ofertas actuales: %', ofertas_actuales;
    RAISE NOTICE 'Target (85%%): %', target_ofertas;
    RAISE NOTICE 'Ofertas a crear: %', ofertas_a_crear;

    -- Crear ofertas si es necesario
    IF ofertas_a_crear > 0 THEN
        FOR i IN 1..ofertas_a_crear LOOP
            INSERT INTO "Oferta" (
                id,
                title,
                description,
                "companyId",
                "isActive",
                "createdAt",
                "updatedAt"
            ) VALUES (
                gen_random_uuid(),
                'Oferta de prueba ' || i,
                'Esta es una oferta de prueba para testing de límites. Generada automáticamente para alcanzar el 85% del límite.',
                company_id,
                true,
                NOW(),
                NOW()
            );
        END LOOP;
        RAISE NOTICE 'Creadas % ofertas', ofertas_a_crear;
    ELSE
        RAISE NOTICE 'No es necesario crear más ofertas';
    END IF;
END $$;

-- ==================================================================
-- 4. CREAR EXTRAS PARA EMPRESA ESTRATÈGIC (ALCANZAR 90% DEL LÍMITE)
-- ==================================================================

DO $$
DECLARE
    company_id UUID;
    limite_extras INT;
    extras_actuales INT;
    target_extras INT;
    extras_a_crear INT;
    i INT;
BEGIN
    -- Obtener ID de empresa ESTRATÈGIC y su límite
    SELECT c.id, pc."limiteExtras"
    INTO company_id, limite_extras
    FROM "Company" c
    JOIN "Subscription" s ON s."companyId" = c.id
    JOIN "PlanConfig" pc ON pc.id = s."planId"
    WHERE c.email = 'estrategic@test.cat';

    -- Contar extras actuales
    SELECT COUNT(*) INTO extras_actuales
    FROM "Extra"
    WHERE "companyId" = company_id;

    -- Calcular target (90% del límite)
    target_extras := FLOOR(limite_extras * 0.90);

    -- Calcular cuántos crear
    extras_a_crear := target_extras - extras_actuales;

    RAISE NOTICE 'Empresa ESTRATÈGIC:';
    RAISE NOTICE 'Límite extras: %', limite_extras;
    RAISE NOTICE 'Extras actuales: %', extras_actuales;
    RAISE NOTICE 'Target (90%%): %', target_extras;
    RAISE NOTICE 'Extras a crear: %', extras_a_crear;

    -- Crear extras si es necesario
    IF extras_a_crear > 0 THEN
        FOR i IN 1..extras_a_crear LOOP
            INSERT INTO "Extra" (
                id,
                name,
                description,
                price,
                "companyId",
                "isActive",
                "createdAt",
                "updatedAt"
            ) VALUES (
                gen_random_uuid(),
                'Extra de prueba ' || i,
                'Este es un extra de prueba para testing de límites. Generado automáticamente para alcanzar el 90% del límite.',
                9.99,
                company_id,
                true,
                NOW(),
                NOW()
            );
        END LOOP;
        RAISE NOTICE 'Creados % extras', extras_a_crear;
    ELSE
        RAISE NOTICE 'No es necesario crear más extras';
    END IF;
END $$;

-- ==================================================================
-- 5. VERIFICACIÓN FINAL - MOSTRAR NUEVOS PORCENTAJES
-- ==================================================================

SELECT
  c.name as empresa,
  c.email,
  pc.tier as plan,

  -- Ofertas
  CONCAT(
    (SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id),
    '/',
    pc."limiteOfertas",
    ' (',
    ROUND((SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) * 100.0 / pc."limiteOfertas", 1),
    '%)'
  ) as ofertas,

  -- Extras
  CONCAT(
    (SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id),
    '/',
    pc."limiteExtras",
    ' (',
    ROUND((SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id) * 100.0 / pc."limiteExtras", 1),
    '%)'
  ) as extras,

  -- Empleados
  CONCAT(
    (SELECT COUNT(*) FROM "Employee" WHERE "companyId" = c.id),
    '/',
    pc."limiteEmpleados"
  ) as empleados,

  -- Usuarios
  CONCAT(
    (SELECT COUNT(*) FROM "User" WHERE "companyId" = c.id),
    '/',
    pc."limiteUsuaris"
  ) as usuarios,

  -- Estado de trial
  CASE
    WHEN pc.tier = 'PIONERES' THEN
      CONCAT('Trial: ', EXTRACT(DAY FROM (s."trialEndsAt" - NOW())), ' días')
    ELSE 'Plan pagado'
  END as estado_trial

FROM "Company" c
JOIN "Subscription" s ON s."companyId" = c.id
JOIN "PlanConfig" pc ON pc.id = s."planId"
ORDER BY pc.tier;

-- ==================================================================
-- 6. RESUMEN DE NOTIFICACIONES ESPERADAS
-- ==================================================================

SELECT
  'RESUMEN DE NOTIFICACIONES ESPERADAS TRAS EJECUTAR ESTE SCRIPT' as titulo;

SELECT
  c.name as empresa,
  c.email,
  CASE
    -- Trial ending (PIONERES)
    WHEN pc.tier = 'PIONERES' AND EXTRACT(DAY FROM (s."trialEndsAt" - NOW())) <= 30
    THEN '⚠️  WARNING: Trial ending en ' || EXTRACT(DAY FROM (s."trialEndsAt" - NOW())) || ' días'

    -- Límites excedidos (>100%)
    WHEN (SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) > pc."limiteOfertas"
    THEN '🚨 ERROR: Límite ofertas excedido'
    WHEN (SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id) > pc."limiteExtras"
    THEN '🚨 ERROR: Límite extras excedido'

    -- Límites en warning (>80%)
    WHEN (SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) >= pc."limiteOfertas" * 0.8
    THEN '⚠️  WARNING: Límite ofertas en ' || ROUND((SELECT COUNT(*) FROM "Oferta" WHERE "companyId" = c.id) * 100.0 / pc."limiteOfertas", 1) || '%'
    WHEN (SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id) >= pc."limiteExtras" * 0.8
    THEN '⚠️  WARNING: Límite extras en ' || ROUND((SELECT COUNT(*) FROM "Extra" WHERE "companyId" = c.id) * 100.0 / pc."limiteExtras", 1) || '%'

    ELSE '✅ Sin notificaciones'
  END as notificaciones_esperadas

FROM "Company" c
JOIN "Subscription" s ON s."companyId" = c.id
JOIN "PlanConfig" pc ON pc.id = s."planId"
ORDER BY pc.tier;

-- ==================================================================
-- 7. INSTRUCCIONES DE TESTING
-- ==================================================================

SELECT
  'INSTRUCCIONES PARA EL TESTING:' as titulo;

SELECT
  '1. Ejecutar este script SQL completo' as paso_1,
  '2. Reiniciar servidor: npm run dev' as paso_2,
  '3. Login con pionera@test.cat - Verificar notificación trial' as paso_3,
  '4. Login con estandard@test.cat - Verificar notificación límites' as paso_4,
  '5. Login con estrategic@test.cat - Verificar notificación límites' as paso_5,
  '6. Verificar badge cuenta notificaciones correctamente' as paso_6,
  '7. Verificar widget sidebar muestra barras amarillas/rojas' as paso_7,
  '8. Probar flujo completo de upgrade entre planes' as paso_8;